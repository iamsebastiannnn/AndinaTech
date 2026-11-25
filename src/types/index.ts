export interface Category {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
}

export interface ProductImage {
  url: string;
  thumb: string;
  width: number;
  height: number;
  background: 'blanco' | 'transparente' | 'ambiente';
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  brand: string | null;
  model: string | null;
  tagline: string | null;
  imageUrl: string | null;
  images: ProductImage[];
  specs: ProductSpec[];
  price: number;
  previousPrice: number | null;
  stock: number;
  isFeatured: boolean;
  heroOrder: number | null;
  checkedAt: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string | null;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

export type LiveStatus = 'connecting' | 'connected' | 'disconnected';
