import { getProfile } from "@/lib/data";
import { jsonOk, serverError } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getProfile();
    return jsonOk(profile);
  } catch (error) {
    return serverError(error);
  }
}
