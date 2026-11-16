import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { getAdminWorks } from "@/lib/data";
import { workSchema } from "@/lib/schemas";
import { uniqueWorkSlug } from "@/lib/slug";
import { publishErrors } from "@/lib/publish";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);

    const url = new URL(request.url);
    const data = await getAdminWorks({
      q: url.searchParams.get("q") ?? undefined,
      categoryId: url.searchParams.get("categoryId") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      page: Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1,
      pageSize: Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20,
    });
    return jsonOk(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);

    const parsed = workSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const data = parsed.data;

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return jsonError("VALIDATION_ERROR", "分类不存在。", 422, { categoryId: "分类不存在" });

    if (data.status === "published") {
      const errors = publishErrors(data);
      if (Object.keys(errors).length > 0) {
        return jsonError("VALIDATION_ERROR", "发布前还有必填项未完成。", 422, errors);
      }
      if (data.isFeatured) {
        const count = await prisma.work.count({ where: { isFeatured: true, status: "published" } });
        if (count >= 3) {
          return jsonError("VALIDATION_ERROR", "精选最多 3 件，请先取消其他精选。", 422, {
            isFeatured: "精选最多 3 件",
          });
        }
      }
    }

    const slug = await uniqueWorkSlug(data.slug);
    const work = await prisma.work.create({
      data: {
        title: data.title,
        slug,
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
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });

    return jsonOk(work, 201);
  } catch (error) {
    return serverError(error);
  }
}
