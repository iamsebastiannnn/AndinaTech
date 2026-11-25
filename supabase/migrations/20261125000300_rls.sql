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

