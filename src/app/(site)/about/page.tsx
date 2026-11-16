import type { Metadata } from "next";
import Image from "next/image";
import { getProfile } from "@/lib/data";
import { splitParagraphs } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: "关于",
    description: profile.bio.slice(0, 120),
  };
}

export default async function AboutPage() {
  const profile = await getProfile();
  const bio = splitParagraphs(profile.bio);

  return (
    <>
      <section className="about-hero">
        <div className="container about-hero-grid">
          <figure>
            <div className="about-portrait">
              <Image
                src={profile.avatarUrl || "/seed/portrait.webp"}
                alt={`${profile.ownerName}的肖像`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 420px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <figcaption className="figure-caption">
              <span>工作室 · 静物</span>
              <span>2026 / {(profile.location || "HANGZHOU").toUpperCase()}</span>
            </figcaption>
          </figure>

          <div className="about-copy">
            <p className="eyebrow">ABOUT / 关于</p>
            <h1>{profile.ownerName}</h1>
            <p className="role">
              {profile.roleLine}
              {profile.location ? ` · ${profile.location}` : ""}
            </p>
            <div className="bio">
              {bio.map((paragraph) => (
                <p key={paragraph.slice(0, 12)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {profile.aboutTools.length > 0 ? (
        <section className="about-section">
          <div className="container">
            <div className="about-section-head">
              <h2>工具</h2>
              <span className="section-note">日常使用 / 不构成推荐</span>
            </div>
            <div className="tool-grid">
              {profile.aboutTools.map((tool) => (
                <span className="tool-chip" key={tool}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {profile.timeline.length > 0 ? (
        <section className="about-section">
          <div className="container">
            <div className="about-section-head">
              <h2>时间线</h2>
              <span className="section-note">一些节点</span>
            </div>
            <div className="timeline">
              {profile.timeline.map((item, index) => (
                <div className="timeline-item" key={`${item.year}-${index}`}>
                  <span className="timeline-year">{item.year}</span>
                  <div>
                    <p className="timeline-title">{item.title}</p>
                    {item.description ? <p className="timeline-desc">{item.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="about-section">
        <div className="container about-contact">
          <div>
            <p className="eyebrow">CONTACT / 联系</p>
            <p style={{ marginTop: 12, color: "var(--ink-3)", fontSize: 13 }}>
              {profile.availability}。项目、合作或只是聊聊，都可以写信。
            </p>
          </div>
          <a className="email" href={`mailto:${profile.email}`}>
            {profile.email} <span className="arrow">↗</span>
          </a>
        </div>
      </section>
    </>
  );
}
