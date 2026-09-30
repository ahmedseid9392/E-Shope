import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";
import { SITE_INFO, mapsDirectionsUrl } from "@/lib/site-info";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-sm font-semibold text-ink">{children}</h3>
  );
}

const LINK_CLASS = "transition hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-3 max-w-[16rem] text-sm text-muted">
              Clothing, electronics, and home essentials — in stock, fairly
              priced, and delivered across Ethiopia.
            </p>
          </div>

          {/* Shop */}
          <div>
            <FooterHeading>Shop</FooterHeading>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/products" className={LINK_CLASS}>
                  All products
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className={LINK_CLASS}>
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className={LINK_CLASS}>
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className={LINK_CLASS}>
                  Order history
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <FooterHeading>Company</FooterHeading>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/about" className={LINK_CLASS}>
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className={LINK_CLASS}>
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/account" className={LINK_CLASS}>
                  Your account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / location */}
          <div className="col-span-2 sm:col-span-1">
            <FooterHeading>Get in touch</FooterHeading>
            <ul className="mt-3 space-y-2.5 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${SITE_INFO.email}`}
                  className={`flex items-center gap-2 ${LINK_CLASS}`}
                >
                  <Mail size={14} className="shrink-0" />
                  <span className="break-all">{SITE_INFO.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_INFO.phone.replace(/\s+/g, "")}`}
                  className={`flex items-center gap-2 ${LINK_CLASS}`}
                >
                  <Phone size={14} className="shrink-0" />
                  {SITE_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={mapsDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-2 ${LINK_CLASS}`}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {SITE_INFO.address.line}, {SITE_INFO.address.city}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE_INFO.legalName}. All rights reserved.</p>
          <p>Payments secured by Chapa. Prices shown in Birr (ETB).</p>
        </div>
      </div>
    </footer>
  );
}
