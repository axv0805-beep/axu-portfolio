import { notFound } from "next/navigation";
import { getAdminCategories, getAdminWork } from "@/lib/data";
import { parseContent } from "@/lib/content";
import { WorkEditor, type WorkEditorInitial } from "@/components/admin/work-editor";

export const dynamic = "force-dynamic";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [work, categories] = await Promise.all([getAdminWork(id), getAdminCategories()]);
  if (!work) notFound();

  const initial: WorkEditorInitial = {
    id: work.id,
    title: work.title,
    slug: work.slug,
    categoryId: work.categoryId,
    summary: work.summary,
    coverUrl: work.coverUrl,
    coverAlt: work.coverAlt,
    featuredCoverUrl: work.featuredCoverUrl,
    year: work.year,
    tools: Array.isArray(work.tools) ? (work.tools as string[]) : [],
    tags: Array.isArray(work.tags) ? (work.tags as string[]) : [],
    role: work.role,
    client: work.client,
    status: work.status,
    isFeatured: work.isFeatured,
    sortOrder: work.sortOrder,
    content: parseContent(work.content),
    updatedAt: work.updatedAt.toISOString(),
  };

  return (
    <WorkEditor
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      initial={initial}
    />
  );
}
