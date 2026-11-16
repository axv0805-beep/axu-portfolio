import { apiUser, jsonError, jsonOk, serverError } from "@/lib/http";
import { getAdminStats } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    return jsonOk(await getAdminStats());
  } catch (error) {
    return serverError(error);
  }
}
