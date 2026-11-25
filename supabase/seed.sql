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
