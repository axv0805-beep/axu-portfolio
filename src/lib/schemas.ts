import { z } from "zod";

const blockSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum([
      "paragraph",
      "heading",
      "image",
      "gallery",
      "video",
      "audio",
      "quote",
      "prompt",
      "link",
      "divider",
    ]),
    version: z.number().int().default(1),
  })
  .passthrough();

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名").max(40),
  password: z.string().min(1, "请输入密码").max(200),
});

export const workSchema = z.object({
  title: z.string().trim().min(1, "请填写标题").max(80, "标题不超过 80 字"),
  slug: z
    .string()
    .trim()
    .min(2, "slug 至少 2 个字符")
    .max(80, "slug 不超过 80 个字符")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能使用小写字母、数字和连字符"),
  categoryId: z.string().min(1, "请选择分类"),
  summary: z.string().trim().max(160, "摘要不超过 160 字").default(""),
  coverUrl: z.string().trim().max(500).default(""),
  coverAlt: z.string().trim().max(160).default(""),
  featuredCoverUrl: z.string().trim().max(500).optional().nullable(),
  year: z.number().int().min(1990).max(2100),
  tools: z.array(z.string().trim().max(24)).max(8).default([]),
  tags: z.array(z.string().trim().max(20)).max(12).default([]),
  role: z.string().trim().max(40).optional().nullable(),
  client: z.string().trim().max(40).optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  content: z.array(blockSchema).max(100, "内容块不超过 100 个").default([]),
  updatedAt: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "分类名至少 2 个字").max(20, "分类名不超过 20 字"),
  nameEn: z.string().trim().min(1, "请填写英文名").max(40),
  slug: z
    .string()
    .trim()
    .min(2, "slug 至少 2 个字符")
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能使用小写字母、数字和连字符"),
  description: z.string().trim().max(80, "描述不超过 80 字").default(""),
  isVisible: z.boolean().default(true),
});

export const profileSchema = z.object({
  siteName: z.string().trim().min(1, "请填写站点名").max(20),
  siteNameEn: z.string().trim().max(40).optional(),
  ownerName: z.string().trim().min(1, "请填写署名").max(20),
  roleLine: z.string().trim().min(1).max(40),
  heroEyebrow: z.string().trim().max(30),
  tagline: z.string().trim().min(1, "请填写一句话介绍").max(60),
  bio: z.string().trim().min(1, "请填写简介").max(5000),
  avatarUrl: z.string().trim().max(500).optional(),
  email: z.string().trim().email("请输入有效邮箱").max(120),
  location: z.string().trim().max(40).optional(),
  availability: z.string().trim().max(20),
  socials: z
    .array(z.object({ label: z.string().trim().min(1).max(20), url: z.string().trim().url("请输入有效链接") }))
    .max(8)
    .default([]),
  footerNote: z.string().trim().max(40).default(""),
  aboutTools: z.array(z.string().trim().max(24)).max(12).default([]),
  timeline: z
    .array(
      z.object({
        year: z.number().int().min(1990).max(2100),
        title: z.string().trim().min(1).max(40),
        description: z.string().trim().max(120).optional(),
      }),
    )
    .max(8)
    .default([]),
});

export const settingsSchema = z.object({
  description: z.string().trim().max(160),
  keywords: z.array(z.string().trim().max(20)).max(10),
  ogImage: z.string().trim().max(500),
  nav: z.object({ home: z.boolean(), works: z.boolean(), about: z.boolean() }),
  icp: z.string().trim().max(40),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(8, "新密码至少 8 位").max(200),
});

export const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "请选择作品").max(100),
  action: z.enum(["publish", "draft", "feature", "unfeature", "delete"]),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
});

export const mediaUpdateSchema = z.object({
  originalName: z.string().trim().min(1).max(120),
});
