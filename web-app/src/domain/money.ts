// Money utilities - all amounts stored as minor units (pence/cents)

export interface CurrencyInfo {
  symbol: string;
  decimalPlaces: number;
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  GBP: { symbol: '£', decimalPlaces: 2 },
  USD: { symbol: '$', decimalPlaces: 2 },
  EUR: { symbol: '€', decimalPlaces: 2 },
};

export function getCurrencyInfo(currency: string): CurrencyInfo {
  return CURRENCY_MAP[currency] || { symbol: currency, decimalPlaces: 2 };
}

export function formatMoney(amountMinor: number, currency: string): string {
  const info = getCurrencyInfo(currency);
  const divisor = Math.pow(10, info.decimalPlaces);
  const amount = amountMinor / divisor;

  return `${info.symbol}${amount.toFixed(info.decimalPlaces)}`;
}

export function parseMoneyToMinor(amount: string): number {
  // Remove any non-numeric characters except decimal point
  const cleaned = amount.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return 0;
  }

  // Convert to minor units (multiply by 100 for 2 decimal places)
  return Math.round(parsed * 100);
}

export function minorToMajor(amountMinor: number, decimalPlaces: number = 2): number {
  const divisor = Math.pow(10, decimalPlaces);
  return amountMinor / divisor;
}

export function majorToMinor(amount: number, decimalPlaces: number = 2): number {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(amount * multiplier);
}

// Alias for parseMoneyToMinor
export const parseMoneyInput = parseMoneyToMinor;
