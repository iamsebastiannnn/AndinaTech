export interface BrandLogo {
  source: number;
  ratio: number;
}

export const BRAND_LOGOS: Record<string, BrandLogo> = {
  'amazon': { source: require('../../assets/marcas/amazon.png'), ratio: 3.313 },
  'asus': { source: require('../../assets/marcas/asus.png'), ratio: 4.737 },
  'hisense': { source: require('../../assets/marcas/hisense.png'), ratio: 6.207 },
  'jbl': { source: require('../../assets/marcas/jbl.png'), ratio: 1.792 },
  'klip xtreme': { source: require('../../assets/marcas/klip-xtreme.png'), ratio: 2.740 },
  'lenovo': { source: require('../../assets/marcas/lenovo.png'), ratio: 4.800 },
  'lg': { source: require('../../assets/marcas/lg.png'), ratio: 2.271 },
  'logitech': { source: require('../../assets/marcas/logitech.png'), ratio: 3.281 },
  'motorola': { source: require('../../assets/marcas/motorola.png'), ratio: 1.333 },
  'nexxt solutions': { source: require('../../assets/marcas/nexxt-solutions.png'), ratio: 2.219 },
  'primus': { source: require('../../assets/marcas/primus.png'), ratio: 4.737 },
  'samsung': { source: require('../../assets/marcas/samsung.png'), ratio: 6.792 },
  'xiaomi': { source: require('../../assets/marcas/xiaomi.png'), ratio: 3.750 },
};

export function getBrandLogo(name: string): BrandLogo | undefined {
  return BRAND_LOGOS[name.trim().toLowerCase()];
}
