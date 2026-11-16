import { getSession } from "@/lib/auth";
import { guardOrigin, jsonOk, serverError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const session = await getSession();
    session.destroy();
    return jsonOk({ loggedOut: true });
  } catch (error) {
    return serverError(error);
  }
}
