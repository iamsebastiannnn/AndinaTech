import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const assets = path.join(raiz, 'assets');
const TINTA = '#0B1F25';
const ANCHO = 2400;

const svg = await readFile(path.join(assets, 'andina-tech-hogar-logo.svg'));
const completo = await sharp(svg, { density: 300 }).resize({ width: ANCHO }).png().toBuffer();
const { width, height } = await sharp(completo).metadata();

const recortar = (desde, hasta) => {
  const top = Math.floor(height * desde);
  const alto = Math.min(height - top, Math.floor(height * (hasta - desde)));
  return sharp(completo)
    .extract({ left: 0, top, width, height: alto })
    .png()
    .toBuffer()
    .then((zona) => sharp(zona).trim().png().toBuffer());
};

const simbolo = await recortar(0, 0.585);
const texto = await recortar(0.6, 1);

await sharp(completo).trim().resize({ width: 960 }).png({ compressionLevel: 9 }).toFile(path.join(assets, 'logo-completo.png'));
await sharp(simbolo).resize({ height: 168 }).png({ compressionLevel: 9 }).toFile(path.join(assets, 'logo-simbolo.png'));
await sharp(texto).resize({ height: 132 }).png({ compressionLevel: 9 }).toFile(path.join(assets, 'logo-texto.png'));

async function icono(lado, margen, destino) {
  const interior = Math.round(lado * (1 - margen * 2));
  const marca = await sharp(simbolo).resize({ width: interior, height: interior, fit: 'inside' }).toBuffer();
  await sharp({ create: { width: lado, height: lado, channels: 4, background: TINTA } })
    .composite([{ input: marca, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(assets, destino));
}

await icono(1024, 0.1, 'icon.png');

const frente = await sharp(simbolo).resize({ width: 560, height: 560, fit: 'inside' }).toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: frente, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(assets, 'android-icon-foreground.png'));
await icono(96, 0.1, 'favicon.png');

for (const archivo of ['logo-completo.png', 'logo-simbolo.png', 'logo-texto.png']) {
  const meta = await sharp(path.join(assets, archivo)).metadata();
  console.log(archivo, `${meta.width}x${meta.height}`);
}
