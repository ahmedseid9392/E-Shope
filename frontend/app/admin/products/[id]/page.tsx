import { notFound } from "next/navigation";
import { getProductByIdForAdmin, getCategories } from "@/lib/actions/products";
import { EditProductForm } from "@/components/edit-product-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    getProductByIdForAdmin(params.id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Edit product</h1>
      <EditProductForm product={product} categories={categories} />
    </div>
  );
}
