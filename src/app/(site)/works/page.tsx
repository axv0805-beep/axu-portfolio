import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkCard } from "@/components/site/work-card";
import { getPublishedTotal, getVisibleCategories, getWorks } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ type?: string; page?: string; sort?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const categories = await getVisibleCategories();
  const category = params.type ? categories.find((item) => item.slug === params.type) : null;
  return {
    title: category ? category.name : "作品",
    description: category?.description || "按媒介浏览全部 AIGC 作品。",
  };
}

function pageHref(type: string | undefined, sort: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/works?${query}` : "/works";
}

export default async function WorksPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const [categories, totalPublished, data] = await Promise.all([
    getVisibleCategories(),
    getPublishedTotal(),
    getWorks({ type: params.type, page, pageSize: 12, order: sort }),
  ]);

  if (!data) notFound();
  const offset = (data.page - 1) * data.pageSize;

  return (
    <>
      <header className="page-head">
        <div className="container page-head-row">
          <div>
            <p className="eyebrow">WORKS / 作品</p>
            <h1 className="page-title">{data.category ? data.category.name : "作品"}</h1>
            <p className="page-lede">
              {data.category ? data.category.description : "按媒介陈列。图像、影像、文字、声音，以及一些能跑起来的小东西。"}
            </p>
          </div>
          <p className="page-count">
            {String(data.total).padStart(2, "0")} / {String(totalPublished).padStart(2, "0")} 件
          </p>
        </div>
      </header>

      <div className="filter-bar">
        <div className="container filter-inner">
          <Link className="filter-link" data-active={!params.type} href={pageHref(undefined, sort, 1)}>
            全部 <span className="filter-count">{totalPublished}</span>
          </Link>
          {categories.map((category) => (
            <Link
              className="filter-link"
              data-active={params.type === category.slug}
              href={pageHref(category.slug, sort, 1)}
              key={category.id}
            >
              {category.name} <span className="filter-count">{category.workCount}</span>
            </Link>
          ))}
          <span style={{ marginLeft: "auto" }} />
          <Link className="filter-link" data-active={sort === "newest"} href={pageHref(params.type, "newest", 1)}>
            最新
          </Link>
          <Link className="filter-link" data-active={sort === "oldest"} href={pageHref(params.type, "oldest", 1)}>
            最早
          </Link>
        </div>
      </div>

      <div className="works-body">
        <div className="container">
          {data.items.length > 0 ? (
            <div className="works-grid">
              {data.items.map((work, index) => (
                <WorkCard key={work.id} work={work} index={offset + index} total={data.total} />
              ))}
            </div>
          ) : (
            <div className="works-empty">
              <h2>这个分类还没有作品</h2>
              <p>换一个分类，或者回到全部作品。</p>
              <div className="state-actions">
                <Link className="btn btn-ghost" href="/works">
                  查看全部作品
                </Link>
              </div>
            </div>
          )}

          {data.totalPages > 1 ? (
            <nav className="pager" aria-label="分页">
              {data.page > 1 ? (
                <Link href={pageHref(params.type, sort, data.page - 1)}>← 上一页</Link>
              ) : (
                <span className="disabled">← 上一页</span>
              )}
              <span>
                {String(data.page).padStart(2, "0")} / {String(data.totalPages).padStart(2, "0")}
              </span>
              {data.page < data.totalPages ? (
                <Link href={pageHref(params.type, sort, data.page + 1)}>下一页 →</Link>
              ) : (
                <span className="disabled">下一页 →</span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </>
  );
}
