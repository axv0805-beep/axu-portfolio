"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "概览", exact: true },
  { href: "/admin/works", label: "作品" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/media", label: "媒体库" },
  { href: "/admin/profile", label: "个人资料" },
  { href: "/admin/settings", label: "站点设置" },
  { href: "/admin/account", label: "账号安全" },
];

export function AdminSidebar({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/admin">
        <span className="cn">{siteName}</span>
        <span className="en">ADMIN</span>
      </Link>

      <nav className="admin-nav" aria-label="后台导航">
        <span className="admin-nav-label">工作台</span>
        {items.slice(0, 4).map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} data-active={active}>
              {item.label}
            </Link>
          );
        })}
        <span className="admin-nav-label">设置</span>
        {items.slice(4).map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} data-active={active}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="admin-side-foot">
        <Link href="/" target="_blank">
          查看网站 ↗
        </Link>
        <button
          type="button"
          onClick={logout}
          style={{ display: "block", marginTop: 10, background: "none", border: 0, padding: 0, color: "inherit", fontSize: 11 }}
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
