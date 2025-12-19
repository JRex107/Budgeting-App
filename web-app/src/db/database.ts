import Dexie, { type EntityTable } from 'dexie';

// Type definitions matching the original schema
export interface Settings {
  id: number; // Always 1
  currency: string;
  monthStartDay: number; // 1-28
}

export interface Account {
  id?: number;
  name: string;
}

export interface Category {
  id?: number;
  name: string;
  isIncomeCategory: number; // 0 or 1
}

export interface Transaction {
  id?: number;
  accountId: number;
  categoryId: number;
  type: 'income' | 'expense';
  amountMinor: number; // Amount in minor units (cents/pence)
  dateISO: string; // YYYY-MM-DD format
  merchant: string;
  note: string;
}

export interface Budget {
  id?: number;
  monthKey: string; // YYYY-MM format
  categoryId: number;
  amountMinor: number;
}

// Dexie database class
class BudgetingDatabase extends Dexie {
  settings!: EntityTable<Settings, 'id'>;
  accounts!: EntityTable<Account, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  budgets!: EntityTable<Budget, 'id'>;

  constructor() {
    super('BudgetingApp');

    this.version(1).stores({
      settings: 'id',
      accounts: '++id, &name',
      categories: '++id, &name, isIncomeCategory',
      transactions: '++id, accountId, categoryId, dateISO, [accountId+dateISO], [categoryId+dateISO]',
      budgets: '++id, monthKey, categoryId, [monthKey+categoryId]',
    });
  }
}

// Singleton instance
export const db = new BudgetingDatabase();

// Initialize database with default data
export async function initializeDatabase(): Promise<void> {
  // Check if settings exist
  const settingsCount = await db.settings.count();

  if (settingsCount === 0) {
    // Database is new, add default data
    await db.settings.add({
      id: 1,
      currency: 'USD',
      monthStartDay: 1,
    });

    console.log('Database initialized with default settings');
  }
}

// Reset database (clear all data)
export async function resetDatabase(): Promise<void> {
  await db.transaction('rw', [db.settings, db.accounts, db.categories, db.transactions, db.budgets], async () => {
    await db.settings.clear();
    await db.accounts.clear();
    await db.categories.clear();
    await db.transactions.clear();
    await db.budgets.clear();
  });

  // Re-initialize with defaults
  await initializeDatabase();

  console.log('Database reset successfully');
}
