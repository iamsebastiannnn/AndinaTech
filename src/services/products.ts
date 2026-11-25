import { requireSupabase } from '@/lib/supabase';
import type { Category, Product, ProductImage, ProductSpec } from '@/types';

const PRODUCT_COLUMNS =
  'id, sku, name, description, brand, model, tagline, image_url, images, specs, price, previous_price, stock, is_featured, hero_order, source_checked_at, category_id, categories(name, slug)';

interface CategoryRef {
  name: string;
  slug: string | null;
}

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  tagline: string | null;
  image_url: string | null;
  images: ProductImage[] | null;
  specs: ProductSpec[] | null;
  price: number | string;
  previous_price: number | string | null;
  stock: number;
  is_featured: boolean;
  hero_order: number | null;
  source_checked_at: string | null;
  category_id: string;
  categories: CategoryRef | CategoryRef[] | null;
}

function toProduct(row: ProductRow): Product {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const images = Array.isArray(row.images) ? row.images.filter((image) => Boolean(image?.url)) : [];
  const previousPrice = row.previous_price === null ? null : Number(row.previous_price);
  const price = Number(row.price);
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description ?? '',
    brand: row.brand,
    model: row.model,
    tagline: row.tagline,
    imageUrl: row.image_url ?? images[0]?.url ?? null,
    images,
    specs: Array.isArray(row.specs) ? row.specs : [],
    price,
    previousPrice: previousPrice !== null && previousPrice > price ? previousPrice : null,
    stock: row.stock,
    isFeatured: row.is_featured,
    heroOrder: row.hero_order,
    checkedAt: row.source_checked_at,
    categoryId: row.category_id,
    categoryName: category?.name ?? 'Sin categoría',
    categorySlug: category?.slug ?? null,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await requireSupabase()
    .from('categories')
    .select('id, name, slug, description')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await requireSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(toProduct);
}

export async function fetchProductBySku(sku: string): Promise<Product | null> {
  const { data, error } = await requireSupabase()
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .eq('sku', sku)
    .maybeSingle();
  if (error) throw error;
  return data ? toProduct(data as ProductRow) : null;
}
