export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-semibold">My Store</h1>
      <p className="mt-2 text-neutral-600">
        Project scaffold is up. Start building here — see{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5">
          docs/architecture.md
        </code>{" "}
        and{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5">
          IMPLEMENTATION_PLAN.md
        </code>{" "}
        for what comes next.
      </p>
    </main>
  );
}
