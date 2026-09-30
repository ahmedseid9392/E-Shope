export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-16">
      <div className="h-8 w-40 animate-pulse rounded bg-line/50" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-line/50" />
        ))}
      </div>
    </main>
  );
}
