import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:gap-4 sm:px-6 sm:py-10 text-muted sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p>Payments secured by Chapa. Prices shown in Birr (ETB).</p>
      </div>
    </footer>
  );
}
