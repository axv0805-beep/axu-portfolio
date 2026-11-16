import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { reorderSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);

    const parsed = reorderSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);

    await prisma.$transaction(
      parsed.data.ids.map((id, index) => prisma.work.update({ where: { id }, data: { sortOrder: index } })),
    );

    return jsonOk({ reordered: parsed.data.ids.length });
  } catch (error) {
    return serverError(error);
  }
}
