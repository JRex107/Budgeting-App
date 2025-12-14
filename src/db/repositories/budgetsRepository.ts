import { getDatabase } from '../database';
import { Budget, CreateBudget } from '../types';

export async function getBudgetsByMonth(monthKey: string): Promise<Budget[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Budget>(
    'SELECT * FROM budgets WHERE monthKey = ?',
    [monthKey]
  );
  return results;
}

export async function getBudgetForCategoryAndMonth(
  categoryId: number,
  monthKey: string
): Promise<Budget | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Budget>(
    'SELECT * FROM budgets WHERE categoryId = ? AND monthKey = ?',
    [categoryId, monthKey]
  );
  return result || null;
}

export async function createOrUpdateBudget(budget: CreateBudget): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO budgets (monthKey, categoryId, amountMinor)
     VALUES (?, ?, ?)
     ON CONFLICT (monthKey, categoryId)
     DO UPDATE SET amountMinor = excluded.amountMinor`,
    [budget.monthKey, budget.categoryId, budget.amountMinor]
  );
}

export async function deleteBudget(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
}

export async function copyBudgetsToNextMonth(
  fromMonthKey: string,
  toMonthKey: string
): Promise<void> {
  const db = await getDatabase();

  // Get all budgets from the source month
  const sourceBudgets = await getBudgetsByMonth(fromMonthKey);

  // Insert or update budgets for the target month
  for (const budget of sourceBudgets) {
    await createOrUpdateBudget({
      monthKey: toMonthKey,
      categoryId: budget.categoryId,
      amountMinor: budget.amountMinor,
    });
  }
}
