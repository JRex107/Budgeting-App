import { db, type Settings } from '../database';

export async function getSettings(): Promise<Settings | null> {
  const settings = await db.settings.get(1);
  return settings || null;
}

export async function createSettings(
  currency: string,
  monthStartDay: number
): Promise<void> {
  await db.settings.put({
    id: 1,
    currency,
    monthStartDay,
  });
}

export async function updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<void> {
  const current = await getSettings();

  if (!current) {
    throw new Error('Settings not found. Complete onboarding first.');
  }

  const currency = updates.currency ?? current.currency;
  const monthStartDay = updates.monthStartDay ?? current.monthStartDay;

  await db.settings.put({
    id: 1,
    currency,
    monthStartDay,
  });
}
