export function Logo() {
  return (
    <span className="flex items-center gap-1.5 font-display text-xl font-extrabold tracking-tight text-ink">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M2 8.5L8.5 2h5.5a2 2 0 0 1 2 2v5.5L9.5 16a2 2 0 0 1-2.8 0L2 10.8a2 2 0 0 1 0-2.3Z"
          className="fill-accent"
        />
        <circle cx="12" cy="6" r="1.4" className="fill-bg" />
      </svg>
      E-Shope
    </span>
  );
}
