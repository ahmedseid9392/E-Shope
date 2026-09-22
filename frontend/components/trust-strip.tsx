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
    <section className="border-y border-line bg-white/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
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
