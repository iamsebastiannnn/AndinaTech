import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const salida = path.join(raiz, 'catalogo');
const carpetaImagenes = path.join(salida, 'imagenes');
const registro = path.join(salida, 'recopilacion.log');

const PAUSA_MS = 450;
const MAX_IMAGENES = 4;
const LADO_GRANDE = 1400;
const LADO_MINIATURA = 560;
const AGENTE = 'AndinaCatalogo/1.0 (proyecto academico)';

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

async function anotar(mensaje) {
  console.log(mensaje);
  await appendFile(registro, `${new Date().toISOString()} ${mensaje}\n`);
}

function limpiarTexto(valor) {
  return String(valor ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8243;|&#8221;|&#8220;|&quot;|″|”|“/g, '"')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/¨/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function aSlug(valor) {
  return limpiarTexto(valor)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

function urlOriginal(src) {
  const url = new URL(src);
  if (url.hostname.endsWith('wp.com')) {
    return `https://${url.pathname.replace(/^\//, '')}`;
  }
  url.search = '';
  return url.toString();
}

async function descargar(url, comoJson) {
  const respuesta = await fetch(url, { headers: { 'User-Agent': AGENTE } });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status} en ${url}`);
  return comoJson ? respuesta.json() : Buffer.from(await respuesta.arrayBuffer());
}

async function analizarFondo(imagen) {
  const { data, info } = await imagen.clone().ensureAlpha().resize(64, 64, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const pixel = (x, y) => {
    const i = (y * info.width + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };
  const esquinas = [pixel(0, 0), pixel(63, 0), pixel(0, 63), pixel(63, 63)];
  const transparente = esquinas.every((p) => p[3] < 16);
  const blanco = !transparente && esquinas.every((p) => p[0] > 244 && p[1] > 244 && p[2] > 244);
  return transparente ? 'transparente' : blanco ? 'blanco' : 'ambiente';
}

async function optimizar(buffer, destinoBase) {
  let imagen = sharp(buffer, { failOn: 'none' }).rotate();
  const fondo = await analizarFondo(imagen);
  if (fondo !== 'ambiente') {
    try {
      const recortada = await imagen.clone().trim({ threshold: 12 }).toBuffer();
      const meta = await sharp(recortada).metadata();
      if (meta.width > 80 && meta.height > 80) imagen = sharp(recortada);
    } catch {
      imagen = sharp(buffer, { failOn: 'none' }).rotate();
    }
  }
  const grande = await imagen
    .clone()
    .resize(LADO_GRANDE, LADO_GRANDE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  const miniatura = await imagen
    .clone()
    .resize(LADO_MINIATURA, LADO_MINIATURA, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 88, effort: 5 })
    .toBuffer();
  await writeFile(`${destinoBase}.webp`, grande.data);
  await writeFile(`${destinoBase}-min.webp`, miniatura);
  return { ancho: grande.info.width, alto: grande.info.height, fondo, bytes: grande.data.length };
}

function leerAtributos(producto, omitir) {
  const especificaciones = [];
  let modelo = null;
  for (const atributo of producto.attributes ?? []) {
    const nombre = limpiarTexto(atributo.name);
    const valor = (atributo.terms ?? []).map((t) => limpiarTexto(t.name)).filter(Boolean).join(', ');
    if (!valor || omitir.includes(nombre)) continue;
    if (/^marca$/i.test(nombre) || /garant/i.test(nombre)) continue;
    if (/n[uú]mero de parte/i.test(nombre)) {
      modelo = valor;
      continue;
    }
    const etiqueta = /tama[nñ]o( de)? pantalla/i.test(nombre) ? 'Tamaño de pantalla' : nombre;
    especificaciones.push({ nombre: etiqueta, valor });
  }
  return { especificaciones, modelo };
}

function validar(registroProducto) {
  const errores = [];
  if (!registroProducto.sku) errores.push('sin SKU');
  if (!registroProducto.nombre) errores.push('sin nombre');
  if (!Number.isFinite(registroProducto.precio) || registroProducto.precio <= 0) errores.push('precio inválido');
  if (registroProducto.imagenes.length === 0) errores.push('sin imágenes');
  return errores;
}

async function principal() {
  const seleccion = JSON.parse(await readFile(path.join(raiz, 'scripts', 'catalogo', 'seleccion.json'), 'utf8'));
  const categoriasValidas = new Set(seleccion.categorias.map((c) => c.slug));
  await mkdir(salida, { recursive: true });
  await writeFile(registro, '');
  const consultado = new Date().toISOString();
  const productos = [];
  const skus = new Set();

  for (const elegido of seleccion.productos) {
    try {
      if (!categoriasValidas.has(elegido.categoria)) throw new Error(`categoría desconocida: ${elegido.categoria}`);
      const original = await descargar(`${seleccion.fuente}/wp-json/wc/store/v1/products/${elegido.id}`, true);
      await esperar(PAUSA_MS);

      const partesSku = limpiarTexto(original.sku).split(/\s*-\s*/);
      const sku = partesSku[0];
      const { especificaciones, modelo } = leerAtributos(original, elegido.omitirAtributos ?? []);
      const unidad = 10 ** (original.prices?.currency_minor_unit ?? 0);
      const precio = Number(original.prices?.price) / unidad;
      const regular = Number(original.prices?.regular_price) / unidad;
      const base = `${sku}-${aSlug(original.name)}`;
      const carpeta = path.join(carpetaImagenes, elegido.categoria);
      await mkdir(carpeta, { recursive: true });

      const imagenes = [];
      for (const [indice, imagen] of (original.images ?? []).slice(0, MAX_IMAGENES).entries()) {
        const origen = urlOriginal(imagen.src);
        try {
          const buffer = await descargar(origen, false);
          const nombreArchivo = `${base}-${indice + 1}`;
          const datos = await optimizar(buffer, path.join(carpeta, nombreArchivo));
          imagenes.push({
            archivo: `${elegido.categoria}/${nombreArchivo}.webp`,
            miniatura: `${elegido.categoria}/${nombreArchivo}-min.webp`,
            ancho: datos.ancho,
            alto: datos.alto,
            fondo: datos.fondo,
            origen,
          });
        } catch (error) {
          await anotar(`AVISO imagen omitida (${sku} #${indice + 1}): ${error.message}`);
        }
        await esperar(PAUSA_MS / 2);
      }

      if (elegido.principal && imagenes[elegido.principal - 1]) {
        const [preferida] = imagenes.splice(elegido.principal - 1, 1);
        imagenes.unshift(preferida);
      }

      const registroProducto = {
        sku,
        nombre: limpiarTexto(original.name),
        marca: limpiarTexto(original.brands?.[0]?.name) || null,
        modelo: modelo ?? partesSku.slice(1).join('-') ?? null,
        categoria: elegido.categoria,
        descripcion: elegido.descripcion,
        lema: elegido.lema ?? null,
        especificaciones,
        precio,
        precioAnterior: original.on_sale && regular > precio ? regular : null,
        disponible: Boolean(original.is_in_stock),
        destacado: Boolean(elegido.destacado),
        portada: elegido.portada ?? null,
        urlOrigen: original.permalink,
        consultado,
        imagenes,
      };

      const errores = validar(registroProducto);
      if (skus.has(sku)) errores.push('SKU duplicado');
      if (errores.length > 0) throw new Error(errores.join(', '));
      skus.add(sku);
      productos.push(registroProducto);
      await anotar(`OK ${sku} ${registroProducto.nombre} (${imagenes.length} imágenes, ${imagenes.map((i) => i.fondo[0]).join('')})`);
    } catch (error) {
      await anotar(`ERROR producto ${elegido.id}: ${error.message}`);
    }
  }

  const catalogo = { fuente: seleccion.fuente, consultado, categorias: seleccion.categorias, productos };
  await writeFile(path.join(salida, 'catalogo.json'), `${JSON.stringify(catalogo, null, 2)}\n`);
  await anotar(`Catálogo generado: ${productos.length} de ${seleccion.productos.length} productos`);
}

principal().catch(async (error) => {
  await anotar(`FALLO ${error.stack ?? error}`);
  process.exitCode = 1;
});
