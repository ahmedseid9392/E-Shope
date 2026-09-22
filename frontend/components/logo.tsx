export function Logo() {
  return (
    <span className="flex items-center gap-1.5 font-display text-xl font-extrabold tracking-tight text-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3.5 10.1 10.1 3.5h6.1a2.3 2.3 0 0 1 2.3 2.3v6.1L11.9 18.5a2.3 2.3 0 0 1-3.3 0l-5.1-5.1a2.3 2.3 0 0 1 0-3.3Z"
          fill="currentColor"
          className="text-accent"
        />
        <circle cx="14.8" cy="7.2" r="1.7" fill="currentColor" className="text-bg" />
      </svg>
      E-Shope
    </span>
  );
}