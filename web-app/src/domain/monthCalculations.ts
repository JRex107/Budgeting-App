// Month calculations that respect custom month start day

export interface MonthBoundaries {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
}

/**
 * Get the month key for a given date and month start day
 * For example, if monthStartDay is 15:
 * - Date 2024-01-14 belongs to month 2023-12
 * - Date 2024-01-15 belongs to month 2024-01
 */
export function getMonthKeyForDate(dateISO: string, monthStartDay: number): string {
  const date = new Date(dateISO);
  const day = date.getDate();

  if (day < monthStartDay) {
    // This date belongs to the previous month
    const prevMonth = new Date(date);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return formatMonthKey(prevMonth);
  }

  return formatMonthKey(date);
}

/**
 * Format a date object into a month key (YYYY-MM)
 */
export function formatMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the current month key based on today's date and month start day
 */
export function getCurrentMonthKey(monthStartDay: number): string {
  const today = formatDateISO(new Date());
  return getMonthKeyForDate(today, monthStartDay);
}

/**
 * Get the start and end dates for a given month key
 * For example, if monthKey is "2024-01" and monthStartDay is 15:
 * - startDate: 2024-01-15
 * - endDate: 2024-02-14
 */
export function getMonthBoundaries(monthKey: string, monthStartDay: number): MonthBoundaries {
  const [year, month] = monthKey.split('-').map(Number);

  // Start date is the monthStartDay of the given month
  const startDate = new Date(year, month - 1, monthStartDay);

  // End date is the day before the next month's start
  const endDate = new Date(year, month, monthStartDay - 1);

  return {
    startDate: formatDateISO(startDate),
    endDate: formatDateISO(endDate),
    monthKey,
  };
}

/**
 * Format a date object to ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the previous month key
 */
export function getPreviousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return formatMonthKey(date);
}

/**
 * Get the next month key
 */
export function getNextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() + 1);
  return formatMonthKey(date);
}

/**
 * Get an array of month keys going back N months from a given month
 */
export function getLastNMonthKeys(monthKey: string, count: number): string[] {
  const keys: string[] = [];
  let currentKey = monthKey;

  for (let i = 0; i < count; i++) {
    keys.push(currentKey);
    currentKey = getPreviousMonthKey(currentKey);
  }

  return keys.reverse();
}

/**
 * Format a month key for display (e.g., "2024-01" -> "January 2024")
 */
export function formatMonthKeyForDisplay(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get today's date in ISO format
 */
export function getTodayISO(): string {
  return formatDateISO(new Date());
}
