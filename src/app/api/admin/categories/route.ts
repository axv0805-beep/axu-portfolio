import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { getAdminCategories } from "@/lib/data";
import { categorySchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    return jsonOk(await getAdminCategories());
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

    const parsed = categorySchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const data = parsed.data;

    const slugOwner = await prisma.category.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (slugOwner) {
      return jsonError("SLUG_CONFLICT", "这个 slug 已被使用。", 409, { slug: "slug 已被占用" });
    }

    const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
    const category = await prisma.category.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        slug: data.slug,
        description: data.description,
        isVisible: data.isVisible,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
    return jsonOk(category, 201);
  } catch (error) {
    return serverError(error);
  }
}
