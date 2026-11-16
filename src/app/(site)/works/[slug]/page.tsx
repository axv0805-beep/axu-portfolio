import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { CopyLink } from "@/components/site/copy-link";
import { DetailCover } from "@/components/site/detail-cover";
import { getWorkBySlug } from "@/lib/data";
import { formatShortDate } from "@/lib/content";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getWorkBySlug(slug);
  if (!data) return { title: "作品未找到" };
  const { work } = data;
  return {
    title: work.title,
    description: work.summary,
    openGraph: {
      type: "article",
      title: work.title,
      description: work.summary,
      images: [work.coverUrl],
      publishedTime: work.publishedAt?.toISOString(),
    },
  };
}

export default async function WorkDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getWorkBySlug(slug);
  if (!data) notFound();

  const { work, prev, next, total } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    description: work.summary,
    image: work.coverUrl,
    datePublished: work.publishedAt?.toISOString(),
    dateModified: work.updatedAt.toISOString(),
    genre: work.category.name,
    creator: { "@type": "Person", name: "留白" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link href="/">首页</Link>
          <span className="sep">/</span>
          <Link href="/works">作品</Link>
          <span className="sep">/</span>
          <Link href={`/works?type=${work.category.slug}`}>{work.category.name}</Link>
          <span className="sep">/</span>
          <span>{work.title}</span>
        </nav>

        <header className="detail-head">
          <div className="detail-grid">
            <div>
              <p className="detail-kicker">
                <span>{work.category.name}</span>
                <span className="mono">{String(work.year)}</span>
              </p>
              <h1 className="detail-title">{work.title}</h1>
              <p className="detail-summary">{work.summary}</p>
            </div>

            <aside className="detail-meta">
              <dl>
                <div className="meta-row">
                  <dt>类型</dt>
                  <dd>{work.category.name}</dd>
                </div>
                <div className="meta-row">
                  <dt>年份</dt>
                  <dd>{work.year}</dd>
                </div>
                {work.tools.length > 0 ? (
                  <div className="meta-row">
                    <dt>工具</dt>
                    <dd>{work.tools.join(" / ")}</dd>
                  </div>
                ) : null}
                {work.role ? (
                  <div className="meta-row">
                    <dt>角色</dt>
                    <dd>{work.role}</dd>
                  </div>
                ) : null}
                {work.tags.length > 0 ? (
                  <div className="meta-row">
                    <dt>标签</dt>
                    <dd>{work.tags.join(" · ")}</dd>
                  </div>
                ) : null}
                <div className="meta-row">
                  <dt>发布</dt>
                  <dd>{formatShortDate(work.publishedAt)}</dd>
                </div>
              </dl>
              <CopyLink />
            </aside>
          </div>
        </header>
      </div>

      <div className="container">
        <DetailCover src={work.coverUrl} alt={work.coverAlt} />
      </div>

      <div className="container">
        <div className="detail-body">
          <BlockRenderer blocks={work.content} />
        </div>

        <nav className="detail-footer" aria-label="作品导航">
          {prev ? (
            <Link href={`/works/${prev.slug}`}>
              <span className="mono">← 上一件</span>
              <strong>{prev.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="next" href={`/works/${next.slug}`}>
              <span className="mono">下一件 →</span>
              <strong>{next.title}</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>
        <p className="mono" style={{ textAlign: "center", marginTop: 24, fontSize: 9, color: "var(--ink-3)" }}>
          {String(total).padStart(2, "0")} 件作品 / {work.category.name}
        </p>
      </div>
    </>
  );
}
