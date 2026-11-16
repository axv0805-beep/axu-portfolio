import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { passwordSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);

    const parsed = passwordSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return jsonError("VALIDATION_ERROR", "当前密码不正确。", 422, { currentPassword: "密码不正确" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, sessionEpoch: { increment: 1 } },
    });

    const session = await getSession();
    session.epoch = updated.sessionEpoch;
    await session.save();

    return jsonOk({ updated: true });
  } catch (error) {
    return serverError(error);
  }
}
