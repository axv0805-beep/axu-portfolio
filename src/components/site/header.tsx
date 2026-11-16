"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryWithCount, Profile, SiteSettings } from "@/lib/data";

type Props = {
  profile: Profile;
  categories: CategoryWithCount[];
  settings: SiteSettings;
};

export function SiteHeader({ profile, categories, settings }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isWorks = pathname.startsWith("/works");
  const isAbout = pathname.startsWith("/about");

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label={`${profile.siteName} 首页`}>
          <span className="brand-cn">{profile.siteName}</span>
          {profile.siteNameEn ? <span className="brand-en">{profile.siteNameEn}</span> : null}
        </Link>

        <nav className="site-nav" aria-label="主导航">
          {settings.nav.home ? (
            <Link className="nav-link" data-active={isHome} href="/">
              首页
            </Link>
          ) : null}

          {settings.nav.works ? (
            <div className="nav-item">
              <Link className="nav-link" data-active={isWorks} href="/works" aria-haspopup="true">
                作品
              </Link>
              {categories.length > 0 ? (
                <div className="nav-dropdown" role="menu" aria-label="作品分类">
                  <Link href="/works" role="menuitem">
                    <span>全部作品</span>
                    <span className="mono">{categories.reduce((sum, item) => sum + item.workCount, 0)}</span>
                  </Link>
                  {categories.map((category) => (
                    <Link key={category.id} href={`/works?type=${category.slug}`} role="menuitem">
                      <span>{category.name}</span>
                      <span className="mono">{String(category.workCount).padStart(2, "0")}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {settings.nav.about ? (
            <Link className="nav-link" data-active={isAbout} href="/about">
              关于
            </Link>
          ) : null}

          <a className="nav-link" href={`mailto:${profile.email}`}>
            联系
          </a>
        </nav>

        <span className="header-meta">AIGC / 2026</span>
      </div>
    </header>
  );
}
