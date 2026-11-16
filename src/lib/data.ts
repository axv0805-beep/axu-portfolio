import { prisma } from "./db";
import { parseContent, toSocials, toTimeline } from "./content";

export type Profile = {
  id: number;
  siteName: string;
  siteNameEn: string | null;
  ownerName: string;
  roleLine: string;
  heroEyebrow: string;
  tagline: string;
  bio: string;
  avatarUrl: string | null;
  email: string;
  location: string | null;
  availability: string;
  socials: { label: string; url: string }[];
  footerNote: string;
  aboutTools: string[];
  timeline: { year: number; title: string; description?: string }[];
  updatedAt: Date;
};

export const fallbackProfile: Profile = {
  id: 1,
  siteName: "留白集",
  siteNameEn: "LIUBAI",
  ownerName: "留白",
  roleLine: "AIGC 创作者 · 视觉设计",
  heroEyebrow: "AIGC PORTFOLIO · 2026",
  tagline: "把生成模型当作笔，画一些安静的东西。",
  bio: "我是留白，一名 AIGC 创作者。用生成模型做图像、影像和文字，也做一些能跑起来的小工具。\n\n这里按媒介陈列作品，保留过程、提示词和失败稿。它们不是终点，只是某一刻的切片。",
  avatarUrl: "/seed/portrait.webp",
  email: "hello@liubai.studio",
  location: "杭州",
  availability: "开放合作",
  socials: [],
  footerNote: "有一个想法，或只是想聊聊。",
  aboutTools: ["Midjourney", "ComfyUI", "Runway", "Suno", "Cursor", "Claude"],
  timeline: [],
  updatedAt: new Date(),
};

export async function getProfile(): Promise<Profile> {
  const row = await prisma.siteProfile.findUnique({ where: { id: 1 } });
  if (!row) return fallbackProfile;
  return {
    ...row,
    socials: toSocials(row.socials),
    aboutTools: row.aboutTools as string[],
    timeline: toTimeline(row.timeline),
  };
}

export type SiteSettings = {
  description: string;
  keywords: string[];
  ogImage: string;
  nav: { home: boolean; works: boolean; about: boolean };
  icp: string;
};

const defaultSettings: SiteSettings = {
  description: "留白集的 AIGC 作品集：原画、影像、小说、音乐与小型工具。",
  keywords: ["AIGC", "作品集", "AI 原画", "AI 视频", "AI 小说"],
  ogImage: "/seed/og-default.png",
  nav: { home: true, works: true, about: true },
  icp: "",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany();
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const description = map.get("site.description");
  const keywords = map.get("seo.keywords");
  const ogImage = map.get("seo.ogImage");
  const nav = map.get("nav");
  const icp = map.get("footer.icp");
  return {
    description: typeof description === "string" ? description : defaultSettings.description,
    keywords: Array.isArray(keywords) ? keywords.filter((item): item is string => typeof item === "string") : defaultSettings.keywords,
    ogImage: typeof ogImage === "string" ? ogImage : defaultSettings.ogImage,
    nav:
      nav && typeof nav === "object" && !Array.isArray(nav)
        ? {
            home: (nav as { home?: boolean }).home !== false,
            works: (nav as { works?: boolean }).works !== false,
            about: (nav as { about?: boolean }).about !== false,
          }
        : defaultSettings.nav,
    icp: typeof icp === "string" ? icp : "",
  };
}

export type CategoryWithCount = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  workCount: number;
};

export async function getVisibleCategories(): Promise<CategoryWithCount[]> {
  const rows = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { works: { where: { status: "published" } } } } },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.nameEn,
    description: row.description,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    workCount: row._count.works,
  }));
}

export type WorkCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string;
  coverAlt: string;
  featuredCoverUrl: string | null;
  year: number;
  tags: string[];
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: Date | null;
  category: { id: string; slug: string; name: string };
};

const workCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverUrl: true,
  coverAlt: true,
  featuredCoverUrl: true,
  year: true,
  tags: true,
  isFeatured: true,
  sortOrder: true,
  publishedAt: true,
  category: { select: { id: true, slug: true, name: true } },
} as const;

function normalizeWorkCard(row: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverUrl: string;
  coverAlt: string;
  featuredCoverUrl: string | null;
  year: number;
  tags: unknown;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: Date | null;
  category: { id: string; slug: string; name: string };
}): WorkCardData {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
  };
}

export async function getWorks(options: {
  type?: string;
  page?: number;
  pageSize?: number;
  featured?: boolean;
  order?: "newest" | "oldest";
}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, options.pageSize ?? 12));
  const category = options.type
    ? await prisma.category.findFirst({ where: { slug: options.type, isVisible: true } })
    : null;
  if (options.type && !category) return null;

  const where = {
    status: "published",
    ...(category ? { categoryId: category.id } : {}),
    ...(options.featured === undefined ? {} : { isFeatured: options.featured }),
  };
  const orderBy =
    options.order === "oldest"
      ? [{ publishedAt: "asc" as const }, { sortOrder: "asc" as const }]
      : [{ sortOrder: "asc" as const }, { publishedAt: "desc" as const }];

  const [items, total] = await Promise.all([
    prisma.work.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, select: workCardSelect }),
    prisma.work.count({ where }),
  ]);

  return {
    items: items.map(normalizeWorkCard),
    total,
    page,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    category,
  };
}

export async function getFeaturedWorks(limit = 3): Promise<WorkCardData[]> {
  const featured = await prisma.work.findMany({
    where: { status: "published", isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    take: limit,
    select: workCardSelect,
  });
  const items = featured.map(normalizeWorkCard);
  if (items.length >= limit) return items;
  const fill = await prisma.work.findMany({
    where: { status: "published", id: { notIn: items.map((item) => item.id) } },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    take: limit - items.length,
    select: workCardSelect,
  });
  return [...items, ...fill.map(normalizeWorkCard)];
}

export async function getPublishedTotal() {
  return prisma.work.count({ where: { status: "published" } });
}

export async function getWorkBySlug(slug: string) {
  const work = await prisma.work.findFirst({
    where: { slug, status: "published" },
    include: { category: true },
  });
  if (!work) return null;
  const siblings = await prisma.work.findMany({
    where: { status: "published" },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    select: { id: true, slug: true, title: true },
  });
  const index = siblings.findIndex((item) => item.id === work.id);
  return {
    work: {
      ...work,
      content: parseContent(work.content),
      tags: Array.isArray(work.tags) ? work.tags.filter((tag): tag is string => typeof tag === "string") : [],
      tools: Array.isArray(work.tools) ? work.tools.filter((tool): tool is string => typeof tool === "string") : [],
    },
    prev: index > 0 ? siblings[index - 1] : null,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
    total: siblings.length,
  };
}

export async function getAdminWorks(options: {
  q?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const where = {
    ...(options.q
      ? { OR: [{ title: { contains: options.q } }, { summary: { contains: options.q } }] }
      : {}),
    ...(options.categoryId ? { categoryId: options.categoryId } : {}),
    ...(options.status === "draft" || options.status === "published" ? { status: options.status } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.work.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.work.count({ where }),
  ]);
  return { items, total, page, pageSize, totalPages: total === 0 ? 0 : Math.ceil(total / pageSize) };
}

export async function getAdminWork(id: string) {
  return prisma.work.findUnique({ where: { id }, include: { category: true } });
}

export async function getAdminCategories() {
  const [rows, published] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { works: true } } },
    }),
    prisma.work.groupBy({ by: ["categoryId"], where: { status: "published" }, _count: true }),
  ]);
  const publishedMap = new Map(published.map((item) => [item.categoryId, item._count]));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.nameEn,
    description: row.description,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    workCount: row._count.works,
    publishedCount: publishedMap.get(row.id) ?? 0,
  }));
}

export async function getMedia(page = 1, pageSize = 24) {
  const current = Math.max(1, page);
  const [items, total] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * pageSize,
      take: pageSize,
    }),
    prisma.media.count(),
  ]);
  return { items, total, page: current, pageSize, totalPages: total === 0 ? 0 : Math.ceil(total / pageSize) };
}

export async function getAdminStats() {
  const [total, published, drafts, categories, recent] = await Promise.all([
    prisma.work.count(),
    prisma.work.count({ where: { status: "published" } }),
    prisma.work.count({ where: { status: "draft" } }),
    prisma.category.count(),
    prisma.work.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true, coverUrl: true },
    }),
  ]);
  return { total, published, drafts, categories, recent };
}
