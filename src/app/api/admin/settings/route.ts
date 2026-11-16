import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { getSettings } from "@/lib/data";
import { settingsSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    return jsonOk(await getSettings());
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);

    const parsed = settingsSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const data = parsed.data;

    const entries: { key: string; value: Prisma.InputJsonValue }[] = [
      { key: "site.description", value: data.description },
      { key: "seo.keywords", value: data.keywords as Prisma.InputJsonValue },
      { key: "seo.ogImage", value: data.ogImage },
      { key: "nav", value: data.nav as Prisma.InputJsonValue },
      { key: "footer.icp", value: data.icp },
    ];

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.setting.upsert({
          where: { key: entry.key },
          update: { value: entry.value },
          create: { key: entry.key, value: entry.value },
        }),
      ),
    );

    return jsonOk(await getSettings());
  } catch (error) {
    return serverError(error);
  }
}
