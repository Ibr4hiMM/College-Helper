-- Curriculum store for RAG: chunks embedded with text-embedding-3-small (1536 dimensions).
create extension if not exists vector with schema extensions;

create table public.curriculum_chunks (
  id bigint generated always as identity primary key,
  university_id text not null references public.universities (id) on delete cascade,
  major_id bigint, -- null: applies to the whole university
  course_code text not null,
  title text not null,
  lang text not null check (lang in ('ar', 'en')),
  content text not null,
  source text not null,
  content_hash text not null unique, -- re-ingesting the same text inserts nothing
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  -- a chunk's major must belong to its university (not checked when major_id is null)
  foreign key (university_id, major_id) references public.majors (university_id, id) on delete cascade
);

create index curriculum_chunks_embedding_idx on public.curriculum_chunks
  using hnsw (embedding extensions.vector_cosine_ops);
create index curriculum_chunks_scope_idx on public.curriculum_chunks (university_id, major_id);

alter table public.curriculum_chunks enable row level security;
-- Scope is relevance, not secrecy: any signed-in student may read curriculum; nothing writes from the app.
create policy "signed-in students read curriculum" on public.curriculum_chunks
  for select to authenticated using (true);
revoke insert, update, delete, truncate on public.curriculum_chunks from anon, authenticated;
revoke select on public.curriculum_chunks from anon;

create function public.match_curriculum(
  query_embedding extensions.vector(1536),
  p_university_id text,
  p_major_id bigint,
  match_count int default 6
)
returns table (course_code text, title text, content text, source text, similarity float)
language sql
stable
security invoker
set search_path = ''
-- Filtered HNSW: keep scanning past other majors' neighbours so one major still gets its rows.
set hnsw.iterative_scan = relaxed_order
as $$
  with nearest as materialized (
    select c.course_code, c.title, c.content, c.source,
           c.embedding operator(extensions.<=>) query_embedding as distance
    from public.curriculum_chunks c
    where c.university_id = p_university_id
      and (c.major_id = p_major_id or c.major_id is null)
    order by distance
    limit least(match_count, 20)
  )
  select course_code, title, content, source, 1 - distance as similarity
  from nearest
  order by distance;
$$;

revoke execute on function public.match_curriculum(extensions.vector, text, bigint, int) from public, anon;
grant execute on function public.match_curriculum(extensions.vector, text, bigint, int) to authenticated;
