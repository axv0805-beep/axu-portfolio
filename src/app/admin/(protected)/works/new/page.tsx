import { getAdminCategories } from "@/lib/data";
import { WorkEditor } from "@/components/admin/work-editor";

export const dynamic = "force-dynamic";

export default async function NewWorkPage() {
  const categories = await getAdminCategories();
  return (
    <WorkEditor
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      initial={null}
    />
  );
}
