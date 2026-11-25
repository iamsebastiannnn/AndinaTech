import { useCallback, useEffect, useState } from 'react';

import { fetchProductBySku } from '@/services/products';
import type { Product } from '@/types';
import { toDataErrorMessage } from '@/utils/errors';

export function useProduct(sku: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!sku) return;
    let isCurrent = true;
    fetchProductBySku(sku)
      .then((result) => {
        if (!isCurrent) return;
        setProduct(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (isCurrent) setError(toDataErrorMessage(cause, 'el producto'));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [sku, attempt]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setAttempt((value) => value + 1);
  }, []);

  return { product, isLoading: Boolean(sku) && isLoading, error, reload };
}
