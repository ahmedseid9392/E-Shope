export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
      <div className="h-4 w-24 animate-pulse rounded bg-line/50" />
      <div className="mt-3 h-8 w-56 animate-pulse rounded bg-line/50" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-line/50" />
      <div className="mt-8 h-16 animate-pulse rounded-xl bg-line/50" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-line/50" />
        ))}
      </div>
    </main>
  );
}
