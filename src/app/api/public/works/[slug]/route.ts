import { getWorkBySlug } from "@/lib/data";
import { jsonError, jsonOk, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await getWorkBySlug(slug);
    if (!data) return jsonError("NOT_FOUND", "作品不存在或未发布。", 404);
    return jsonOk(data);
  } catch (error) {
    return serverError(error);
  }
}
