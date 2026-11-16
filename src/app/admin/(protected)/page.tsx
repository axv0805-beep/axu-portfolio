import Link from "next/link";
import Image from "next/image";
import { getAdminStats } from "@/lib/data";
import { formatShortDate } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">概览</h1>
          <p className="admin-sub">今天也从一件作品开始。</p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-primary btn-sm" href="/admin/works/new">
            新建作品 <span className="arrow">→</span>
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">全部作品</p>
          <p className="stat-value">{String(stats.total).padStart(2, "0")}</p>
          <p className="stat-foot">含草稿与已发布</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">已发布</p>
          <p className="stat-value">{String(stats.published).padStart(2, "0")}</p>
          <p className="stat-foot">访客可见</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">草稿</p>
          <p className="stat-value">{String(stats.drafts).padStart(2, "0")}</p>
          <p className="stat-foot">只有你能看到</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">分类</p>
          <p className="stat-value">{String(stats.categories).padStart(2, "0")}</p>
          <p className="stat-foot">用于前台筛选</p>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-head">
            <h2 className="admin-card-title">最近编辑</h2>
            <Link className="mono" href="/admin/works" style={{ fontSize: 9, color: "var(--ink-3)" }}>
              查看全部 →
            </Link>
          </div>
          <div className="admin-table-wrap">
            {stats.recent.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>封面</th>
                    <th>作品</th>
                    <th>状态</th>
                    <th>更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((work) => (
                    <tr key={work.id}>
                      <td>
                        <Image className="cover" src={work.coverUrl} alt="" width={44} height={56} />
                      </td>
                      <td className="title-cell">
                        <Link href={`/admin/works/${work.id}`}>{work.title}</Link>
                      </td>
                      <td>
                        <span className={`badge ${work.status === "published" ? "badge--published" : "badge--draft"}`}>
                          {work.status === "published" ? "已发布" : "草稿"}
                        </span>
                      </td>
                      <td className="num">{formatShortDate(work.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-admin">还没有作品。新建第一件，或者运行种子数据。</p>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div className="admin-card">
            <div className="admin-card-head">
              <h2 className="admin-card-title">快捷操作</h2>
            </div>
            <div className="admin-card-body" style={{ display: "grid", gap: 10 }}>
              <Link className="btn btn-ghost btn-sm" href="/admin/works/new">
                新建作品
              </Link>
              <Link className="btn btn-ghost btn-sm" href="/admin/categories">
                管理分类
              </Link>
              <Link className="btn btn-ghost btn-sm" href="/admin/profile">
                编辑个人资料
              </Link>
              <Link className="btn btn-ghost btn-sm" href="/admin/settings">
                站点设置
              </Link>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-head">
              <h2 className="admin-card-title">发布提醒</h2>
            </div>
            <div className="admin-card-body" style={{ fontSize: 12, lineHeight: 1.9, color: "var(--ink-3)" }}>
              <p>· 首页精选最多 3 件，超出的会在发布时提示。</p>
              <p>· 发布前需要封面、封面说明、摘要和至少 1 个内容块。</p>
              <p>· 修改发布过的作品会立即影响前台。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
