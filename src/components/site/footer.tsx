import Link from "next/link";
import type { CategoryWithCount, Profile, SiteSettings } from "@/lib/data";

type Props = {
  profile: Profile;
  categories: CategoryWithCount[];
  settings: SiteSettings;
};

export function SiteFooter({ profile, categories, settings }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-kicker">{profile.footerNote || "有一个想法，或只是想聊聊。"}</p>
        <a className="footer-email" href={`mailto:${profile.email}`}>
          {profile.email}
          <span className="arrow">↗</span>
        </a>

        <div className="footer-grid">
          <div>
            <p className="footer-brand">{profile.siteName}</p>
            <p className="footer-text">
              一个人的 AIGC 作品集。
              {profile.location ? (
                <>
                  <br />
                  {profile.location} · 中国
                </>
              ) : null}
            </p>
          </div>

          <div>
            <p className="footer-heading">目录</p>
            <div className="footer-links">
              {categories.map((category) => (
                <Link key={category.id} href={`/works?type=${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="footer-heading">站点</p>
            <div className="footer-links">
              <Link href="/works">全部作品</Link>
              <Link href="/about">关于</Link>
              <a href={`mailto:${profile.email}`}>联系</a>
              <Link href="/admin">管理入口</Link>
            </div>
          </div>

          <div>
            <p className="footer-heading">关注</p>
            <div className="footer-links">
              {profile.socials.length > 0 ? (
                profile.socials.map((social) => (
                  <a key={social.label} href={social.url} target="_blank" rel="noreferrer">
                    {social.label}
                  </a>
                ))
              ) : (
                <span className="muted">—</span>
              )}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {profile.siteName} / {profile.siteNameEn || "LIUBAI"}
          </span>
          <span>{settings.icp || "浙ICP备 0000000 号"}</span>
          <span>DESIGNED ON PAPER</span>
        </div>
      </div>
    </footer>
  );
}
