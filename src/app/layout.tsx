import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { getProfile } from "@/lib/data";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const siteName = profile.siteName || "留白集";
  const description =
    profile.tagline || `${siteName} 的 AIGC 作品集：原画、影像、小说、音乐与小型工具。`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} · ${profile.roleLine}`,
      template: `%s · ${siteName}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName,
      title: `${siteName} · ${profile.roleLine}`,
      description,
      images: [profile.avatarUrl ?? "/seed/og-default.png"],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
