-- Auto-create a profiles row whenever a new user signs up via Supabase Auth.
-- This is more reliable than inserting the profile from application code —
-- it can't be skipped by a failed request or a client that forgets to call it.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
