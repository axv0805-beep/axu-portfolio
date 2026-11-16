import Link from "next/link";
import { getAdminCategories, getAdminWorks } from "@/lib/data";
import { WorksTable } from "@/components/admin/works-table";

export const dynamic = "force-dynamic";

function pageHref(params: { q?: string; category?: string; status?: string; page: number }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category", params.category);
  if (params.status) query.set("status", params.status);
  if (params.page > 1) query.set("page", String(params.page));
  const string = query.toString();
  return string ? `/admin/works?${string}` : "/admin/works";
}

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const [data, categories] = await Promise.all([
    getAdminWorks({ q: params.q, categoryId: params.category, status: params.status, page, pageSize: 20 }),
    getAdminCategories(),
  ]);

  const rows = data.items.map((work) => ({
    id: work.id,
    title: work.title,
    slug: work.slug,
    coverUrl: work.coverUrl,
    status: work.status,
    isFeatured: work.isFeatured,
    sortOrder: work.sortOrder,
    updatedAt: work.updatedAt.toISOString(),
    category: { name: work.category.name },
  }));

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">作品</h1>
          <p className="admin-sub">共 {data.total} 件。草稿只有你能看到。</p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-primary btn-sm" href="/admin/works/new">
            新建作品 <span className="arrow">→</span>
          </Link>
        </div>
      </div>

      <form className="admin-card" style={{ marginBottom: 16 }} action="/admin/works" method="get">
        <div className="toolbar">
          <input
            className="input"
            style={{ width: 240, minHeight: 34 }}
            type="search"
            name="q"
            placeholder="搜索标题或摘要"
            defaultValue={params.q ?? ""}
          />
          <select className="select" style={{ width: 150, minHeight: 34 }} name="category" defaultValue={params.category ?? ""}>
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}（{category.workCount}）
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 130, minHeight: 34 }} name="status" defaultValue={params.status ?? ""}>
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
          <button className="btn btn-ghost btn-sm" type="submit">
            筛选
          </button>
          {params.q || params.category || params.status ? (
            <Link className="mono" href="/admin/works" style={{ fontSize: 10, color: "var(--ink-3)" }}>
              清除
            </Link>
          ) : null}
        </div>
      </form>

      <WorksTable rows={rows} />

      {data.totalPages > 1 ? (
        <nav className="pager" aria-label="分页" style={{ marginTop: 22 }}>
          {page > 1 ? (
            <Link href={pageHref({ ...params, page: page - 1 })}>← 上一页</Link>
          ) : (
            <span className="is-disabled">← 上一页</span>
          )}
          <span className="mono">
            {page} / {data.totalPages}
          </span>
          {page < data.totalPages ? (
            <Link href={pageHref({ ...params, page: page + 1 })}>下一页 →</Link>
          ) : (
            <span className="is-disabled">下一页 →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
