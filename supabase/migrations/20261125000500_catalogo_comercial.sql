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
