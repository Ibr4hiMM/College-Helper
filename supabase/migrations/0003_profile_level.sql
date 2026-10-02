-- Study level captured at signup. Nullable so accounts created before this migration stay valid;
-- the signup form requires it, and an unknown value fails the check and aborts the signup.
alter table public.profiles
  add column level text check (level in ('prep', 'early', 'upper', 'final', 'postgrad'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- missing or mismatched metadata raises, which aborts the signup
  insert into public.profiles (id, university_id, major_id, level)
  values (
    new.id,
    new.raw_user_meta_data ->> 'university_id',
    (new.raw_user_meta_data ->> 'major_id')::bigint,
    new.raw_user_meta_data ->> 'level'
  );
  return new;
end;
$$;
