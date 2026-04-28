create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  idea_text text,
  report jsonb,
  class_code text,
  created_at timestamptz default now()
);
