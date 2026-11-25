create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

comment on table public.categories is 'Categorías del catálogo público.';

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  sku         text not null unique,
  name        text not null,
  description text not null default '',
  image_url   text,
  category_id uuid not null references public.categories (id) on delete restrict,
  price       numeric(12,2) not null check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.products is 'Catálogo de productos. Solo se modifica con migraciones o seed.';

create index if not exists products_category_id_idx
  on public.products (category_id);

create index if not exists products_active_name_idx
  on public.products (name)
  where is_active;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  email      text not null,
  phone      text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos públicos del perfil. Lo crea el trigger on_auth_user_created.';

create index if not exists profiles_created_at_idx
  on public.profiles (created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name  text;
  v_phone text;
begin
  v_name := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  if v_name is null then
    v_name := split_part(coalesce(new.email, 'usuario'), '@', 1);
  end if;

  v_phone := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '');

  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    left(v_name, 120),
    coalesce(new.email, ''),
    left(v_phone, 20)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, email, phone)
select
  u.id,
  left(coalesce(nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)), 120),
  coalesce(u.email, ''),
  left(nullif(btrim(u.raw_user_meta_data ->> 'phone'), ''), 20)
from auth.users u
on conflict (id) do nothing;

alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.profiles   enable row level security;

revoke all on table public.categories from anon, authenticated;
revoke all on table public.products   from anon, authenticated;
revoke all on table public.profiles   from anon, authenticated;

grant select on table public.categories to anon, authenticated;
grant select on table public.products   to anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

drop policy if exists "categorias_lectura_publica" on public.categories;
create policy "categorias_lectura_publica"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "productos_activos_lectura_publica" on public.products;
create policy "productos_activos_lectura_publica"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "perfiles_lectura_autenticados" on public.profiles;
create policy "perfiles_lectura_autenticados"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "perfiles_actualiza_propio" on public.profiles;
create policy "perfiles_actualiza_propio"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end;
$$;

alter table public.categories
  add column if not exists slug text,
  add column if not exists sort_order integer not null default 0;

create unique index if not exists categories_slug_key
  on public.categories (slug);

alter table public.products
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists tagline text,
  add column if not exists previous_price numeric(12,2),
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists specs jsonb not null default '[]'::jsonb,
  add column if not exists is_featured boolean not null default false,
  add column if not exists hero_order integer,
  add column if not exists source_url text,
  add column if not exists source_checked_at timestamptz;

alter table public.products
  drop constraint if exists products_previous_price_check;

alter table public.products
  add constraint products_previous_price_check
  check (previous_price is null or previous_price >= 0);

create index if not exists products_featured_idx
  on public.products (is_featured)
  where is_active;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
  set public = true;

grant select, insert, update on table public.categories to service_role;
grant select, insert, update on table public.products to service_role;

insert into public.categories (name, slug, description, sort_order)
values
  ('Computadores', 'computadores', 'Portátiles, todo en uno, tabletas y lectores.', 1),
  ('Celulares', 'celulares', 'Smartphones Samsung, Motorola y Xiaomi.', 2),
  ('Pantallas', 'pantallas', 'Televisores y monitores.', 3),
  ('Hogar inteligente', 'hogar-inteligente', 'Asistentes de voz, limpieza y seguridad conectada.', 4),
  ('Gaming', 'gaming', 'Consolas, periféricos y sillas.', 5),
  ('Accesorios', 'accesorios', 'Audio, relojes inteligentes y periféricos.', 6)
on conflict (name) do update
  set slug = excluded.slug,
      description = excluded.description,
      sort_order = excluded.sort_order;
