export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="aspect-square animate-pulse rounded-lg bg-line/50" />
        <div className="space-y-4">
          <div className="h-7 w-2/3 animate-pulse rounded bg-line/50" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-line/50" />
          <div className="h-20 animate-pulse rounded bg-line/50" />
          <div className="h-11 w-40 animate-pulse rounded bg-line/50" />
        </div>
      </div>
    </main>
  );
}
