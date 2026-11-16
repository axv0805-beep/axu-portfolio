"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/data";

type Social = { label: string; url: string };
type Timeline = { year: number; title: string; description?: string };

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(initial.siteName);
  const [siteNameEn, setSiteNameEn] = useState(initial.siteNameEn ?? "");
  const [ownerName, setOwnerName] = useState(initial.ownerName);
  const [roleLine, setRoleLine] = useState(initial.roleLine);
  const [heroEyebrow, setHeroEyebrow] = useState(initial.heroEyebrow);
  const [tagline, setTagline] = useState(initial.tagline);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [email, setEmail] = useState(initial.email);
  const [location, setLocation] = useState(initial.location ?? "");
  const [availability, setAvailability] = useState(initial.availability);
  const [footerNote, setFooterNote] = useState(initial.footerNote);
  const [tools, setTools] = useState(initial.aboutTools.join(", "));
  const [socials, setSocials] = useState<Social[]>(initial.socials);
  const [timeline, setTimeline] = useState<Timeline[]>(initial.timeline);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const payload = (await response.json()) as { ok: boolean; data?: { url: string }; error?: { message: string } };
      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.error?.message ?? "上传失败");
        return;
      }
      setAvatarUrl(payload.data.url);
    } catch {
      setError("上传失败，请重试。");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          siteNameEn,
          ownerName,
          roleLine,
          heroEyebrow,
          tagline,
          bio,
          avatarUrl,
          email,
          location,
          availability,
          footerNote,
          socials: socials.filter((item) => item.label && item.url),
          aboutTools: tools
            .split(/[,，]/)
            .map((item) => item.trim())
            .filter(Boolean),
          timeline,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: { message: string; fields?: Record<string, string> };
      };
      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "保存失败");
        setFieldErrors(payload.error?.fields ?? {});
        return;
      }
      router.refresh();
      setError("");
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
          <h1 className="admin-title">个人资料</h1>
          <p className="admin-sub">首页 Hero、关于页与页脚都读取这里。</p>
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

      <div className="editor-layout">
        <div style={{ display: "grid", gap: 18 }}>
          <section className="editor-panel">
            <h3>站点</h3>
            <div className="form-grid">
              <div className="field">
                <label className="label">站点名</label>
                <input className="input" value={siteName} onChange={(event) => setSiteName(event.target.value)} />
                {fieldErrors.siteName ? <p className="field-error">{fieldErrors.siteName}</p> : null}
              </div>
              <div className="field">
                <label className="label">英文名</label>
                <input className="input input-mono" value={siteNameEn} onChange={(event) => setSiteNameEn(event.target.value)} />
              </div>
              <div className="field">
                <label className="label">署名</label>
                <input className="input" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} />
                {fieldErrors.ownerName ? <p className="field-error">{fieldErrors.ownerName}</p> : null}
              </div>
              <div className="field">
                <label className="label">身份行</label>
                <input className="input" value={roleLine} onChange={(event) => setRoleLine(event.target.value)} />
              </div>
              <div className="field">
                <label className="label">眉标</label>
                <input className="input input-mono" value={heroEyebrow} onChange={(event) => setHeroEyebrow(event.target.value)} />
              </div>
              <div className="field">
                <label className="label">所在地</label>
                <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} />
              </div>
              <div className="field">
                <label className="label">合作状态</label>
                <input className="input" value={availability} onChange={(event) => setAvailability(event.target.value)} />
              </div>
              <div className="field">
                <label className="label">联系邮箱</label>
                <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
              </div>
              <div className="field span-2">
                <label className="label">一句话介绍 <span className="hint">最多 60 字</span></label>
                <input className="input" value={tagline} onChange={(event) => setTagline(event.target.value)} />
                {fieldErrors.tagline ? <p className="field-error">{fieldErrors.tagline}</p> : null}
              </div>
              <div className="field span-2">
                <label className="label">简介 <span className="hint">最多 5000 字 · 空行分段</span></label>
                <textarea className="textarea" value={bio} onChange={(event) => setBio(event.target.value)} style={{ minHeight: 180 }} />
                {fieldErrors.bio ? <p className="field-error">{fieldErrors.bio}</p> : null}
              </div>
              <div className="field span-2">
                <label className="label">页脚小字</label>
                <input className="input" value={footerNote} onChange={(event) => setFooterNote(event.target.value)} />
              </div>
            </div>
          </section>

          <section className="editor-panel">
            <h3>工具</h3>
            <div className="field">
              <label className="label">常用工具 <span className="hint">逗号分隔 · 最多 12 个</span></label>
              <input className="input" value={tools} onChange={(event) => setTools(event.target.value)} />
            </div>
          </section>

          <section className="editor-panel">
            <div className="admin-card-head" style={{ padding: "0 0 14px", borderBottom: 0 }}>
              <h3 style={{ margin: 0 }}>社交链接</h3>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSocials([...socials, { label: "", url: "" }])}>
                + 添加
              </button>
            </div>
            {socials.length === 0 ? <p className="field-help">还没有社交链接。</p> : null}
            {socials.map((social, index) => (
              <div className="form-grid" key={index} style={{ marginBottom: 10 }}>
                <div className="field">
                  <label className="label">名称</label>
                  <input
                    className="input"
                    value={social.label}
                    onChange={(event) => setSocials(socials.map((item, i) => (i === index ? { ...item, label: event.target.value } : item)))}
                    placeholder="Instagram"
                  />
                </div>
                <div className="field">
                  <label className="label">链接</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      className="input input-mono"
                      value={social.url}
                      onChange={(event) => setSocials(socials.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)))}
                      placeholder="https://…"
                    />
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSocials(socials.filter((_, i) => i !== index))}>
                      移除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="editor-panel">
            <div className="admin-card-head" style={{ padding: "0 0 14px", borderBottom: 0 }}>
              <h3 style={{ margin: 0 }}>时间线</h3>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => setTimeline([...timeline, { year: new Date().getFullYear(), title: "", description: "" }])}
                disabled={timeline.length >= 8}
              >
                + 添加
              </button>
            </div>
            {timeline.map((item, index) => (
              <div className="form-grid" key={index} style={{ marginBottom: 10 }}>
                <div className="field">
                  <label className="label">年份</label>
                  <input
                    className="input"
                    type="number"
                    value={item.year}
                    onChange={(event) => setTimeline(timeline.map((entry, i) => (i === index ? { ...entry, year: Number(event.target.value) } : entry)))}
                  />
                </div>
                <div className="field">
                  <label className="label">事件</label>
                  <input
                    className="input"
                    value={item.title}
                    onChange={(event) => setTimeline(timeline.map((entry, i) => (i === index ? { ...entry, title: event.target.value } : entry)))}
                  />
                </div>
                <div className="field span-2">
                  <label className="label">说明</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      className="input"
                      value={item.description ?? ""}
                      onChange={(event) =>
                        setTimeline(timeline.map((entry, i) => (i === index ? { ...entry, description: event.target.value } : entry)))
                      }
                    />
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setTimeline(timeline.filter((_, i) => i !== index))}>
                      移除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside className="editor-side">
          <section className="editor-panel">
            <h3>头像</h3>
            <div className="cover-preview" style={{ aspectRatio: "1 / 1" }}>
              {avatarUrl ? <Image src={avatarUrl} alt="" fill sizes="320px" style={{ objectFit: "cover" }} /> : null}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadAvatar(file);
              }}
              style={{ fontSize: 11, width: "100%" }}
            />
            <p className="field-help" style={{ marginTop: 8 }}>{uploading ? "上传中…" : "1:1，≤ 10 MB。"}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
