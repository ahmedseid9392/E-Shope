-- Stores messages submitted through the public /contact page. Anyone (even
-- signed out) can submit one; only admins can read them back.
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy "anyone can submit a contact message" on contact_messages
  for insert
  with check (true);

create policy "admins can read contact messages" on contact_messages
  for select
  using (is_admin());
