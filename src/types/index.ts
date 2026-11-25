export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
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
