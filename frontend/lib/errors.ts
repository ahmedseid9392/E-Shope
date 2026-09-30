/**
 * Central place for turning a raw Supabase/Postgres error into something
 * safe to show a user, while still logging the real error for debugging.
 *
 * Without this, `error.message` from Postgres (e.g. "duplicate key value
 * violates unique constraint \"products_slug_key\"") ends up rendered
 * straight into the UI — confusing for users and a minor information leak
 * about the schema. Every server action should route database errors
 * through here instead of throwing/returning `error.message` directly.
 */

type DbError = { message: string; code?: string } | null | undefined;

const CODE_MESSAGES: Record<string, string> = {
  "23505": "That already exists — try a different value.",
  "23503": "That item is linked to something else and can't be used right now.",
  "23514": "That value isn't allowed.",
  "42501": "You don't have permission to do that.",
  PGRST301: "You don't have permission to do that.",
  "42P01": "Something is misconfigured on our end. Please try again later.",
};

const DEFAULT_MESSAGE = "Something went wrong. Please try again in a moment.";

/**
 * Logs the real error server-side and returns a safe message to show the
 * user. `overrides` lets a specific action give a more helpful message for
 * a particular Postgres error code (e.g. a friendlier duplicate-slug message).
 */
export function dbErrorMessage(
  error: NonNullable<DbError>,
  context: string,
  overrides?: Record<string, string>
): string {
  // eslint-disable-next-line no-console -- intentional server-side diagnostic log
  console.error(`[${context}]`, error.message);
  if (error.code && overrides?.[error.code]) return overrides[error.code];
  if (error.code && CODE_MESSAGES[error.code]) return CODE_MESSAGES[error.code];
  return DEFAULT_MESSAGE;
}

/**
 * Same idea as `dbErrorMessage`, but throws instead of returning — for
 * actions that don't use a `{ error }` state object and instead rely on the
 * caller / error boundary to handle a thrown error.
 */
export function assertNoDbError(
  error: DbError,
  context: string,
  overrides?: Record<string, string>
): void {
  if (!error) return;
  throw new Error(dbErrorMessage(error, context, overrides));
}

/**
 * Safely pulls a display message out of a caught error on the client.
 * Use this in `catch` blocks around server action calls so a rejected
 * promise never crashes a component with an unhandled error.
 */
export function getErrorMessage(err: unknown, fallback = DEFAULT_MESSAGE): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
