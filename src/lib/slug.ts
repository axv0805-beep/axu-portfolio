import { pinyin } from "pinyin-pro";
import { prisma } from "./db";

export function slugify(input: string): string {
  const latin = pinyin(input, { toneType: "none", type: "array" }).join("-");
  return latin
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export async function uniqueWorkSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || `work-${Date.now()}`;
  let candidate = root;
  let counter = 2;
  while (true) {
    const existing = await prisma.work.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter}`;
    counter += 1;
  }
}

export async function uniqueCategorySlug(base: string, excludeId?: string): Promise<string> {
  const root = base || `category-${Date.now()}`;
  let candidate = root;
  let counter = 2;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter}`;
    counter += 1;
  }
}
