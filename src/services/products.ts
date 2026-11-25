import { requireSupabase } from '@/lib/supabase';
import type { Category, Product } from '@/types';

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | string;
  stock: number;
  category_id: string;
  categories: { name: string } | { name: string }[] | null;
}

function toProduct(row: ProductRow): Product {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description ?? '',
    imageUrl: row.image_url,
    price: Number(row.price),
    stock: row.stock,
    categoryId: row.category_id,
    categoryName: category?.name ?? 'Sin categoría',
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await requireSupabase()
    .from('categories')
    .select('id, name, description')
    .order('name', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await requireSupabase()
    .from('products')
    .select('id, sku, name, description, image_url, price, stock, category_id, categories(name)')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(toProduct);
}
