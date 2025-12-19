import { db, type Category } from '../database';

export async function getAllCategories(): Promise<Category[]> {
  const categories = await db.categories.orderBy('name').toArray();
  return categories;
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const category = await db.categories.get(id);
  return category || null;
}

export async function getExpenseCategories(): Promise<Category[]> {
  return await db.categories.where('isIncomeCategory').equals(0).sortBy('name');
}

export async function getIncomeCategories(): Promise<Category[]> {
  return await db.categories.where('isIncomeCategory').equals(1).sortBy('name');
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<number> {
  const id = await db.categories.add(category);
  return id as number;
}

export async function deleteCategory(id: number): Promise<void> {
  await db.categories.delete(id);
}

export async function seedDefaultCategories(): Promise<void> {
  try {
    const existing = await getAllCategories();
    console.log('Existing categories before seed:', existing);

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

      console.log('Adding expense categories...');
      for (const name of expenseCategories) {
        const id = await db.categories.add({ name, isIncomeCategory: 0 });
        console.log(`Added expense category "${name}" with ID:`, id);
      }

      // Income categories
      const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other Income'];

      console.log('Adding income categories...');
      for (const name of incomeCategories) {
        const id = await db.categories.add({ name, isIncomeCategory: 1 });
        console.log(`Added income category "${name}" with ID:`, id);
      }

      // Verify they were added
      const verify = await getAllCategories();
      console.log('Categories after seed:', verify);
    } else {
      console.log('Categories already exist, skipping seed');
    }
  } catch (err) {
    console.error('Error seeding default categories:', err);
    throw err;
  }
}
