import { getDatabase } from '../database';
import { Category, CreateCategory } from '../types';

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Category>(
    'SELECT * FROM categories ORDER BY name ASC'
  );
  return results.map((cat) => ({
    ...cat,
    isIncomeCategory: Boolean(cat.isIncomeCategory),
  }));
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Category>(
    'SELECT * FROM categories WHERE id = ?',
    [id]
  );
  if (!result) return null;
  return {
    ...result,
    isIncomeCategory: Boolean(result.isIncomeCategory),
  };
}

export async function getExpenseCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Category>(
    'SELECT * FROM categories WHERE isIncomeCategory = 0 ORDER BY name ASC'
  );
  return results.map((cat) => ({
    ...cat,
    isIncomeCategory: false,
  }));
}

export async function getIncomeCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Category>(
    'SELECT * FROM categories WHERE isIncomeCategory = 1 ORDER BY name ASC'
  );
  return results.map((cat) => ({
    ...cat,
    isIncomeCategory: true,
  }));
}

export async function createCategory(category: CreateCategory): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO categories (name, isIncomeCategory) VALUES (?, ?)',
    [category.name, category.isIncomeCategory ? 1 : 0]
  );
  return result.lastInsertRowId;
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

export async function seedDefaultCategories(): Promise<void> {
  const db = await getDatabase();
  const existing = await getAllCategories();

  if (existing.length === 0) {
    // Expense categories
    const expenseCategories = [
      'Groceries',
      'Dining',
      'Transport',
      'Entertainment',
      'Shopping',
      'Bills',
      'Healthcare',
      'Other',
    ];

    for (const name of expenseCategories) {
      await db.runAsync(
        'INSERT INTO categories (name, isIncomeCategory) VALUES (?, 0)',
        [name]
      );
    }

    // Income categories
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other Income'];

    for (const name of incomeCategories) {
      await db.runAsync(
        'INSERT INTO categories (name, isIncomeCategory) VALUES (?, 1)',
        [name]
      );
    }
  }
}
