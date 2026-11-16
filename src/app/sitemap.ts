import type { MetadataRoute } from "next";
import { getVisibleCategories, getWorks } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const [categories, works] = await Promise.all([
    getVisibleCategories(),
    getWorks({ page: 1, pageSize: 48 }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/works`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/works?type=${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const workPages: MetadataRoute.Sitemap = (works?.items ?? []).map((work) => ({
    url: `${base}/works/${work.slug}`,
    lastModified: work.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...workPages];
}
