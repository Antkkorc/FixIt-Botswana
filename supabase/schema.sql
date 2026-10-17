create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'user', 'provider')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  service_category text not null check (service_category in ('Plumbing', 'Electrical', 'Appliance Repair')),
  area text not null,
  bio text,
  verified boolean not null default false,
  credentials text[] not null default '{}',
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  jobs_completed integer not null default 0,
  avatar_url text,
  phone text,
  years_experience integer,
  available boolean not null default true,
  response_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  provider_name text not null,
  customer_name text not null,
  service text not null,
  location text,
  date date not null,
  time text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  price numeric(12,2),
  warranty text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  provider_name text not null,
  customer_name text not null,
  customer_phone text not null,
  service_needed text not null,
  location text not null,
  description text,
  preferred_date date,
  status text not null default 'pending' check (status in ('pending', 'responded', 'accepted', 'declined')),
  quoted_price numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  provider_id uuid not null references public.providers(id) on delete cascade,
  customer_name text not null,
  rating numeric(2,1) not null check (rating between 1 and 5),
  comment text not null,
  job_type text,
  created_at timestamptz not null default now()
);

create index if not exists providers_search_idx on public.providers (service_category, area, verified);
create index if not exists bookings_customer_idx on public.bookings (customer_id, date);
create index if not exists bookings_provider_idx on public.bookings (provider_id, date);
create index if not exists quote_requests_customer_idx on public.quote_requests (customer_id, created_at desc);
create index if not exists quote_requests_provider_idx on public.quote_requests (provider_id, created_at desc);
create index if not exists reviews_provider_idx on public.reviews (provider_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists providers_updated_at on public.providers;
create trigger providers_updated_at before update on public.providers for each row execute function public.set_updated_at();
drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();
drop trigger if exists quote_requests_updated_at on public.quote_requests;
create trigger quote_requests_updated_at before update on public.quote_requests for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.refresh_provider_rating()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.providers
  set rating = coalesce((select round(avg(rating), 2) from public.reviews where provider_id = coalesce(new.provider_id, old.provider_id)), 0),
      review_count = (select count(*) from public.reviews where provider_id = coalesce(new.provider_id, old.provider_id))
  where id = coalesce(new.provider_id, old.provider_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_refresh_provider on public.reviews;
create trigger reviews_refresh_provider after insert or update or delete on public.reviews for each row execute function public.refresh_provider_rating();

alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.bookings enable row level security;
alter table public.quote_requests enable row level security;
alter table public.reviews enable row level security;

create policy "profiles own record" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own record" on public.profiles for update using (auth.uid() = id);
create policy "providers public read" on public.providers for select using (true);
create policy "providers owner update" on public.providers for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "providers admin insert" on public.providers for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'provider')));
create policy "bookings customer or provider read" on public.bookings for select using (customer_id = auth.uid() or exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy "bookings customer insert" on public.bookings for insert with check (customer_id = auth.uid());
create policy "bookings participant update" on public.bookings for update using (customer_id = auth.uid() or exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy "quotes customer or provider read" on public.quote_requests for select using (customer_id = auth.uid() or exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy "quotes customer insert" on public.quote_requests for insert with check (customer_id = auth.uid());
create policy "quotes provider update" on public.quote_requests for update using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy "reviews public read" on public.reviews for select using (true);
create policy "reviews customer insert" on public.reviews for insert with check (customer_id = auth.uid());
