import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WorkCard } from "@/components/site/work-card";
import { getFeaturedWorks, getProfile, getPublishedTotal, getVisibleCategories } from "@/lib/data";
import { splitParagraphs } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: { absolute: `${profile.siteName} · ${profile.roleLine}` },
    description: profile.tagline,
    openGraph: {
      title: `${profile.siteName} · ${profile.roleLine}`,
      description: profile.tagline,
      images: [profile.avatarUrl ?? "/seed/og-default.png"],
    },
  };
}

function monthDay(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("/", ".");
}

export default async function HomePage() {
  const [profile, categories, featured, total] = await Promise.all([
    getProfile(),
    getVisibleCategories(),
    getFeaturedWorks(3),
    getPublishedTotal(),
  ]);
  const bio = splitParagraphs(profile.bio).slice(0, 2);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{profile.heroEyebrow}</p>
            <h1 className="hero-title">{profile.ownerName}</h1>
            <p className="hero-role">{profile.roleLine}</p>
            <p className="hero-tagline">{profile.tagline}</p>

            <div className="hero-actions">
              <Link className="btn btn-primary" href="/works">
                浏览作品 <span className="arrow">→</span>
              </Link>
              <Link className="btn-text" href="/about">
                关于我 <span className="arrow">↗</span>
              </Link>
            </div>

            <div className="hero-meta">
              {profile.location ? (
                <>
                  <span>{profile.location}</span>
                  <span className="dot">/</span>
                </>
              ) : null}
              <span className="availability">
                <span className="status-dot" />
                {profile.availability}
              </span>
              <span className="dot">/</span>
              <span>LAST UPDATE {monthDay(profile.updatedAt)}</span>
            </div>
          </div>

          <figure className="hero-figure">
            <div className="hero-image">
              <div className="hero-parallax">
                <Image
                  src={profile.avatarUrl || "/seed/portrait.webp"}
                  alt={`${profile.ownerName}的肖像`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 470px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <figcaption className="figure-caption">
              <span>工作室 · 静物</span>
              <span>2026 / {(profile.location || "HANGZHOU").toUpperCase()}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section" aria-labelledby="directory-title">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">
              <span className="section-index">01</span>
              <h2 className="section-title" id="directory-title">
                目录
              </h2>
            </div>
            <p className="section-note">六种媒介 / 按作品数量排序</p>
          </div>

          <div className="dir-list">
            {categories.map((category, index) => (
              <Link className="dir-row" href={`/works?type=${category.slug}`} key={category.id}>
                <span className="dir-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="dir-name">{category.name}</span>
                <span className="dir-desc">{category.description}</span>
                <span className="dir-count">{String(category.workCount).padStart(2, "0")}</span>
                <span className="dir-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-head">
            <div className="section-kicker">
              <span className="section-index">02</span>
              <h2 className="section-title" id="featured-title">
                精选
              </h2>
            </div>
            <Link className="section-note" href="/works">
              全部作品 · {total} 件 →
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="featured-grid">
              {featured.map((work, index) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  index={index}
                  total={featured.length}
                  size={index === 0 ? "large" : "small"}
                  priority={index === 0}
                  featured
                />
              ))}
            </div>
          ) : (
            <div className="works-empty">
              <h2>还没有作品</h2>
              <p>发布第一件作品后，这里会自动出现。</p>
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="about-title">
        <div className="container about-preview">
          <div>
            <div className="section-kicker">
              <span className="section-index">03</span>
              <h2 className="section-title" id="about-title">
                关于
              </h2>
            </div>
            <p className="about-quote">
              先有作品，
              <br />
              再有说明。
            </p>
          </div>

          <div className="about-body">
            {bio.map((paragraph) => (
              <p key={paragraph.slice(0, 12)}>{paragraph}</p>
            ))}
            {profile.aboutTools.length > 0 ? (
              <div className="tool-line">
                <span>常用工具 /</span>
                {profile.aboutTools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            ) : null}
            <Link className="about-more" href="/about">
              更多关于我 <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
