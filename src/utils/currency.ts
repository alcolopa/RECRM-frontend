/**
 * Utility for safe currency calculations and formatting in the frontend.
 * Avoids floating-point errors common with JavaScript Numbers.
 */

/**
 * Rounds a number to the specified number of decimal places.
 * Default is 2 for currency.
 */
export const roundTo = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Safely adds multiple numbers, rounding the result to avoid floating-point noise.
 */
export const safeAdd = (...numbers: (number | string | undefined | null)[]): number => {
  const total = numbers.reduce((acc: number, val) => {
    const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
    return acc + num;
  }, 0);
  return roundTo(total);
};

/**
 * Safely subtracts numbers.
 */
export const safeSubtract = (minuend: number, ...subtrahends: number[]): number => {
  const result = subtrahends.reduce((acc, val) => acc - val, minuend);
  return roundTo(result);
};

/**
 * Safely multiplies numbers.
 */
export const safeMultiply = (a: number, b: number): number => {
  return roundTo(a * b);
};

export const formatCurrency = (
  amount: number | string | undefined | null,
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(num);
};

/**
 * Formats a number as a compact currency (e.g., $1.2M)
 */
export const formatCompactCurrency = (amount: number | string | undefined | null, currency: string = 'USD'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};
