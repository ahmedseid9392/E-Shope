import { Truck, ShieldCheck, Wallet } from "lucide-react";

export const metadata = { title: "About — E-Shope" };

const VALUES = [
  {
    icon: Wallet,
    title: "Fair, transparent pricing",
    body: "The price on the page is the price at checkout — no surprise fees, no fake \"was\" prices.",
  },
  {
    icon: ShieldCheck,
    title: "Real stock, verified sellers",
    body: "Every listing reflects what's actually on the shelf, so what you order is what ships.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    body: "We work with trusted couriers across Ethiopia and keep you updated at every step.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">About E-Shope</h1>
      <p className="mt-4 text-muted">
        E-Shope started with a simple idea: online shopping in Ethiopia should be as
        straightforward as walking into a shop you trust. We bring together everyday
        clothing, electronics, and home essentials in one place, priced fairly and
        delivered reliably — with payment options that actually work for how people pay
        here, from bank transfer to mobile money.
      </p>
      <p className="mt-4 text-muted">
        We're a small team based in Addis Ababa, and we personally review every product
        category we carry. If something isn't right with an order, we want to hear about
        it — see the contact page below.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-line bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Icon size={18} />
            </span>
            <h2 className="mt-3 font-display text-base font-semibold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-muted">{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
