import { Mail, Phone, MapPin, Clock, ExternalLink } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SITE_INFO, mapsDirectionsUrl } from "@/lib/site-info";

export const metadata = { title: "Contact — E-Shope" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Contact us</h1>
      <p className="mt-3 max-w-xl text-muted">
        Questions about an order, a product, or anything else — send us a message and
        we'll get back to you as soon as we can.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-12">
        <ContactForm />

        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
              Get in touch
            </h2>
            <div className="mt-3 space-y-3 text-sm">
              <a
                href={`mailto:${SITE_INFO.email}`}
                className="flex items-center gap-3 text-ink transition hover:text-accent"
              >
                <Mail size={16} className="shrink-0 text-muted" />
                {SITE_INFO.email}
              </a>
              <a
                href={`tel:${SITE_INFO.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-ink transition hover:text-accent"
              >
                <Phone size={16} className="shrink-0 text-muted" />
                {SITE_INFO.phone}
              </a>
              <div className="flex items-start gap-3 text-ink">
                <MapPin size={16} className="mt-0.5 shrink-0 text-muted" />
                <span>
                  {SITE_INFO.address.line}
                  <br />
                  {SITE_INFO.address.city}, {SITE_INFO.address.country}
                </span>
              </div>
              <div className="flex items-center gap-3 text-ink">
                <Clock size={16} className="shrink-0 text-muted" />
                {SITE_INFO.hours}
              </div>
            </div>

            <a
              href={mapsDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
            >
              Get directions
              <ExternalLink size={14} />
            </a>
          </div>

          <p className="text-xs text-muted">
            For order-specific questions, it helps to include your order number — find it
            at the top of your{" "}
            <a href="/orders" className="underline">
              order history
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
