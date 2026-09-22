-- BIG AI settings and usage log
create table if not exists public.big_ai_settings (
  id boolean primary key default true check (id = true),
  enabled boolean not null default true,
  name text not null default 'BIG AI',
  welcome_message text not null default 'Hi! I am BIG AI. I can help you discover movies, use BIG MOV, and find something to watch.',
  system_prompt text not null default 'You are BIG AI, the friendly assistant for BIG MOV. Help users discover movies and TV shows using the context provided. Keep answers concise and useful.',
  updated_at timestamptz not null default now()
);
insert into public.big_ai_settings (id) values (true) on conflict (id) do nothing;
alter table public.big_ai_settings enable row level security;
drop policy if exists "BIG AI settings are readable" on public.big_ai_settings;
create policy "BIG AI settings are readable" on public.big_ai_settings for select to anon, authenticated using (true);
drop policy if exists "Admins manage BIG AI settings" on public.big_ai_settings;
create policy "Admins manage BIG AI settings" on public.big_ai_settings for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create table if not exists public.big_ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  prompt_length integer not null default 0,
  response_length integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.big_ai_usage enable row level security;
drop policy if exists "Admins can view BIG AI usage" on public.big_ai_usage;
create policy "Admins can view BIG AI usage" on public.big_ai_usage for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "Authenticated users can log BIG AI usage" on public.big_ai_usage;
create policy "Authenticated users can log BIG AI usage" on public.big_ai_usage for insert to authenticated with check (user_id = auth.uid());
