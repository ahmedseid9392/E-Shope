const ITEMS = [
  {
    title: "Pay your way",
    detail: "Bank transfer, mobile money, or card — checkout runs through Chapa, in Birr.",
  },
  {
    title: "Real stock, real prices",
    detail: "What you see is what's on the shelf — no phantom listings, no hidden fees.",
  },
  {
    title: "Track every order",
    detail: "From placed to delivered, see exactly where your order stands.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:gap-8 sm:px-6 sm:py-10">
        {ITEMS.map((item) => (
          <div key={item.title}>
            <h3 className="font-display text-base font-semibold text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
