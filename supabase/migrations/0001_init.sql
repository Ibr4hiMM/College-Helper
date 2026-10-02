-- Universities, majors, and the per-user profile captured at signup.

create table public.universities (
  id text primary key, -- slug, e.g. 'ksu'
  name_ar text not null,
  name_en text not null
);

create table public.majors (
  id bigint generated always as identity primary key,
  university_id text not null references public.universities (id) on delete cascade,
  slug text not null,
  name_ar text not null,
  name_en text not null,
  unique (university_id, slug),
  unique (university_id, id)
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  university_id text not null,
  major_id bigint not null,
  created_at timestamptz not null default now(),
  -- the major must belong to the chosen university
  foreign key (university_id, major_id) references public.majors (university_id, id)
);

alter table public.universities enable row level security;
alter table public.majors enable row level security;
alter table public.profiles enable row level security;

create policy "universities are public" on public.universities
  for select to anon, authenticated using (true);
create policy "majors are public" on public.majors
  for select to anon, authenticated using (true);
create policy "users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
-- no insert/update policies: profiles are written only by the trigger below

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- missing or mismatched metadata raises, which aborts the signup
  insert into public.profiles (id, university_id, major_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'university_id',
    (new.raw_user_meta_data ->> 'major_id')::bigint
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sample seed; the real list replaces this when curriculum data arrives.
insert into public.universities (id, name_ar, name_en) values
  ('ksu', 'جامعة الملك سعود', 'King Saud University'),
  ('kau', 'جامعة الملك عبدالعزيز', 'King Abdulaziz University'),
  ('kfupm', 'جامعة الملك فهد للبترول والمعادن', 'King Fahd University of Petroleum and Minerals');

insert into public.majors (university_id, slug, name_ar, name_en) values
  ('ksu', 'computer-science', 'علوم الحاسب', 'Computer Science'),
  ('ksu', 'information-systems', 'نظم المعلومات', 'Information Systems'),
  ('ksu', 'medicine', 'الطب', 'Medicine'),
  ('kau', 'computer-science', 'علوم الحاسب', 'Computer Science'),
  ('kau', 'industrial-engineering', 'الهندسة الصناعية', 'Industrial Engineering'),
  ('kau', 'accounting', 'المحاسبة', 'Accounting'),
  ('kfupm', 'software-engineering', 'هندسة البرمجيات', 'Software Engineering'),
  ('kfupm', 'petroleum-engineering', 'هندسة البترول', 'Petroleum Engineering'),
  ('kfupm', 'mechanical-engineering', 'الهندسة الميكانيكية', 'Mechanical Engineering');
