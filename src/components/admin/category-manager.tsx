"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  workCount: number;
  publishedCount: number;
};

type Draft = {
  id?: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  isVisible: boolean;
};

const emptyDraft: Draft = { name: "", nameEn: "", slug: "", description: "", isVisible: true };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(categories);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  function flash(text: string, error = false) {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 2400);
  }

  function openNew() {
    setDraft({ ...emptyDraft });
    setError("");
    setFieldErrors({});
  }

  function openEdit(row: CategoryRow) {
    setDraft({
      id: row.id,
      name: row.name,
      nameEn: row.nameEn,
      slug: row.slug,
      description: row.description,
      isVisible: row.isVisible,
    });
    setError("");
    setFieldErrors({});
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      const response = await fetch(draft.id ? `/api/admin/categories/${draft.id}` : "/api/admin/categories", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          nameEn: draft.nameEn,
          slug: draft.slug,
          description: draft.description,
          isVisible: draft.isVisible,
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
      setDraft(null);
      flash("已保存");
      router.refresh();
    } catch {
      setError("网络错误，请重试。");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: CategoryRow) {
    if (row.workCount > 0) {
      flash(`「${row.name}」下还有 ${row.workCount} 件作品，不能删除。`, true);
      return;
    }
    if (!window.confirm(`确定删除分类「${row.name}」？`)) return;
    const response = await fetch(`/api/admin/categories/${row.id}`, { method: "DELETE" });
    const payload = (await response.json()) as { ok: boolean; error?: { message: string } };
    if (!response.ok || !payload.ok) {
      flash(payload.error?.message ?? "删除失败", true);
      return;
    }
    flash("已删除");
    router.refresh();
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    setRows(next);
    const response = await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((row) => row.id) }),
    });
    if (!response.ok) {
      setRows(rows);
      flash("排序保存失败", true);
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">分类</h1>
          <p className="admin-sub">前台筛选与首页目录都从这里来。分类 slug 创建后不可修改。</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-primary btn-sm" type="button" onClick={openNew}>
            新建分类 <span className="arrow">→</span>
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>排序</th>
                <th>名称</th>
                <th>Slug</th>
                <th>描述</th>
                <th>作品</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="num">{row.sortOrder}</span>
                      <button className="icon-btn" type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="上移">
                        ↑
                      </button>
                      <button className="icon-btn" type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} aria-label="下移">
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="title-cell">
                    <button type="button" onClick={() => openEdit(row)} style={{ background: "none", border: 0, padding: 0, font: "inherit", color: "inherit" }}>
                      {row.name}
                    </button>
                    <div className="slug">{row.nameEn}</div>
                  </td>
                  <td className="num">{row.slug}</td>
                  <td style={{ color: "var(--ink-3)", maxWidth: 260 }}>{row.description || "—"}</td>
                  <td className="num">
                    {row.publishedCount} / {row.workCount}
                  </td>
                  <td>
                    <span className={`badge ${row.isVisible ? "badge--published" : "badge--draft"}`}>
                      {row.isVisible ? "可见" : "隐藏"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => openEdit(row)}>
                        编辑
                      </button>
                      <button className="danger" type="button" onClick={() => remove(row)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <p className="empty-admin">还没有分类。新建第一个，首页目录才会出现。</p> : null}
      </div>

      {draft ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDraft(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={draft.id ? "编辑分类" : "新建分类"}>
            <div className="modal-head">
              <h2>{draft.id ? "编辑分类" : "新建分类"}</h2>
              <button type="button" onClick={() => setDraft(null)} style={{ background: "none", border: 0, fontSize: 18 }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {error ? <p className="field-error" style={{ marginBottom: 14 }}>{error}</p> : null}
              <div className="form-grid">
                <div className="field">
                  <label className="label">名称</label>
                  <input className="input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
                  {fieldErrors.name ? <p className="field-error">{fieldErrors.name}</p> : null}
                </div>
                <div className="field">
                  <label className="label">英文名</label>
                  <input className="input" value={draft.nameEn} onChange={(event) => setDraft({ ...draft, nameEn: event.target.value })} />
                  {fieldErrors.nameEn ? <p className="field-error">{fieldErrors.nameEn}</p> : null}
                </div>
                <div className="field">
                  <label className="label">Slug</label>
                  <input
                    className="input input-mono"
                    value={draft.slug}
                    onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                    disabled={Boolean(draft.id)}
                    placeholder="ai-painting"
                  />
                  {fieldErrors.slug ? <p className="field-error">{fieldErrors.slug}</p> : null}
                </div>
                <div className="field">
                  <label className="label">可见</label>
                  <label className="checkbox" style={{ minHeight: 40 }}>
                    <input type="checkbox" checked={draft.isVisible} onChange={(event) => setDraft({ ...draft, isVisible: event.target.checked })} />
                    在前台显示
                  </label>
                </div>
                <div className="field span-2">
                  <label className="label">描述 <span className="hint">最多 80 字</span></label>
                  <input className="input" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDraft(null)}>
                取消
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={save} disabled={saving}>
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className={`toast ${toast.error ? "toast--error" : ""}`}>{toast.text}</div> : null}
    </>
  );
}
