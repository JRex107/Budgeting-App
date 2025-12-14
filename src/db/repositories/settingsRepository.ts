import { getDatabase } from '../database';
import { Settings, UpdateSettings } from '../types';

export async function getSettings(): Promise<Settings | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Settings>(
    'SELECT * FROM settings WHERE id = 1'
  );
  return result || null;
}

export async function createSettings(
  currency: string,
  monthStartDay: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (id, currency, monthStartDay) VALUES (1, ?, ?)',
    [currency, monthStartDay]
  );
}

export async function updateSettings(updates: UpdateSettings): Promise<void> {
  const db = await getDatabase();
  const current = await getSettings();

  if (!current) {
    throw new Error('Settings not found. Complete onboarding first.');
  }

  const currency = updates.currency ?? current.currency;
  const monthStartDay = updates.monthStartDay ?? current.monthStartDay;

  await db.runAsync(
    'UPDATE settings SET currency = ?, monthStartDay = ? WHERE id = 1',
    [currency, monthStartDay]
  );
}
