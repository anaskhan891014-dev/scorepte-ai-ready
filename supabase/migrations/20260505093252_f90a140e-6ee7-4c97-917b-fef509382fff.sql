create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_slug text not null,
  question_name text not null,
  category text not null,
  score int,
  max_score int default 90,
  breakdown jsonb,
  feedback jsonb,
  user_response text,
  created_at timestamptz not null default now()
);

alter table public.practice_attempts enable row level security;

create policy "Users view own attempts" on public.practice_attempts
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own attempts" on public.practice_attempts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own attempts" on public.practice_attempts
  for delete to authenticated using (auth.uid() = user_id);

create index practice_attempts_user_created on public.practice_attempts(user_id, created_at desc);