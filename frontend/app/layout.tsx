import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "My Store",
  description: "Single-store ecommerce built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
