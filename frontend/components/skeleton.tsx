/**
 * Base pulsing placeholder block. Compose these into page-specific
 * skeletons rather than styling `animate-pulse` inline everywhere.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-line/60 ${className}`}
    />
  );
}
