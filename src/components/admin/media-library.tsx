"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  size: number;
  mime: string;
  createdAt: string;
};

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);

  function flash(text: string, error = false) {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 2400);
  }

  async function upload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const payload = (await response.json()) as { ok: boolean; error?: { message: string } };
      if (!response.ok || !payload.ok) {
        flash(payload.error?.message ?? `${file.name} 上传失败`, true);
        break;
      }
    }
    setUploading(false);
    router.refresh();
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`删除 ${item.originalName}？如果它正被作品使用，会删除失败。`)) return;
    const response = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    const payload = (await response.json()) as { ok: boolean; error?: { message: string } };
    if (!response.ok || !payload.ok) {
      flash(payload.error?.message ?? "删除失败", true);
      return;
    }
    flash("已删除");
    router.refresh();
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    flash("地址已复制");
  }

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">媒体库</h1>
          <p className="admin-sub">图片与视频都存放在本地 data/uploads。</p>
        </div>
        <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
          {uploading ? "上传中…" : "上传文件"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
            style={{ display: "none" }}
            disabled={uploading}
            onChange={(event) => {
              if (event.target.files?.length) void upload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="admin-card">
          <p className="empty-admin">还没有文件。上传第一张图片，编辑器里就能选到它。</p>
        </div>
      ) : (
        <div className="media-grid">
          {items.map((item) => (
            <div className="media-item" key={item.id}>
              <div className="media-thumb">
                {item.mime.startsWith("image/") ? (
                  <Image src={item.url} alt={item.originalName} fill sizes="220px" style={{ objectFit: "cover" }} />
                ) : (
                  <video src={item.url} controls preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
              <div className="media-meta">
                <span title={item.originalName} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
                  {item.originalName}
                </span>
                <span>{(item.size / 1024).toFixed(0)} KB</span>
              </div>
              <div className="media-meta" style={{ borderTop: "1px solid var(--line)" }}>
                <button type="button" onClick={() => copy(item.url)}>
                  复制地址
                </button>
                <button type="button" onClick={() => remove(item)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast ? <div className={`toast ${toast.error ? "toast--error" : ""}`}>{toast.text}</div> : null}
    </div>
  );
}
