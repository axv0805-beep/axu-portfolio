"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/data";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [description, setDescription] = useState(initial.description);
  const [keywords, setKeywords] = useState(initial.keywords.join(", "));
  const [ogImage, setOgImage] = useState(initial.ogImage);
  const [nav, setNav] = useState(initial.nav);
  const [icp, setIcp] = useState(initial.icp);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          keywords: keywords
            .split(/[,，]/)
            .map((item) => item.trim())
            .filter(Boolean),
          ogImage,
          nav,
          icp,
        }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: { message: string } };
      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "保存失败");
        return;
      }
      router.refresh();
      window.alert("已保存");
    } catch {
      setError("网络错误，请重试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">站点设置</h1>
          <p className="admin-sub">SEO、导航与备案信息。</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-primary btn-sm" type="button" onClick={save} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="admin-card" style={{ marginBottom: 16, borderColor: "var(--danger)" }}>
          <div className="admin-card-body" style={{ padding: "12px 18px", color: "var(--danger)", fontSize: 12 }}>{error}</div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 18, maxWidth: 820 }}>
        <section className="editor-panel">
          <h3>SEO</h3>
          <div className="field">
            <label className="label">站点描述 <span className="hint">最多 160 字</span></label>
            <textarea className="textarea" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="field">
            <label className="label">关键词 <span className="hint">逗号分隔 · 最多 10 个</span></label>
            <input className="input" value={keywords} onChange={(event) => setKeywords(event.target.value)} />
          </div>
          <div className="field">
            <label className="label">分享图地址</label>
            <input className="input input-mono" value={ogImage} onChange={(event) => setOgImage(event.target.value)} placeholder="/seed/og-default.png" />
          </div>
        </section>

        <section className="editor-panel">
          <h3>导航</h3>
          <p className="field-help" style={{ marginBottom: 14 }}>关闭后对应入口会从主导航隐藏，页面仍可直接访问。</p>
          <div style={{ display: "grid", gap: 10 }}>
            {(
              [
                ["home", "首页"],
                ["works", "作品"],
                ["about", "关于"],
              ] as const
            ).map(([key, label]) => (
              <label className="checkbox" key={key}>
                <input
                  type="checkbox"
                  checked={nav[key]}
                  onChange={(event) => setNav({ ...nav, [key]: event.target.checked })}
                />
                显示「{label}」
              </label>
            ))}
          </div>
        </section>

        <section className="editor-panel">
          <h3>页脚</h3>
          <div className="field">
            <label className="label">备案号 <span className="hint">可留空</span></label>
            <input className="input input-mono" value={icp} onChange={(event) => setIcp(event.target.value)} placeholder="浙ICP备00000000号" />
          </div>
        </section>
      </div>
    </div>
  );
}
