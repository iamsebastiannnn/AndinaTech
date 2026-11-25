export function getDiscountPercent(price: number, previousPrice: number | null): number | null {
  if (previousPrice === null || previousPrice <= price) return null;
  const percent = Math.round(((previousPrice - price) / previousPrice) * 100);
  return percent > 0 ? percent : null;
}
