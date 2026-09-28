import { getCategories } from "@/lib/actions/products";
import { NewProductForm } from "@/components/new-product-form";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Add product</h1>
      <NewProductForm categories={categories} />
    </div>
  );
}
