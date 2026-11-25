import { access, appendFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const carpeta = path.join(raiz, 'catalogo');
const registro = path.join(carpeta, 'importacion.log');
const BUCKET = 'product-images';

const argumentos = new Set(process.argv.slice(2));
const simular = argumentos.has('--simular');
const desactivarAnteriores = argumentos.has('--desactivar-anteriores');
const omitirImagenes = argumentos.has('--sin-imagenes');

let errores = 0;

async function anotar(mensaje, esError = false) {
  if (esError) errores += 1;
  console.log(mensaje);
  await appendFile(registro, `${new Date().toISOString()} ${esError ? 'ERROR ' : ''}${mensaje}\n`);
}

async function leerEntorno() {
  const valores = { ...process.env };
  try {
    const contenido = await readFile(path.join(raiz, '.env.importacion'), 'utf8');
    for (const linea of contenido.split(/\r?\n/)) {
      const coincidencia = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (coincidencia) valores[coincidencia[1]] = coincidencia[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    await anotar('No existe .env.importacion; se usan las variables del sistema.');
  }
  return valores;
}

function validarCatalogo(catalogo) {
  const problemas = [];
  const categorias = new Set(catalogo.categorias.map((c) => c.slug));
  const skus = new Set();
  for (const producto of catalogo.productos) {
    const etiqueta = `${producto.sku ?? '?'} ${producto.nombre ?? ''}`.trim();
    if (!producto.sku) problemas.push(`${etiqueta}: sin SKU`);
    if (skus.has(producto.sku)) problemas.push(`${etiqueta}: SKU duplicado`);
    skus.add(producto.sku);
    if (!producto.nombre) problemas.push(`${etiqueta}: sin nombre`);
    if (!categorias.has(producto.categoria)) problemas.push(`${etiqueta}: categoría inválida "${producto.categoria}"`);
    if (!Number.isFinite(producto.precio) || producto.precio <= 0) problemas.push(`${etiqueta}: precio inválido`);
    if (producto.precioAnterior != null && producto.precioAnterior <= producto.precio) {
      problemas.push(`${etiqueta}: el precio anterior no es mayor que el actual`);
    }
    if (!Array.isArray(producto.imagenes) || producto.imagenes.length === 0) problemas.push(`${etiqueta}: sin imágenes`);
  }
  return problemas;
}

async function comprobarArchivos(catalogo) {
  const faltantes = [];
  for (const producto of catalogo.productos) {
    for (const imagen of producto.imagenes) {
      for (const archivo of [imagen.archivo, imagen.miniatura]) {
        try {
          await access(path.join(carpeta, 'imagenes', archivo));
        } catch {
          faltantes.push(archivo);
        }
      }
    }
  }
  return faltantes;
}

async function principal() {
  await writeFile(registro, '');
  const entorno = await leerEntorno();
  const url = entorno.SUPABASE_URL ?? entorno.EXPO_PUBLIC_SUPABASE_URL;
  const clave = entorno.SUPABASE_SECRET_KEY ?? entorno.SUPABASE_SERVICE_ROLE_KEY;
  const catalogo = JSON.parse(await readFile(path.join(carpeta, 'catalogo.json'), 'utf8'));

  const problemas = validarCatalogo(catalogo);
  const faltantes = await comprobarArchivos(catalogo);
  for (const problema of problemas) await anotar(problema, true);
  for (const archivo of faltantes) await anotar(`Falta la imagen ${archivo}`, true);
  if (errores > 0) throw new Error('El catálogo no pasó la validación. No se modificó nada.');
  await anotar(`Validación correcta: ${catalogo.productos.length} productos, ${catalogo.categorias.length} categorías.`);

  if (simular) {
    await anotar('Modo simulación: no se envió nada a Supabase.');
    return;
  }
  if (!url || !clave) {
    throw new Error('Faltan SUPABASE_URL y SUPABASE_SECRET_KEY en .env.importacion.');
  }

  const supabase = createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
  const urlPublica = (archivo) => `${url}/storage/v1/object/public/${BUCKET}/${archivo}`;

  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (!bucket) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`No se pudo crear el bucket: ${error.message}`);
    await anotar(`Bucket ${BUCKET} creado.`);
  }

  if (!omitirImagenes) {
    let subidas = 0;
    for (const producto of catalogo.productos) {
      for (const imagen of producto.imagenes) {
        for (const archivo of [imagen.archivo, imagen.miniatura]) {
          const contenido = await readFile(path.join(carpeta, 'imagenes', archivo));
          const { error } = await supabase.storage.from(BUCKET).upload(archivo, contenido, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true,
          });
          if (error) await anotar(`No se pudo subir ${archivo}: ${error.message}`, true);
          else subidas += 1;
        }
      }
    }
    await anotar(`Imágenes subidas: ${subidas}.`);
    if (errores > 0) throw new Error('Hubo errores al subir imágenes. No se modificó el catálogo.');
  }

  const { data: anteriores, error: errorLectura } = await supabase.from('products').select('*');
  if (errorLectura) throw new Error(`No se pudo leer el catálogo actual: ${errorLectura.message}`);
  const respaldo = path.join(carpeta, `respaldo-productos-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await writeFile(respaldo, JSON.stringify(anteriores, null, 2));
  await anotar(`Respaldo de ${anteriores.length} productos en ${path.basename(respaldo)}.`);

  const filasCategorias = catalogo.categorias.map((c) => ({
    name: c.nombre,
    slug: c.slug,
    description: c.descripcion,
    sort_order: c.orden,
  }));
  const { data: categorias, error: errorCategorias } = await supabase
    .from('categories')
    .upsert(filasCategorias, { onConflict: 'name' })
    .select('id, slug');
  if (errorCategorias) throw new Error(`No se pudieron guardar las categorías: ${errorCategorias.message}`);
  const idPorSlug = new Map(categorias.map((c) => [c.slug, c.id]));

  const filas = catalogo.productos.map((p) => ({
    sku: p.sku,
    name: p.nombre,
    description: p.descripcion,
    brand: p.marca,
    model: p.modelo,
    tagline: p.lema,
    category_id: idPorSlug.get(p.categoria),
    price: p.precio,
    previous_price: p.precioAnterior,
    stock: p.disponible ? 1 : 0,
    is_active: true,
    is_featured: p.destacado,
    hero_order: p.portada,
    image_url: urlPublica(p.imagenes[0].archivo),
    images: p.imagenes.map((i) => ({
      url: urlPublica(i.archivo),
      thumb: urlPublica(i.miniatura),
      width: i.ancho,
      height: i.alto,
      background: i.fondo,
    })),
    specs: p.especificaciones.map((e) => ({ label: e.nombre, value: e.valor })),
    source_url: p.urlOrigen,
    source_checked_at: p.consultado,
  }));

  const { error: errorProductos } = await supabase.from('products').upsert(filas, { onConflict: 'sku' });
  if (errorProductos) throw new Error(`No se pudieron guardar los productos: ${errorProductos.message}`);
  await anotar(`Productos creados o actualizados: ${filas.length}.`);

  const vigentes = new Set(filas.map((f) => f.sku));
  const sobrantes = anteriores.filter((p) => p.is_active && !vigentes.has(p.sku));
  if (sobrantes.length === 0) {
    await anotar('No hay productos anteriores activos fuera del catálogo.');
  } else if (desactivarAnteriores) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .in('sku', sobrantes.map((p) => p.sku));
    if (error) await anotar(`No se pudieron desactivar los anteriores: ${error.message}`, true);
    else await anotar(`Productos anteriores desactivados (no eliminados): ${sobrantes.map((p) => p.sku).join(', ')}.`);
  } else {
    await anotar(`Siguen activos ${sobrantes.length} productos anteriores. Use --desactivar-anteriores para ocultarlos.`);
  }

  await anotar(errores === 0 ? 'Importación terminada sin errores.' : `Importación terminada con ${errores} errores.`);
}

principal().catch(async (error) => {
  await anotar(error.message, true);
  process.exitCode = 1;
});
