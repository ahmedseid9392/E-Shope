alter table profiles add column if not exists avatar_url text;

-- No new RLS policy needed: the existing "update own profile" policy
-- (auth.uid() = id) already covers updates to any column, avatar_url included.
