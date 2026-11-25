insert into public.categories (name, description)
values
  ('Tecnología', 'Portátiles, monitores, audio, periféricos y accesorios.'),
  ('Hogar', 'Electrodomésticos y productos inteligentes para el hogar.')
on conflict (name) do update
  set description = excluded.description;

insert into public.products (sku, name, description, image_url, category_id, price, stock, is_active)
select
  v.sku,
  v.name,
  v.description,
  'https://images.unsplash.com/photo-' || v.photo || '?auto=format&fit=crop&w=800&q=70',
  c.id,
  v.price,
  v.stock,
  v.is_active
from (
  values
    ('TEC-POR-001', 'Portátil Andes Book 14" Core i5',
     'Pantalla Full HD de 14", 16 GB de RAM y SSD de 512 GB. Ideal para estudio y oficina.',
     '1496181133206-80ce9b88a853', 'Tecnología', 2899900.00, 12, true),
    ('TEC-MON-001', 'Monitor Nevado 27" QHD',
     'Panel IPS de 27 pulgadas, resolución 2560 × 1440 y 75 Hz con bordes delgados.',
     '1527443224154-c4a3942d3acf', 'Tecnología', 1299900.00, 8, true),
    ('TEC-AUD-001', 'Audífonos de diadema Páramo Bluetooth',
     'Sonido envolvente, hasta 30 horas de batería y almohadillas plegables.',
     '1505740420928-5e560c06d30e', 'Tecnología', 289900.00, 25, true),
    ('TEC-AUD-002', 'Audífonos inalámbricos Colibrí TWS',
     'In-ear con estuche de carga, cancelación de ruido y resistencia al sudor.',
     '1606220588913-b3aacb4d2f46', 'Tecnología', 189900.00, 40, true),
    ('TEC-TEC-001', 'Teclado inalámbrico Sabana en español',
     'Distribución latinoamericana con Ñ, perfil bajo y conexión Bluetooth multidispositivo.',
     '1587829741301-dc798b83add3', 'Tecnología', 159900.00, 30, true),
    ('TEC-ACC-001', 'Mouse inalámbrico ergonómico Cóndor',
     'Sensor óptico de 1600 DPI, receptor USB y batería de larga duración.',
     '1527864550417-7fd91fc51a46', 'Tecnología', 79900.00, 60, true),
    ('TEC-ACC-002', 'Batería portátil 20.000 mAh',
     'Carga rápida de 22,5 W con dos puertos USB y uno USB-C.',
     '1609091839311-d5365f9ff1c5', 'Tecnología', 119900.00, 0, true),
    ('TEC-TAB-001', 'Tablet Tayrona 11" 128 GB',
     'Pantalla 2K de 11", 6 GB de RAM y cuatro parlantes. Incluye lápiz óptico.',
     '1544244015-0df4b3ffc6b0', 'Tecnología', 1499900.00, 9, true),
    ('TEC-REL-001', 'Reloj inteligente Cocora Fit',
     'Monitoreo de ritmo cardíaco, GPS integrado y batería para 7 días.',
     '1523275335684-37898b6baf30', 'Tecnología', 349900.00, 18, true),
    ('TEC-TV-001', 'Televisor Smart TV 55" 4K UHD',
     'Imagen 4K con HDR, aplicaciones de streaming y control por voz.',
     '1593359677879-a4bb92f829d1', 'Tecnología', 2199900.00, 6, true),
    ('TEC-TAB-000', 'Tablet Tayrona 10" (descontinuada)',
     'Modelo anterior, retirado del catálogo.',
     '1587033411391-5d9e51cce126', 'Tecnología', 999900.00, 0, false),

    ('HOG-CAF-001', 'Cafetera de goteo 12 tazas',
     'Jarra de vidrio, filtro permanente y función para mantener el café caliente.',
     '1570222094114-d054a817e56b', 'Hogar', 219900.00, 15, true),
    ('HOG-LIC-001', 'Licuadora de vaso de vidrio 1,5 L',
     'Motor de 600 W, tres velocidades y cuchillas de acero inoxidable.',
     '1585515320310-259814833e62', 'Hogar', 189900.00, 22, true),
    ('HOG-HOR-001', 'Horno tostador 23 L',
     'Temporizador de 60 minutos, bandeja y parrilla. Hornea, tuesta y gratina.',
     '1574269909862-7e1d70bb8078', 'Hogar', 329900.00, 10, true),
    ('HOG-LAV-001', 'Lavadora carga frontal 18 kg',
     'Motor inverter, 14 programas de lavado y bajo consumo de agua.',
     '1626806787461-102c1bfaaea1', 'Hogar', 2499900.00, 4, true),
    ('HOG-ASP-001', 'Aspiradora robot con mapeo láser',
     'Aspira y trapea, vuelve sola a la base y se controla desde el celular.',
     '1558317374-067fb5f30001', 'Hogar', 1099900.00, 7, true),
    ('HOG-INT-001', 'Parlante inteligente con asistente de voz',
     'Controla luces y enchufes, reproduce música y responde en español.',
     '1543512214-318c7553f230', 'Hogar', 249900.00, 20, true),
    ('HOG-INT-002', 'Cerradura inteligente Wi-Fi',
     'Abre con el celular, clave o llave. Registro de accesos en tiempo real.',
     '1558002038-1055907df827', 'Hogar', 689900.00, 5, true)
) as v (sku, name, description, photo, category_name, price, stock, is_active)
join public.categories c on c.name = v.category_name
on conflict (sku) do update
  set name        = excluded.name,
      description = excluded.description,
      image_url   = excluded.image_url,
      category_id = excluded.category_id,
      price       = excluded.price,
      stock       = excluded.stock,
      is_active   = excluded.is_active;
