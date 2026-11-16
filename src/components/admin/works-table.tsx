"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  status: string;
  isFeatured: boolean;
  sortOrder: number;
  updatedAt: string;
  category: { name: string };
};

type Props = { rows: Row[] };

export function WorksTable({ rows }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState("publish");
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  function flash(text: string, error = false) {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 2600);
  }

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAll() {
    setSelected((current) => (current.length === rows.length ? [] : rows.map((row) => row.id)));
  }

  async function runBulk() {
    if (selected.length === 0) return;
    if (action === "delete" && !window.confirm(`确定删除选中的 ${selected.length} 件作品？此操作不可撤销。`)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/works/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { succeeded: number; failed: { id: string; reason: string }[] };
        error?: { message: string };
      };
      if (!response.ok || !payload.ok) {
        flash(payload.error?.message ?? "操作失败", true);
        return;
      }
      const failed = payload.data?.failed.length ?? 0;
      flash(`成功 ${payload.data?.succeeded ?? 0} 件${failed ? `，失败 ${failed} 件` : ""}`);
      setSelected([]);
      router.refresh();
    } catch {
      flash("网络错误，请重试", true);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`确定删除《${title}》？此操作不可撤销。`)) return;
    const response = await fetch(`/api/admin/works/${id}`, { method: "DELETE" });
    if (!response.ok) {
      flash("删除失败", true);
      return;
    }
    flash("已删除");
    router.refresh();
  }

  return (
    <div className="admin-card">
      <div className="toolbar">
        <label className="checkbox">
          <input type="checkbox" checked={selected.length === rows.length && rows.length > 0} onChange={toggleAll} />
          全选
        </label>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>
          已选 {selected.length} 件
        </span>
        <span className="spacer" />
        <select className="select" style={{ width: 130, minHeight: 34 }} value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="publish">批量发布</option>
          <option value="draft">转为草稿</option>
          <option value="feature">设为精选</option>
          <option value="unfeature">取消精选</option>
          <option value="delete">删除</option>
        </select>
        <button className="btn btn-ghost btn-sm" type="button" onClick={runBulk} disabled={busy || selected.length === 0}>
          {busy ? "处理中…" : "应用"}
        </button>
      </div>

      {selected.length > 0 ? (
        <div className="bulk-bar">
          <span>已选择 {selected.length} 件作品</span>
          <span className="spacer" />
          <button
            type="button"
            style={{ border: 0, background: "none", color: "inherit", fontSize: 11 }}
            onClick={() => setSelected([])}
          >
            取消选择
          </button>
        </div>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 34 }} />
              <th>封面</th>
              <th>作品</th>
              <th>分类</th>
              <th>状态</th>
              <th>精选</th>
              <th>排序</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((work) => (
              <tr key={work.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(work.id)}
                    onChange={() => toggle(work.id)}
                    aria-label={`选择 ${work.title}`}
                  />
                </td>
                <td>
                  <Image className="cover" src={work.coverUrl} alt="" width={44} height={56} />
                </td>
                <td className="title-cell">
                  <Link href={`/admin/works/${work.id}`}>{work.title}</Link>
                  <div className="slug">/{work.slug}</div>
                </td>
                <td>{work.category.name}</td>
                <td>
                  <span className={`badge ${work.status === "published" ? "badge--published" : "badge--draft"}`}>
                    {work.status === "published" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td>{work.isFeatured ? <span className="badge badge--featured">精选</span> : <span className="muted">—</span>}</td>
                <td className="num">{work.sortOrder}</td>
                <td className="num">{work.updatedAt.slice(0, 16).replace("T", " ")}</td>
                <td>
                  <div className="row-actions">
                    <Link href={`/admin/works/${work.id}`}>编辑</Link>
                    <Link href={`/works/${work.slug}`} target="_blank">
                      查看
                    </Link>
                    <button className="danger" type="button" onClick={() => remove(work.id, work.title)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? <p className="empty-admin">没有匹配的作品。换个筛选条件，或者新建一件。</p> : null}

      {toast ? <div className={`toast ${toast.error ? "toast--error" : ""}`}>{toast.text}</div> : null}
    </div>
  );
}
