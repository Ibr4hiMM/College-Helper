-- Defense in depth: clients only ever read these tables (profiles are written by the
-- security-definer signup trigger), so remove the default write grants rather than relying on RLS alone.
revoke insert, update, delete, truncate on public.universities, public.majors, public.profiles from anon, authenticated;

-- Covers the composite FK (flagged by the performance advisor).
create index profiles_university_major_idx on public.profiles (university_id, major_id);
