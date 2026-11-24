-- BIG MOV community, footer and USD manual-subscription foundation
-- All privileged actions are protected by the existing public.has_role() helper.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  kind text not null default 'system' check (kind in ('system','chat','subscription','content')),
  target_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users mark own notifications read" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins create notifications" on public.notifications for insert with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins read notifications" on public.notifications for select using (public.has_role(auth.uid(), 'admin'));

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'BIG MOV support',
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chat_conversations_user_updated_idx on public.chat_conversations(user_id, updated_at desc);
alter table public.chat_conversations enable row level security;
create policy "Users read own conversations" on public.chat_conversations for select using (auth.uid() = user_id);
create policy "Users create own conversations" on public.chat_conversations for insert with check (auth.uid() = user_id);
create policy "Users close own conversations" on public.chat_conversations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage conversations" on public.chat_conversations for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('user','admin')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_conversation_created_idx on public.chat_messages(conversation_id, created_at);
alter table public.chat_messages enable row level security;
create policy "Conversation participants read messages" on public.chat_messages for select using (
  public.has_role(auth.uid(), 'admin') or exists (
    select 1 from public.chat_conversations c where c.id = conversation_id and c.user_id = auth.uid()
  )
);
create policy "Users send messages in own open conversations" on public.chat_messages for insert with check (
  sender_id = auth.uid() and sender_role = 'user' and exists (
    select 1 from public.chat_conversations c where c.id = conversation_id and c.user_id = auth.uid() and c.status = 'open'
  )
);
create policy "Admins send replies" on public.chat_messages for insert with check (
  sender_id = auth.uid() and sender_role = 'admin' and public.has_role(auth.uid(), 'admin')
);

create or replace function public.notify_chat_reply()
returns trigger language plpgsql security definer set search_path = public as $$
declare recipient uuid;
begin
  if new.sender_role = 'admin' then
    select user_id into recipient from public.chat_conversations where id = new.conversation_id;
    if recipient is not null then
      insert into public.notifications(user_id,title,message,kind,target_url)
      values (recipient,'New BIG MOV support reply',left(new.body,180),'chat','/help');
    end if;
  end if;
  update public.chat_conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;
drop trigger if exists on_chat_message_notify on public.chat_messages;
create trigger on_chat_message_notify after insert on public.chat_messages for each row execute function public.notify_chat_reply();

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.site_settings enable row level security;
create policy "Public can read footer settings" on public.site_settings for select using (setting_key = 'footer');
create policy "Admins manage site settings" on public.site_settings for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
insert into public.site_settings(setting_key,setting_value) values
('footer', jsonb_build_object(
  'socials', jsonb_build_object(
    'instagram','https://www.instagram.com/','x','https://x.com/',
    'youtube','https://www.youtube.com/','whatsapp','https://www.whatsapp.com/',
    'facebook','https://www.facebook.com/'
  ),
  'ceo', jsonb_build_object(
    'name','BIG MOV Founder','title','Chief Executive Officer',
    'bio','Leading BIG MOV with a focus on making movie and television discovery simple, engaging, and accessible.',
    'portrait_url',''
  )
)) on conflict (setting_key) do nothing;

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_usd numeric(10,2) not null check (price_usd >= 0),
  duration_days integer not null check (duration_days > 0),
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscription_plans enable row level security;
create policy "Anyone can view active plans" on public.subscription_plans for select using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage plans" on public.subscription_plans for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  status text not null default 'pending' check (status in ('pending','active','expired','cancelled','rejected')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_subscriptions_user_status_idx on public.user_subscriptions(user_id,status);
alter table public.user_subscriptions enable row level security;
create policy "Users read own subscriptions" on public.user_subscriptions for select using (auth.uid() = user_id);
create policy "Users request own subscriptions" on public.user_subscriptions for insert with check (auth.uid() = user_id and status = 'pending' and starts_at is null and ends_at is null);
create policy "Admins manage subscriptions" on public.user_subscriptions for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.user_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric(10,2) not null check (amount_usd >= 0),
  payment_method text not null,
  payer_name text not null,
  transaction_reference text not null,
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists subscription_payments_status_created_idx on public.subscription_payments(status,created_at desc);
alter table public.subscription_payments enable row level security;
create policy "Users read own payment requests" on public.subscription_payments for select using (auth.uid() = user_id);
create policy "Users submit own payment requests" on public.subscription_payments for insert with check (auth.uid() = user_id and status = 'pending' and reviewed_by is null and reviewed_at is null);
create policy "Admins review payment requests" on public.subscription_payments for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update payment requests" on public.subscription_payments for update using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.review_subscription_payment(_payment_id uuid, _approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare payment_row public.subscription_payments%rowtype;
declare subscription_row public.user_subscriptions%rowtype;
declare plan_days integer;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Administrator access required';
  end if;
  select * into payment_row from public.subscription_payments where id = _payment_id for update;
  if not found or payment_row.status <> 'pending' then
    raise exception 'Pending payment request not found';
  end if;
  select * into subscription_row from public.user_subscriptions where id = payment_row.subscription_id for update;
  if not found then raise exception 'Subscription request not found'; end if;
  if _approve then
    select duration_days into plan_days from public.subscription_plans where id = subscription_row.plan_id;
    update public.subscription_payments set status='approved', reviewed_by=auth.uid(), reviewed_at=now() where id=_payment_id;
    update public.user_subscriptions set status='active', starts_at=now(), ends_at=now() + make_interval(days => plan_days), updated_at=now() where id=subscription_row.id;
    insert into public.notifications(user_id,title,message,kind,href)
    values (payment_row.user_id,'Subscription activated','Your BIG MOV subscription is now active.','subscription','/subscription');
  else
    update public.subscription_payments set status='rejected', reviewed_by=auth.uid(), reviewed_at=now() where id=_payment_id;
    update public.user_subscriptions set status='rejected', updated_at=now() where id=subscription_row.id;
    insert into public.notifications(user_id,title,message,kind,href)
    values (payment_row.user_id,'Payment request not approved','Your subscription payment needs review. Please contact BIG MOV support.','subscription','/subscription');
  end if;
end;
$$;
revoke all on function public.review_subscription_payment(uuid,boolean) from public;
grant execute on function public.review_subscription_payment(uuid,boolean) to authenticated;

-- Realtime events for chat and notification updates.
alter table public.chat_messages replica identity full;
alter table public.notifications replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
when undefined_object then null;
end $$;

create or replace function public.request_subscription(
  _plan_id uuid,
  _payment_method text,
  _payer_name text,
  _transaction_reference text,
  _notes text default ''
)
returns uuid language plpgsql security definer set search_path = public as $$
declare plan_row public.subscription_plans%rowtype;
declare new_subscription uuid;
begin
  if auth.uid() is null then raise exception 'Sign in is required'; end if;
  select * into plan_row from public.subscription_plans where id = _plan_id and is_active = true;
  if not found then raise exception 'This subscription plan is unavailable'; end if;
  if char_length(trim(coalesce(_payment_method,''))) < 2
    or char_length(trim(coalesce(_payer_name,''))) < 2
    or char_length(trim(coalesce(_transaction_reference,''))) < 3 then
    raise exception 'Complete the payment details before submitting';
  end if;
  insert into public.user_subscriptions(user_id,plan_id,status)
  values(auth.uid(),plan_row.id,'pending') returning id into new_subscription;
  insert into public.subscription_payments(subscription_id,user_id,amount_usd,payment_method,payer_name,transaction_reference,notes)
  values(new_subscription,auth.uid(),plan_row.price_usd,trim(_payment_method),trim(_payer_name),trim(_transaction_reference),coalesce(_notes,''));
  return new_subscription;
end;
$$;
revoke all on function public.request_subscription(uuid,text,text,text,text) from public;
grant execute on function public.request_subscription(uuid,text,text,text,text) to authenticated;
