import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Middleware runs as part of the request-
// processing pipeline before a matching request reaches 
// its destination. In this application, the middleware delegates session handling to a separate Supabase helper.

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
// The matcher determines which URL paths invoke this middleware. It excludes the listed Next.js 
// static and image paths, the favicon, and paths ending in the specified image extensio
export const config = {
  matcher: [
    // Run on everything except static assets and image optimization files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
