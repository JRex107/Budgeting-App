import { db, type Budget } from '../database';

export async function getAllBudgets(): Promise<Budget[]> {
  return await db.budgets.toArray();
}

export async function getBudgetsByMonth(monthKey: string): Promise<Budget[]> {
  return await db.budgets.where('monthKey').equals(monthKey).toArray();
}

export async function getBudgetByMonthAndCategory(
  monthKey: string,
  categoryId: number
): Promise<Budget | null> {
  const budget = await db.budgets
    .where('[monthKey+categoryId]')
    .equals([monthKey, categoryId])
    .first();
  return budget || null;
}

export async function createBudget(budget: Omit<Budget, 'id'>): Promise<number> {
  const id = await db.budgets.add(budget);
  return id as number;
}

export async function updateBudget(id: number, amountMinor: number): Promise<void> {
  await db.budgets.update(id, { amountMinor });
}

export async function deleteBudget(id: number): Promise<void> {
  await db.budgets.delete(id);
}
