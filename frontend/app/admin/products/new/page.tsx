import { getCategories } from "@/lib/actions/products";
import { NewProductForm } from "@/components/new-product-form";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Add product</h1>
      <NewProductForm categories={categories} />
    </main>
  );
}
