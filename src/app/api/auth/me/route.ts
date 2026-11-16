import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    return jsonOk({
      user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role },
    });
  } catch (error) {
    return serverError(error);
  }
}
