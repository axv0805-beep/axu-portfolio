import Link from "next/link";
import { getMedia } from "@/lib/data";
import { MediaLibrary } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getMedia(page);

  return (
    <>
      <MediaLibrary
        items={data.items.map((item) => ({
          id: item.id,
          url: item.url,
          originalName: item.originalName,
          size: item.size,
          mime: item.mime,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
      {data.totalPages > 1 ? (
        <nav className="pager" aria-label="分页" style={{ padding: "0 32px 32px" }}>
          {page > 1 ? <Link href={`/admin/media?page=${page - 1}`}>← 上一页</Link> : <span className="is-disabled">← 上一页</span>}
          <span className="mono">
            {page} / {data.totalPages}
          </span>
          {page < data.totalPages ? <Link href={`/admin/media?page=${page + 1}`}>下一页 →</Link> : <span className="is-disabled">下一页 →</span>}
        </nav>
      ) : null}
    </>
  );
}
