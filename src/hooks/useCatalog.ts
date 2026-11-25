import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchCategories, fetchProducts } from '@/services/products';
import type { Category, Product } from '@/types';
import { toDataErrorMessage } from '@/utils/errors';
import { matchesQuery } from '@/utils/search';

export const ALL_CATEGORIES = 'todas';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>(ALL_CATEGORIES);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([fetchCategories(), fetchProducts()])
      .then(([nextCategories, nextProducts]) => {
        if (!isCurrent) return;
        setCategories(nextCategories);
        setProducts(nextProducts);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (isCurrent) setError(toDataErrorMessage(cause, 'el catálogo'));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (categoryId === ALL_CATEGORIES || product.categoryId === categoryId) &&
          matchesQuery(query, [product.name, product.description, product.categoryName]),
      ),
    [products, categoryId, query],
  );

  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setAttempt((value) => value + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setCategoryId(ALL_CATEGORIES);
  }, []);

  return {
    products: filtered,
    totalProducts: products.length,
    categories,
    isLoading,
    error,
    query,
    setQuery,
    categoryId,
    setCategoryId,
    clearFilters,
    hasFilters: query.trim() !== '' || categoryId !== ALL_CATEGORIES,
    reload,
  };
}
