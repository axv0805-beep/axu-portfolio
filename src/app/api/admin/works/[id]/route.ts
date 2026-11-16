import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { workSchema } from "@/lib/schemas";
import { publishErrors } from "@/lib/publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    const { id } = await params;
    const work = await prisma.work.findUnique({ where: { id }, include: { category: true } });
    if (!work) return jsonError("NOT_FOUND", "作品不存在。", 404);
    return jsonOk(work);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    const { id } = await params;

    const current = await prisma.work.findUnique({ where: { id } });
    if (!current) return jsonError("NOT_FOUND", "作品不存在。", 404);

    const parsed = workSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const data = parsed.data;

    if (data.updatedAt) {
      const expected = new Date(data.updatedAt).getTime();
      if (Number.isFinite(expected) && expected !== current.updatedAt.getTime()) {
        return jsonError("STALE_UPDATE", "这件作品在别处被修改过，请刷新后再保存。", 409);
      }
    }

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return jsonError("VALIDATION_ERROR", "分类不存在。", 422, { categoryId: "分类不存在" });

    if (data.status === "published") {
      const errors = publishErrors(data);
      if (Object.keys(errors).length > 0) {
        return jsonError("VALIDATION_ERROR", "发布前还有必填项未完成。", 422, errors);
      }
      if (data.isFeatured) {
        const count = await prisma.work.count({
          where: { isFeatured: true, status: "published", id: { not: id } },
        });
        if (count >= 3) {
          return jsonError("VALIDATION_ERROR", "精选最多 3 件，请先取消其他精选。", 422, {
            isFeatured: "精选最多 3 件",
          });
        }
      }
    }

    const slugOwner = await prisma.work.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (slugOwner && slugOwner.id !== id) {
      return jsonError("SLUG_CONFLICT", "这个 slug 已被其他作品使用。", 409, { slug: "slug 已被占用" });
    }

    const work = await prisma.work.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        categoryId: data.categoryId,
        summary: data.summary,
        coverUrl: data.coverUrl,
        coverAlt: data.coverAlt,
        featuredCoverUrl: data.featuredCoverUrl ?? null,
        year: data.year,
        tools: data.tools as Prisma.InputJsonValue,
        tags: data.tags as Prisma.InputJsonValue,
        role: data.role || null,
        client: data.client || null,
        status: data.status,
        isFeatured: data.status === "published" ? data.isFeatured : false,
        sortOrder: data.sortOrder,
        content: data.content as Prisma.InputJsonValue,
        publishedAt:
          data.status === "published" ? (current.publishedAt ?? new Date()) : current.publishedAt,
      },
    });

    return jsonOk(work);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    const { id } = await params;
    const existing = await prisma.work.findUnique({ where: { id } });
    if (!existing) return jsonError("NOT_FOUND", "作品不存在。", 404);
    await prisma.work.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
