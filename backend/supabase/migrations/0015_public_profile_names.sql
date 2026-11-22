-- Public, review-safe profile fields. This deliberately excludes email and
-- other private profile information.
create view public_profile_names
  with (security_invoker = false)
  as
  select id, full_name, avatar_url
  from profiles;

grant select on public_profile_names to anon, authenticated;
