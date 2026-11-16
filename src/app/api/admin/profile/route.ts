import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { getProfile } from "@/lib/data";
import { profileSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);
    return jsonOk(await getProfile());
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

    const parsed = profileSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const data = parsed.data;

    const values = {
      siteName: data.siteName,
      siteNameEn: data.siteNameEn || null,
      ownerName: data.ownerName,
      roleLine: data.roleLine,
      heroEyebrow: data.heroEyebrow,
      tagline: data.tagline,
      bio: data.bio,
      avatarUrl: data.avatarUrl || null,
      email: data.email,
      location: data.location || null,
      availability: data.availability,
      socials: data.socials as Prisma.InputJsonValue,
      footerNote: data.footerNote,
      aboutTools: data.aboutTools as Prisma.InputJsonValue,
      timeline: data.timeline as Prisma.InputJsonValue,
    };

    const profile = await prisma.siteProfile.upsert({
      where: { id: 1 },
      update: values,
      create: { id: 1, ...values },
    });
    return jsonOk(profile);
  } catch (error) {
    return serverError(error);
  }
}
