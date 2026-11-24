-- BIG MOV engagement, support, footer settings and manual RWF subscriptions
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  kind text not null default 'general' check (kind in ('general','chat','subscription','announcement','content')),
  target_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'Support request',
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chat_conversations_user_updated_idx on public.chat_conversations(user_id, updated_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('user','admin')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_conversation_created_idx on public.chat_messages(conversation_id, created_at);

create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id, settings)
values (true, jsonb_build_object(
  'social_instagram', '', 'social_x', '', 'social_youtube', '',
  'social_whatsapp', '', 'social_facebook', '',
  'ceo_name', 'ISHIMWE ELION PRINCE', 'ceo_title', 'Chief Executive Officer',
  'ceo_bio', 'Leading BIG MOV with a focus on making movie and television discovery simple, engaging, and accessible.',
  'ceo_image_url', '', 'payment_instructions', ''
))
on conflict (id) do nothing;

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_rwf integer not null default 0 check (price_rwf >= 0),
  duration_days integer not null default 30 check (duration_days between 1 and 3660),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status text not null default 'pending' check (status in ('pending','active','rejected','expired','cancelled')),
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_subscriptions_user_status_idx on public.user_subscriptions(user_id, status, expires_at desc);

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.user_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_rwf integer not null check (amount_rwf >= 0),
  transaction_reference text not null,
  payer_note text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists subscription_payments_status_created_idx on public.subscription_payments(status, created_at desc);

alter table public.notifications enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.subscription_payments enable row level security;

create policy "Users read own notifications or admins read all" on public.notifications
for select to authenticated using (user_id = auth.uid() or public.has_role('admin', auth.uid()));
create policy "Users update own notifications" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins create notifications" on public.notifications
for insert to authenticated with check (public.has_role('admin', auth.uid()));

create policy "Users read own chats or admins read all" on public.chat_conversations
for select to authenticated using (user_id = auth.uid() or public.has_role('admin', auth.uid()));
create policy "Users create own chat" on public.chat_conversations
for insert to authenticated with check (user_id = auth.uid());
create policy "Admins update chats" on public.chat_conversations
for update to authenticated using (public.has_role('admin', auth.uid())) with check (public.has_role('admin', auth.uid()));

create policy "Conversation members read messages" on public.chat_messages
for select to authenticated using (
  public.has_role('admin', auth.uid()) or exists (
    select 1 from public.chat_conversations c where c.id = conversation_id and c.user_id = auth.uid()
  )
);
create policy "Users and admins send authorized messages" on public.chat_messages
for insert to authenticated with check (
  sender_id = auth.uid() and (
    (sender_role = 'admin' and public.has_role('admin', auth.uid())) or
    (sender_role = 'user' and exists (
      select 1 from public.chat_conversations c where c.id = conversation_id and c.user_id = auth.uid() and c.status = 'open'
    ))
  )
);

create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);
create policy "Admins manage site settings" on public.site_settings
for all to authenticated using (public.has_role('admin', auth.uid())) with check (public.has_role('admin', auth.uid()));

create policy "Public can read active plans" on public.subscription_plans
for select to anon, authenticated using (is_active or public.has_role('admin', auth.uid()));
create policy "Admins manage plans" on public.subscription_plans
for all to authenticated using (public.has_role('admin', auth.uid())) with check (public.has_role('admin', auth.uid()));

create policy "Users read own subscriptions or admins read all" on public.user_subscriptions
for select to authenticated using (user_id = auth.uid() or public.has_role('admin', auth.uid()));
create policy "Users request own pending subscriptions" on public.user_subscriptions
for insert to authenticated with check (user_id = auth.uid() and status = 'pending' and starts_at is null and expires_at is null);
create policy "Admins manage subscriptions" on public.user_subscriptions
for update to authenticated using (public.has_role('admin', auth.uid())) with check (public.has_role('admin', auth.uid()));

create policy "Users read own payments or admins read all" on public.subscription_payments
for select to authenticated using (user_id = auth.uid() or public.has_role('admin', auth.uid()));
create policy "Users submit own pending payments" on public.subscription_payments
for insert to authenticated with check (
  user_id = auth.uid() and status = 'pending' and verified_by is null and verified_at is null and
  exists (select 1 from public.user_subscriptions s where s.id = subscription_id and s.user_id = auth.uid() and s.status = 'pending')
);
create policy "Admins verify payments" on public.subscription_payments
for update to authenticated using (public.has_role('admin', auth.uid())) with check (public.has_role('admin', auth.uid()));

create or replace function public.bump_chat_conversation_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.chat_conversations set updated_at = now() where id = new.conversation_id;
  if new.sender_role = 'admin' then
    insert into public.notifications(user_id, title, message, kind, target_url)
    select user_id, 'New support reply', left(new.body, 180), 'chat', '/support'
    from public.chat_conversations where id = new.conversation_id;
  end if;
  return new;
end;
$$;
drop trigger if exists chat_message_after_insert on public.chat_messages;
create trigger chat_message_after_insert after insert on public.chat_messages
for each row execute function public.bump_chat_conversation_updated_at();

create or replace function public.notify_subscription_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications(user_id, title, message, kind, target_url)
    values (new.user_id, 'Subscription update', 'Your subscription request is now ' || new.status || '.', 'subscription', '/subscription');
  end if;
  return new;
end;
$$;
drop trigger if exists subscription_status_notification on public.user_subscriptions;
create trigger subscription_status_notification after update of status on public.user_subscriptions
for each row execute function public.notify_subscription_status_change();

-- Only the server/admin can publish privileged decisions. Users submit payment references for manual review.
do $$
begin
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.chat_conversations; exception when duplicate_object then null; when undefined_object then null; end;
  begin alter publication supabase_realtime add table public.chat_messages; exception when duplicate_object then null; when undefined_object then null; end;
end $$;
