import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import "@/styles/admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/admin/login");
  const profile = await getProfile();

  return (
    <div className="admin-shell">
      <AdminSidebar siteName={profile.siteName} />
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="crumb">
            <span>{profile.siteName}</span>
            <span>/</span>
            <strong>管理后台</strong>
          </div>
          <div className="user">
            <span>
              已登录 · <b>{user.displayName}</b>
            </span>
            <a href="/" target="_blank" rel="noreferrer">
              前台 ↗
            </a>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
