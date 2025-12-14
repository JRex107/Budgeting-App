// Database model types

export interface Settings {
  id: number;
  currency: string;
  monthStartDay: number; // 1-28
}

export interface Account {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  isIncomeCategory: boolean;
}

export interface Transaction {
  id: number;
  accountId: number;
  categoryId: number;
  type: 'income' | 'expense';
  amountMinor: number; // Amount in pence/cents
  dateISO: string; // YYYY-MM-DD format
  merchant: string;
  note: string;
}

export interface Budget {
  id: number;
  monthKey: string; // YYYY-MM format
  categoryId: number;
  amountMinor: number; // Budget amount in pence/cents
}

// Input types for creating/updating records
export type CreateAccount = Omit<Account, 'id'>;
export type CreateCategory = Omit<Category, 'id'>;
export type CreateTransaction = Omit<Transaction, 'id'>;
export type CreateBudget = Omit<Budget, 'id'>;
export type UpdateSettings = Partial<Omit<Settings, 'id'>>;
