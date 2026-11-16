import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getProfile, getSettings, getVisibleCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, categories, settings] = await Promise.all([
    getProfile(),
    getVisibleCategories(),
    getSettings(),
  ]);

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">
        跳到正文
      </a>
      <SiteHeader profile={profile} categories={categories} settings={settings} />
      <main className="page-main" id="main">
        {children}
      </main>
      <SiteFooter profile={profile} categories={categories} settings={settings} />
    </div>
  );
}
