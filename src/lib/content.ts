import type { Prisma } from "@prisma/client";

export type SocialLink = { label: string; url: string };
export type TimelineItem = { year: number; title: string; description?: string };

export type BlockBase = { id: string; type: string; version: number };
export type ParagraphBlock = BlockBase & { type: "paragraph"; text: string };
export type HeadingBlock = BlockBase & { type: "heading"; level: 2 | 3; text: string };
export type ImageBlock = BlockBase & {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};
export type GalleryBlock = BlockBase & {
  type: "gallery";
  images: { url: string; alt: string; caption?: string }[];
};
export type VideoBlock = BlockBase & {
  type: "video";
  provider: "bilibili" | "youtube" | "file";
  url: string;
  title?: string;
  poster?: string;
};
export type AudioBlock = BlockBase & {
  type: "audio";
  url: string;
  title: string;
  duration?: number;
};
export type QuoteBlock = BlockBase & { type: "quote"; text: string; cite?: string };
export type PromptBlock = BlockBase & {
  type: "prompt";
  model?: string;
  text: string;
  negative?: string;
  params?: Record<string, string | number>;
  collapsed?: boolean;
};
export type LinkBlock = BlockBase & {
  type: "link";
  url: string;
  title: string;
  description?: string;
};
export type DividerBlock = BlockBase & { type: "divider" };

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | AudioBlock
  | QuoteBlock
  | PromptBlock
  | LinkBlock
  | DividerBlock;

const blockTypes = new Set([
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
]);

export function parseContent(value: Prisma.JsonValue | unknown): Block[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Block => {
    if (!item || typeof item !== "object") return false;
    const type = (item as { type?: unknown }).type;
    return typeof type === "string" && blockTypes.has(type);
  });
}

export function toStringArray(value: Prisma.JsonValue | unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function toSocials(value: Prisma.JsonValue | unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const label = (item as { label?: unknown }).label;
    const url = (item as { url?: unknown }).url;
    if (typeof label !== "string" || typeof url !== "string") return [];
    return [{ label, url }];
  });
}

export function toTimeline(value: Prisma.JsonValue | unknown): TimelineItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const year = (item as { year?: unknown }).year;
    const title = (item as { title?: unknown }).title;
    const description = (item as { description?: unknown }).description;
    if (typeof year !== "number" || typeof title !== "string") return [];
    return [{ year, title, description: typeof description === "string" ? description : undefined }];
  });
}

export function formatDate(value: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  }).format(date);
}

export function formatShortDate(value: Date | string | null | undefined) {
  return formatDate(value, { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll("/", ".");
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function firstParagraph(text: string): string {
  return splitParagraphs(text)[0] ?? "";
}
