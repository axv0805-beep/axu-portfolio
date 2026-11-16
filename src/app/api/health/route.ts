import { jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ status: "ok", time: new Date().toISOString() });
}
