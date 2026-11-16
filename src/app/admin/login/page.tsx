import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { requireUser } from "@/lib/auth";
import "@/styles/admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "登录",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser();
  if (user) redirect("/admin");

  const params = await searchParams;
  const next = params.next?.startsWith("/admin") && !params.next.startsWith("//") ? params.next : "/admin";

  return (
    <div className="login-page">
      <div className="login-brand">
        <span className="cn">留白集</span>
        <span className="en">LIUBAI / ADMIN</span>
      </div>
      <LoginForm next={next} showDemo={process.env.NODE_ENV !== "production"} />
      <p className="login-foot">单管理员 · 本地部署 · 所有内容保存在自己的服务器</p>
    </div>
  );
}
