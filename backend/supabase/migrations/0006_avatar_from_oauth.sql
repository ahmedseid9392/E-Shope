-- Google (and other OAuth) sign-ins populate raw_user_meta_data with an
-- avatar_url. Update the signup trigger to capture it, so Google users get
-- their profile picture automatically instead of starting blank.
-- Safe to run again even if 0002 already ran — CREATE OR REPLACE just updates
-- the function body in place.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
