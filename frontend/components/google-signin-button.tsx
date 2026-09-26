import { signInWithGoogle } from "@/lib/actions/auth";

export function GoogleSignInButton({ redirectPath = "/" }: { redirectPath?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="redirectPath" value={redirectPath} />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded border border-line bg-surface py-2 text-sm font-medium text-ink transition hover:border-ink"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path
            fill="#4285F4"
            d="M15.68 8.18c0-.56-.05-1.1-.14-1.6H8v3.04h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.5-1.39 2.4-3.43 2.4-5.86Z"
          />
          <path
            fill="#34A853"
            d="M8 16c2.16 0 3.97-.72 5.29-1.95l-2.58-2c-.72.48-1.63.77-2.71.77-2.08 0-3.85-1.4-4.48-3.29H.86v2.07A8 8 0 0 0 8 16Z"
          />
          <path
            fill="#FBBC05"
            d="M3.52 9.53A4.8 4.8 0 0 1 3.27 8c0-.53.09-1.05.25-1.53V4.4H.86A8 8 0 0 0 0 8c0 1.29.31 2.5.86 3.6l2.66-2.07Z"
          />
          <path
            fill="#EA4335"
            d="M8 3.18c1.18 0 2.23.4 3.06 1.2l2.29-2.29C11.96.86 10.16 0 8 0A8 8 0 0 0 .86 4.4l2.66 2.07C4.15 4.58 5.92 3.18 8 3.18Z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
