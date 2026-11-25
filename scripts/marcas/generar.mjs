import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const destino = path.join(raiz, 'assets', 'marcas');
const BASE = 'https://infotechonline.co/wp-content/uploads';
const GRIS = { r: 122, g: 130, b: 134 };
const ALTO = 96;
const AGENTE = 'AndinaCatalogo/1.0 (proyecto academico)';

const MARCAS = [
  { slug: 'amazon', nombre: 'Amazon', archivo: '2026/02/Amazon_logo-2.webp' },
  { slug: 'asus', nombre: 'Asus', archivo: '2026/02/Asus_logo-1.webp' },
  { slug: 'hisense', nombre: 'Hisense', archivo: '2026/10/Logotipo-Hisense-en-gris.png' },
  { slug: 'jbl', nombre: 'JBL', archivo: '2026/02/JBL_logo-1.webp' },
  { slug: 'klip-xtreme', nombre: 'Klip Xtreme', archivo: '2026/02/klip_logo-1.webp' },
  { slug: 'lenovo', nombre: 'Lenovo', archivo: '2026/02/lenovo_logo-1.webp' },
  { slug: 'lg', nombre: 'LG', archivo: '2026/02/lg_logo-2.webp' },
  { slug: 'logitech', nombre: 'Logitech', archivo: '2026/02/logitech_logo-1.webp' },
  { slug: 'motorola', nombre: 'Motorola', archivo: '2026/02/motorola_logo-2.webp' },
  { slug: 'nexxt-solutions', nombre: 'Nexxt Solutions', archivo: '2026/02/nexxt_logo-1.webp' },
  { slug: 'primus', nombre: 'Primus', archivo: '2026/02/primus_logo-1.webp' },
  { slug: 'samsung', nombre: 'Samsung', archivo: '2026/10/Logotipo-SAMSUNG-gris-sobre-transparencia.png' },
  { slug: 'xiaomi', nombre: 'Xiaomi', archivo: '2026/10/Logotipo-Xiaomi-Gris-Transparente.png' },
];

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

async function aGris(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const esquinas = [0, info.width - 1, (info.height - 1) * info.width, info.height * info.width - 1];
  const fondoOpaco = esquinas.every((indice) => data[indice * 4 + 3] > 240);
  const salida = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const luminancia = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const tinta = luminancia > 205 ? Math.max(0, (250 - luminancia) / 45) : 1;
    const alfa = Math.round((fondoOpaco ? 255 : data[i + 3]) * Math.min(1, tinta));
    salida[i] = GRIS.r;
    salida[i + 1] = GRIS.g;
    salida[i + 2] = GRIS.b;
    salida[i + 3] = alfa;
  }
  const plano = await sharp(salida, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  const recortado = await sharp(plano).trim().png().toBuffer();
  return sharp(recortado).resize({ height: ALTO, width: 360, fit: 'inside' }).png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });
}

await mkdir(destino, { recursive: true });
const listas = [];
for (const marca of MARCAS) {
  try {
    const respuesta = await fetch(`${BASE}/${marca.archivo}`, { headers: { 'User-Agent': AGENTE } });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const { data, info } = await aGris(Buffer.from(await respuesta.arrayBuffer()));
    await writeFile(path.join(destino, `${marca.slug}.png`), data);
    listas.push({ ...marca, ancho: info.width, alto: info.height });
    console.log('OK', marca.slug, `${info.width}x${info.height}`);
  } catch (error) {
    console.log('ERROR', marca.slug, error.message);
  }
  await esperar(350);
}

const lineas = listas
  .map((m) => `  '${m.nombre.toLowerCase()}': { source: require('../../assets/marcas/${m.slug}.png'), ratio: ${(m.ancho / m.alto).toFixed(3)} },`)
  .join('\n');
const modulo = `export interface BrandLogo {
  source: number;
  ratio: number;
}

export const BRAND_LOGOS: Record<string, BrandLogo> = {
${lineas}
};

export function getBrandLogo(name: string): BrandLogo | undefined {
  return BRAND_LOGOS[name.trim().toLowerCase()];
}
`;
await writeFile(path.join(raiz, 'src', 'config', 'brands.ts'), modulo);
console.log(`Marcas generadas: ${listas.length} de ${MARCAS.length}`);
