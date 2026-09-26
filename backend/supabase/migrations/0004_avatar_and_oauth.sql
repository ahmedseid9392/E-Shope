-- Adds avatar_url to profiles (populated either by an OAuth provider like Google,
-- or later overwritten by the user's own Cloudinary upload).

alter table profiles add column if not exists avatar_url text;

-- Update the signup trigger to also capture avatar_url when it's present.
-- Google (and most OAuth providers) put the profile photo in raw_user_meta_data
-- under 'avatar_url' or 'picture' depending on provider — check both.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
