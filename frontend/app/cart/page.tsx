import Link from "next/link";
import { getCart } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/format";
import { CartLineItem } from "@/components/cart-line-item";

export default async function CartPage() {
  const items = await getCart();
  const total = items.reduce((sum, item: any) => {
    const unitPrice = item.product.sale_price ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Your cart</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-muted">
          Your cart is empty.{" "}
          <Link href="/products" className="underline">
            Browse products
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="mt-6">
            {items.map((item: any) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-display text-lg font-bold text-ink">Total: {formatPrice(total)}</span>
            <Link
              href="/checkout"
              className="rounded bg-accent px-6 py-3 text-center font-medium text-onaccent hover:bg-accent/90 sm:py-2"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
