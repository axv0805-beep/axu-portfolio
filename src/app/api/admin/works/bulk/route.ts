import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, readJson, serverError, zodError } from "@/lib/http";
import { bulkSchema } from "@/lib/schemas";
import { publishErrors } from "@/lib/publish";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);

    const parsed = bulkSchema.safeParse(await readJson(request));
    if (!parsed.success) return zodError(parsed.error);
    const { ids, action } = parsed.data;

    const works = await prisma.work.findMany({ where: { id: { in: ids } } });
    const failed: { id: string; reason: string }[] = [];
    let succeeded = 0;

    if (action === "delete") {
      const result = await prisma.work.deleteMany({ where: { id: { in: works.map((work) => work.id) } } });
      succeeded = result.count;
      return jsonOk({ succeeded, failed });
    }

    if (action === "publish") {
      for (const work of works) {
        const errors = publishErrors(work);
        if (Object.keys(errors).length > 0) {
          failed.push({ id: work.id, reason: Object.values(errors)[0] ?? "必填项未完成" });
          continue;
        }
        await prisma.work.update({
          where: { id: work.id },
          data: { status: "published", publishedAt: work.publishedAt ?? new Date() },
        });
        succeeded += 1;
      }
      return jsonOk({ succeeded, failed });
    }

    if (action === "draft") {
      const result = await prisma.work.updateMany({
        where: { id: { in: works.map((work) => work.id) } },
        data: { status: "draft", isFeatured: false },
      });
      return jsonOk({ succeeded: result.count, failed });
    }

    if (action === "unfeature") {
      const result = await prisma.work.updateMany({
        where: { id: { in: works.map((work) => work.id) } },
        data: { isFeatured: false },
      });
      return jsonOk({ succeeded: result.count, failed });
    }

    let featured = await prisma.work.count({ where: { isFeatured: true, status: "published" } });
    for (const work of works) {
      if (work.status !== "published") {
        failed.push({ id: work.id, reason: "草稿不能设为精选" });
        continue;
      }
      if (work.isFeatured) {
        succeeded += 1;
        continue;
      }
      if (featured >= 3) {
        failed.push({ id: work.id, reason: "精选最多 3 件" });
        continue;
      }
      await prisma.work.update({ where: { id: work.id }, data: { isFeatured: true } });
      featured += 1;
      succeeded += 1;
    }
    return jsonOk({ succeeded, failed });
  } catch (error) {
    return serverError(error);
  }
}
