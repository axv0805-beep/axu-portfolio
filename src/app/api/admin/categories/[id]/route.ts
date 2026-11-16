import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { categorySchema } from "@/lib/schemas";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    const { id } = await params;

    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) return jsonError("NOT_FOUND", "分类不存在。", 404);

    const parsed = categorySchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const data = parsed.data;

    if (data.slug !== current.slug) {
      return jsonError("VALIDATION_ERROR", "分类 slug 发布后不可修改。", 422, { slug: "slug 不可修改" });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        isVisible: data.isVisible,
      },
    });
    return jsonOk(category);
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { works: true } } },
    });
    if (!category) return jsonError("NOT_FOUND", "分类不存在。", 404);
    if (category._count.works > 0) {
      return jsonError("CATEGORY_IN_USE", "这个分类下还有作品，不能删除。", 409);
    }

    await prisma.category.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
