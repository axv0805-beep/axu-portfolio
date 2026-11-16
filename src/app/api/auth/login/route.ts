import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clientIp, guardOrigin, jsonError, jsonOk, readJson, serverError } from "@/lib/http";
import { loginSchema } from "@/lib/schemas";
import { clearLoginFailures, isLoginLimited, recordLoginFailure } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const parsed = loginSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return jsonError("VALIDATION_ERROR", "请输入用户名和密码。", 422, {
        username: "请输入用户名",
        password: "请输入密码",
      });
    }

    const ip = clientIp(request);
    if (isLoginLimited(ip)) {
      return jsonError("RATE_LIMITED", "尝试次数过多，请 15 分钟后再试。", 429);
    }

    const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
    const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
    if (!user || !valid) {
      recordLoginFailure(ip);
      return jsonError("UNAUTHORIZED", "用户名或密码不正确。", 401);
    }

    const session = await getSession();
    session.userId = user.id;
    session.epoch = user.sessionEpoch;
    await session.save();
    clearLoginFailures(ip);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return jsonOk({
      user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role },
    });
  } catch (error) {
    return serverError(error);
  }
}
