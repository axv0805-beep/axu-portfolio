import { getAdminCategories } from "@/lib/data";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <div className="admin-content">
      <CategoryManager categories={categories} />
    </div>
  );
}
