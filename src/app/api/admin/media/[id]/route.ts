import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { mediaUpdateSchema } from "@/lib/schemas";
import { removeFile } from "@/lib/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    const { id } = await params;
    const parsed = mediaUpdateSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const media = await prisma.media.update({ where: { id }, data: { originalName: parsed.data.originalName } });
    return jsonOk(media);
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
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return jsonError("NOT_FOUND", "文件不存在。", 404);

    const used = await prisma.work.count({ where: { coverUrl: media.url } });
    if (used > 0) return jsonError("MEDIA_IN_USE", "这个文件正被作品使用，不能删除。", 409);

    await removeFile(media.storageKey);
    await prisma.media.delete({ where: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
