"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Block } from "@/lib/content";

type CategoryOption = { id: string; name: string };

export type WorkEditorInitial = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  summary: string;
  coverUrl: string;
  coverAlt: string;
  featuredCoverUrl: string | null;
  year: number;
  tools: string[];
  tags: string[];
  role: string | null;
  client: string | null;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  content: Block[];
  updatedAt: string;
};

const blockLabels: Record<string, string> = {
  paragraph: "段落",
  heading: "小标题",
  image: "图片",
  gallery: "图集",
  video: "视频",
  audio: "音频",
  quote: "引用",
  prompt: "提示词",
  link: "链接",
  divider: "分隔线",
};

const blockTypes = Object.keys(blockLabels) as Block["type"][];

function newBlock(type: Block["type"]): Block {
  const base = { id: crypto.randomUUID(), version: 1 };
  switch (type) {
    case "paragraph":
      return { ...base, type, text: "" };
    case "heading":
      return { ...base, type, level: 2, text: "" };
    case "image":
      return { ...base, type, url: "", alt: "", caption: "" };
    case "gallery":
      return { ...base, type, images: [] };
    case "video":
      return { ...base, type, provider: "youtube", url: "", title: "" };
    case "audio":
      return { ...base, type, url: "", title: "" };
    case "quote":
      return { ...base, type, text: "", cite: "" };
    case "prompt":
      return { ...base, type, model: "", text: "", negative: "", collapsed: true };
    case "link":
      return { ...base, type, url: "", title: "", description: "" };
    case "divider":
      return { ...base, type };
  }
}

function splitList(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function WorkEditor({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial: WorkEditorInitial | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [coverAlt, setCoverAlt] = useState(initial?.coverAlt ?? "");
  const [featuredCoverUrl, setFeaturedCoverUrl] = useState(initial?.featuredCoverUrl ?? "");
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear());
  const [tools, setTools] = useState((initial?.tools ?? []).join(", "));
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [role, setRole] = useState(initial?.role ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [content, setContent] = useState<Block[]>(initial?.content ?? []);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [uploading, setUploading] = useState<"cover" | "featured" | null>(null);

  async function generateSlug() {
    if (!title.trim()) return;
    const { pinyin } = await import("pinyin-pro");
    const latin = pinyin(title, { toneType: "none", type: "array" }).join("-");
    setSlug(
      latin
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 72),
    );
  }

  async function uploadCover(file: File, target: "cover" | "featured") {
    setUploading(target);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { url: string };
        error?: { message: string };
      };
      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.error?.message ?? "上传失败");
        return;
      }
      if (target === "featured") {
        setFeaturedCoverUrl(payload.data.url);
      } else {
        setCoverUrl(payload.data.url);
      }
    } catch {
      setError("上传失败，请重试。");
    } finally {
      setUploading(null);
    }
  }

  function updateBlock(id: string, patch: Record<string, unknown>) {
    setContent((current) => current.map((item) => (item.id === id ? ({ ...item, ...patch } as Block) : item)));
  }

  function moveBlock(index: number, delta: number) {
    setContent((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      if (item) next.splice(target, 0, item);
      return next;
    });
  }

  function removeBlock(id: string) {
    setContent((current) => current.filter((item) => item.id !== id));
  }

  async function save(status: "draft" | "published") {
    setError("");
    setFieldErrors({});
    setSaving(status);
    try {
      const response = await fetch(initial ? `/api/admin/works/${initial.id}` : "/api/admin/works", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          categoryId,
          summary,
          coverUrl,
          coverAlt,
          featuredCoverUrl: featuredCoverUrl || null,
          year,
          tools: splitList(tools),
          tags: splitList(tags),
          role: role || null,
          client: client || null,
          status,
          isFeatured,
          sortOrder,
          content,
          ...(initial ? { updatedAt: initial.updatedAt } : {}),
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { id: string };
        error?: { message: string; fields?: Record<string, string> };
      };
      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "保存失败，请重试。");
        setFieldErrors(payload.error?.fields ?? {});
        return;
      }
      const id = payload.data?.id ?? initial?.id;
      router.push(`/admin/works/${id}`);
      router.refresh();
    } catch {
      setError("网络错误，请重试。");
    } finally {
      setSaving(null);
    }
  }

  const publishing = saving === "published";

  return (
    <div className="admin-content" style={{ maxWidth: 1400 }}>
      <div className="editor-toolbar">
        <Link className="mono" href="/admin/works" style={{ fontSize: 10, color: "var(--ink-3)" }}>
          ← 作品
        </Link>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>
          {initial ? "编辑" : "新建"}
        </span>
        <span className="spacer" />
        {initial ? (
          <Link className="btn btn-ghost btn-sm" href={`/works/${initial.slug}`} target="_blank">
            查看前台
          </Link>
        ) : null}
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => save("draft")} disabled={saving !== null}>
          {saving === "draft" ? "保存中…" : "保存草稿"}
        </button>
        <button className="btn btn-primary btn-sm" type="button" onClick={() => save("published")} disabled={saving !== null}>
          {publishing ? "发布中…" : "发布"}
        </button>
      </div>

      {error ? (
        <div className="admin-card" style={{ marginBottom: 16, borderColor: "var(--danger)" }}>
          <div className="admin-card-body" style={{ padding: "12px 18px", color: "var(--danger)", fontSize: 12 }}>
            {error}
          </div>
        </div>
      ) : null}

      <div className="editor-layout">
        <div style={{ display: "grid", gap: 18 }}>
          <section className="editor-panel">
            <div className="field">
              <label className="label" htmlFor="work-title">
                标题 <span className="hint">必填 · 最多 80 字</span>
              </label>
              <input
                className="input"
                id="work-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={Boolean(fieldErrors.title)}
                placeholder="例如：潮汐"
                style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}
              />
              {fieldErrors.title ? <p className="field-error">{fieldErrors.title}</p> : null}
            </div>

            <div className="field">
              <label className="label" htmlFor="work-slug">
                Slug <span className="hint">小写字母、数字、连字符</span>
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input input-mono"
                  id="work-slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.slug)}
                  placeholder="tidal-notes"
                />
                <button className="btn btn-ghost btn-sm" type="button" onClick={generateSlug} style={{ whiteSpace: "nowrap" }}>
                  从标题生成
                </button>
              </div>
              {fieldErrors.slug ? <p className="field-error">{fieldErrors.slug}</p> : <p className="field-help">发布后仍可修改，旧链接会失效。</p>}
            </div>

            <div className="field">
              <label className="label" htmlFor="work-summary">
                摘要 <span className="hint">列表与分享卡片 · 最多 160 字</span>
              </label>
              <textarea
                className="textarea"
                id="work-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                maxLength={160}
                placeholder="一句话说明这件作品。"
                style={{ minHeight: 80 }}
              />
              <p className="field-help">{summary.length} / 160</p>
            </div>
          </section>

          <section className="editor-panel">
            <div className="admin-card-head" style={{ padding: "0 0 14px", borderBottom: 0 }}>
              <h3 style={{ margin: 0 }}>内容</h3>
              <span className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>
                {content.length} 个块
              </span>
            </div>

            <div className="block-list">
              {content.map((block, index) => (
                <div className="block-item" key={block.id}>
                  <div className="block-item-head">
                    <span className="block-type">{blockLabels[block.type] ?? block.type}</span>
                    <span className="spacer" />
                    <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label="上移">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === content.length - 1} aria-label="下移">
                      ↓
                    </button>
                    <button className="danger" type="button" onClick={() => removeBlock(block.id)} aria-label="删除">
                      删除
                    </button>
                  </div>
                  <div className="block-fields">
                    <BlockFields block={block} onPatch={(patch) => updateBlock(block.id, patch)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="block-add">
              {blockTypes.map((type) => (
                <button key={type} type="button" onClick={() => setContent((current) => [...current, newBlock(type)])}>
                  + {blockLabels[type]}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="editor-side">
          <section className="editor-panel">
            <h3>发布</h3>
            <div className="field">
              <label className="label" htmlFor="work-category">
                分类 <span className="hint">必填</span>
              </label>
              <select
                className="select"
                id="work-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                aria-invalid={Boolean(fieldErrors.categoryId)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId ? <p className="field-error">{fieldErrors.categoryId}</p> : null}
            </div>

            <div className="form-grid" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="label" htmlFor="work-year">
                  年份
                </label>
                <input
                  className="input"
                  id="work-year"
                  type="number"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  min={1990}
                  max={2100}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="work-order">
                  排序
                </label>
                <input
                  className="input"
                  id="work-order"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(Number(event.target.value))}
                  min={0}
                  max={9999}
                />
              </div>
            </div>
          </section>

          <section className="editor-panel">
            <h3>首页精选</h3>
            <label className="checkbox">
              <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
              在首页「精选」中展示
            </label>
            <p className="field-help" style={{ marginTop: 10 }}>
              首页最多 3 件。排序数字越小越靠前，第一件显示为大图。
            </p>
            <div className="field" style={{ marginTop: 18 }}>
              <span className="label">精选封面（横版）</span>
              {featuredCoverUrl ? (
                <div className="cover-preview cover-preview--wide">
                  <Image
                    src={featuredCoverUrl}
                    alt={`${title || "作品"} 首页精选封面`}
                    fill
                    sizes="320px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div
                  className="cover-preview cover-preview--wide"
                  style={{ display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 11 }}
                >
                  未上传时使用主封面
                </div>
              )}
              <label
                className="btn btn-ghost btn-sm"
                style={{ display: "inline-flex", cursor: uploading === "featured" ? "wait" : "pointer", marginTop: 4 }}
              >
                {uploading === "featured" ? "上传中…" : featuredCoverUrl ? "更换精选封面" : "上传精选封面"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadCover(file, "featured");
                    event.target.value = "";
                  }}
                  style={{ display: "none" }}
                  disabled={Boolean(uploading)}
                />
              </label>
              <p className="field-help" style={{ marginTop: 8 }}>
                建议 3:2 或 16:9；只用于首页精选，不影响作品列表与详情页。
              </p>
            </div>
          </section>

          <section className="editor-panel">
            <h3>封面</h3>
            {coverUrl ? (
              <div className="cover-preview">
                <Image src={coverUrl} alt={coverAlt || ""} fill sizes="320px" style={{ objectFit: "cover" }} />
              </div>
            ) : (
              <div className="cover-preview" style={{ display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 11 }}>
                还没有封面
              </div>
            )}
            <label
              className="btn btn-ghost btn-sm"
              style={{ display: "inline-flex", cursor: uploading === "cover" ? "wait" : "pointer", marginTop: 4 }}
            >
              {uploading === "cover" ? "上传中…" : coverUrl ? "更换封面" : "上传封面"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadCover(file, "cover");
                  event.target.value = "";
                }}
                style={{ display: "none" }}
                disabled={Boolean(uploading)}
              />
            </label>
            <p className="field-help" style={{ marginTop: 8 }}>
              JPEG / PNG / WebP / AVIF，≤ 10 MB，建议 4:5。
            </p>
            <div className="field" style={{ marginTop: 14 }}>
              <label className="label" htmlFor="work-cover-alt">
                封面说明 <span className="hint">必填 · 无障碍</span>
              </label>
              <input
                className="input"
                id="work-cover-alt"
                value={coverAlt}
                onChange={(event) => setCoverAlt(event.target.value)}
                aria-invalid={Boolean(fieldErrors.coverAlt)}
                placeholder="描述画面内容"
              />
              {fieldErrors.coverAlt ? <p className="field-error">{fieldErrors.coverAlt}</p> : null}
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label" htmlFor="work-cover-url">
                封面地址
              </label>
              <input
                className="input input-mono"
                id="work-cover-url"
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="/seed/work-01.webp"
              />
            </div>
          </section>

          <section className="editor-panel">
            <h3>标签</h3>
            <div className="field">
              <label className="label" htmlFor="work-tools">
                工具 <span className="hint">逗号分隔 · 最多 8 个</span>
              </label>
              <input className="input" id="work-tools" value={tools} onChange={(event) => setTools(event.target.value)} placeholder="Midjourney, ComfyUI" />
            </div>
            <div className="field">
              <label className="label" htmlFor="work-tags">
                标签 <span className="hint">逗号分隔 · 最多 12 个</span>
              </label>
              <input className="input" id="work-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="风景, 长曝光" />
            </div>
            <div className="form-grid" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="label" htmlFor="work-role">
                  角色
                </label>
                <input className="input" id="work-role" value={role} onChange={(event) => setRole(event.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="work-client">
                  委托方
                </label>
                <input className="input" id="work-client" value={client} onChange={(event) => setClient(event.target.value)} />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function BlockFields({ block, onPatch }: { block: Block; onPatch: (patch: Record<string, unknown>) => void }) {
  switch (block.type) {
    case "paragraph":
      return (
        <div className="field">
          <label className="label">段落文字</label>
          <textarea className="textarea" value={block.text} onChange={(event) => onPatch({ text: event.target.value })} placeholder="写点什么。" />
        </div>
      );
    case "heading":
      return (
        <>
          <div className="form-grid">
            <div className="field">
              <label className="label">层级</label>
              <select className="select" value={block.level} onChange={(event) => onPatch({ level: Number(event.target.value) })}>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">标题文字</label>
            <input className="input" value={block.text} onChange={(event) => onPatch({ text: event.target.value })} />
          </div>
        </>
      );
    case "image":
      return (
        <>
          <div className="field">
            <label className="label">图片地址</label>
            <input className="input input-mono" value={block.url} onChange={(event) => onPatch({ url: event.target.value })} placeholder="/seed/detail-01.webp" />
          </div>
          <div className="field">
            <label className="label">替代文字</label>
            <input className="input" value={block.alt} onChange={(event) => onPatch({ alt: event.target.value })} />
          </div>
          <div className="field">
            <label className="label">图注</label>
            <input className="input" value={block.caption ?? ""} onChange={(event) => onPatch({ caption: event.target.value })} />
          </div>
        </>
      );
    case "gallery":
      return (
        <>
          {block.images.map((image, index) => (
            <div className="form-grid" key={`${block.id}-${index}`} style={{ marginBottom: 10 }}>
              <div className="field">
                <label className="label">图片 {index + 1}</label>
                <input
                  className="input input-mono"
                  value={image.url}
                  onChange={(event) => {
                    const images = block.images.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, url: event.target.value } : item,
                    );
                    onPatch({ images });
                  }}
                  placeholder="/seed/detail-01.webp"
                />
              </div>
              <div className="field">
                <label className="label">替代文字</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="input"
                    value={image.alt}
                    onChange={(event) => {
                      const images = block.images.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, alt: event.target.value } : item,
                      );
                      onPatch({ images });
                    }}
                  />
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => onPatch({ images: block.images.filter((_, itemIndex) => itemIndex !== index) })}
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => onPatch({ images: [...block.images, { url: "", alt: "" }] })}
            disabled={block.images.length >= 9}
          >
            + 添加图片（{block.images.length} / 9）
          </button>
        </>
      );
    case "video":
      return (
        <>
          <div className="field">
            <label className="label">来源</label>
            <select className="select" value={block.provider} onChange={(event) => onPatch({ provider: event.target.value })}>
              <option value="youtube">YouTube</option>
              <option value="bilibili">Bilibili</option>
              <option value="file">本地文件</option>
            </select>
          </div>
          <div className="field">
            <label className="label">链接</label>
            <input className="input input-mono" value={block.url} onChange={(event) => onPatch({ url: event.target.value })} placeholder="https://…" />
          </div>
          <div className="field">
            <label className="label">标题</label>
            <input className="input" value={block.title ?? ""} onChange={(event) => onPatch({ title: event.target.value })} />
          </div>
        </>
      );
    case "audio":
      return (
        <>
          <div className="field">
            <label className="label">音频链接</label>
            <input className="input input-mono" value={block.url} onChange={(event) => onPatch({ url: event.target.value })} placeholder="/seed/audio-low-tide.wav" />
          </div>
          <div className="field">
            <label className="label">标题</label>
            <input className="input" value={block.title} onChange={(event) => onPatch({ title: event.target.value })} />
          </div>
        </>
      );
    case "quote":
      return (
        <>
          <div className="field">
            <label className="label">引用文字</label>
            <textarea className="textarea" value={block.text} onChange={(event) => onPatch({ text: event.target.value })} />
          </div>
          <div className="field">
            <label className="label">出处</label>
            <input className="input" value={block.cite ?? ""} onChange={(event) => onPatch({ cite: event.target.value })} />
          </div>
        </>
      );
    case "prompt":
      return (
        <>
          <div className="field">
            <label className="label">模型</label>
            <input className="input" value={block.model ?? ""} onChange={(event) => onPatch({ model: event.target.value })} placeholder="Midjourney v6" />
          </div>
          <div className="field">
            <label className="label">提示词</label>
            <textarea className="textarea input-mono" value={block.text} onChange={(event) => onPatch({ text: event.target.value })} style={{ minHeight: 100 }} />
          </div>
          <div className="field">
            <label className="label">负向提示词</label>
            <textarea className="textarea input-mono" value={block.negative ?? ""} onChange={(event) => onPatch({ negative: event.target.value })} style={{ minHeight: 60 }} />
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={block.collapsed ?? true} onChange={(event) => onPatch({ collapsed: event.target.checked })} />
            默认折叠
          </label>
        </>
      );
    case "link":
      return (
        <>
          <div className="field">
            <label className="label">链接</label>
            <input className="input input-mono" value={block.url} onChange={(event) => onPatch({ url: event.target.value })} />
          </div>
          <div className="field">
            <label className="label">标题</label>
            <input className="input" value={block.title} onChange={(event) => onPatch({ title: event.target.value })} />
          </div>
          <div className="field">
            <label className="label">说明</label>
            <input className="input" value={block.description ?? ""} onChange={(event) => onPatch({ description: event.target.value })} />
          </div>
        </>
      );
    case "divider":
      return <p className="field-help">一条细分隔线，不需要填写内容。</p>;
    default:
      return null;
  }
}
