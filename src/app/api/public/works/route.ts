import { getWorks } from "@/lib/data";
import { jsonError, jsonOk, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? undefined;
    const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1;
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "12", 10) || 12;
    const featuredParam = url.searchParams.get("featured");
    const data = await getWorks({
      type,
      page,
      pageSize,
      featured: featuredParam === "true" ? true : featuredParam === "false" ? false : undefined,
      order: url.searchParams.get("sort") === "oldest" ? "oldest" : "newest",
    });
    if (!data) return jsonError("NOT_FOUND", "分类不存在。", 404);
    return jsonOk({
      items: data.items,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    });
  } catch (error) {
    return serverError(error);
  }
}
