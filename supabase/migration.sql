-- Extensions
create extension if not exists "uuid-ossp";

-- Users profile table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  bio text,
  avatar_url text,
  strike_count int not null default 0,
  is_banned boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text not null,
  title text not null,
  content text not null,
  is_anonymous boolean not null default false,
  upvotes_count int not null default 0,
  downvotes_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reported_post_id uuid references public.posts(id) on delete cascade,
  reported_user_id uuid references public.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  value int not null check (value in (-1,1)),
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- Categories seed helper
create table if not exists public.categories (name text primary key);
insert into public.categories(name)
values
  ('Sports'), ('Relationships'), ('Work'), ('Family'), ('Money'), ('Politics'),
  ('Mental Health'), ('Entrepreneurship'), ('Random Rants')
on conflict do nothing;

create or replace function public.increment_post_upvote(post_id_input uuid)
returns void language sql security definer as $$
  update public.posts set upvotes_count = upvotes_count + 1 where id = post_id_input;
$$;

create or replace function public.increment_post_downvote(post_id_input uuid)
returns void language sql security definer as $$
  update public.posts set downvotes_count = downvotes_count + 1 where id = post_id_input;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users(id, username, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.follows enable row level security;
alter table public.blocks enable row level security;
alter table public.messages enable row level security;
alter table public.votes enable row level security;

create policy "Public can read users" on public.users for select using (true);
create policy "Users update self" on public.users for update using (auth.uid() = id);

create policy "Read posts" on public.posts for select using (true);
create policy "Insert posts for non-banned users" on public.posts for insert
with check (
  auth.uid() = user_id
  and exists(select 1 from public.users u where u.id = auth.uid() and u.is_banned = false)
);
create policy "Delete own posts" on public.posts for delete using (auth.uid() = user_id);

create policy "Read comments" on public.comments for select using (true);
create policy "Insert comments non-banned" on public.comments for insert
with check (
  auth.uid() = user_id
  and exists(select 1 from public.users u where u.id = auth.uid() and u.is_banned = false)
);
create policy "Delete own comments" on public.comments for delete using (auth.uid() = user_id);

create policy "Create reports" on public.reports for insert with check (auth.uid() is not null);
create policy "Read own messages" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Create message" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Manage follows" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "Manage blocks" on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
create policy "Create one vote" on public.votes for insert with check (auth.uid() = user_id);
create policy "Read votes" on public.votes for select using (true);
