import { getVisibleCategories } from "@/lib/data";
import { jsonOk, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return jsonOk(await getVisibleCategories());
  } catch (error) {
    return serverError(error);
  }
}
