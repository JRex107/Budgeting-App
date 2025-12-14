import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('budgeting.db');
  }
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  // Create tables
  await database.execAsync(`
    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      currency TEXT NOT NULL,
      monthStartDay INTEGER NOT NULL CHECK (monthStartDay >= 1 AND monthStartDay <= 28)
    );

    -- Accounts table
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      isIncomeCategory INTEGER NOT NULL DEFAULT 0 CHECK (isIncomeCategory IN (0, 1))
    );

    -- Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId INTEGER NOT NULL,
      categoryId INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amountMinor INTEGER NOT NULL CHECK (amountMinor >= 0),
      dateISO TEXT NOT NULL,
      merchant TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (accountId) REFERENCES accounts(id),
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );

    -- Budgets table
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monthKey TEXT NOT NULL,
      categoryId INTEGER NOT NULL,
      amountMinor INTEGER NOT NULL CHECK (amountMinor >= 0),
      FOREIGN KEY (categoryId) REFERENCES categories(id),
      UNIQUE (monthKey, categoryId)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_transactions_dateISO ON transactions(dateISO);
    CREATE INDEX IF NOT EXISTS idx_transactions_accountId_dateISO ON transactions(accountId, dateISO);
    CREATE INDEX IF NOT EXISTS idx_transactions_categoryId_dateISO ON transactions(categoryId, dateISO);
    CREATE INDEX IF NOT EXISTS idx_budgets_monthKey ON budgets(monthKey);
  `);

  console.log('Database initialized successfully');
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS accounts;
    DROP TABLE IF EXISTS settings;
    DROP INDEX IF EXISTS idx_transactions_dateISO;
    DROP INDEX IF EXISTS idx_transactions_accountId_dateISO;
    DROP INDEX IF EXISTS idx_transactions_categoryId_dateISO;
    DROP INDEX IF EXISTS idx_budgets_monthKey;
  `);

  await initializeDatabase();
  console.log('Database reset successfully');
}
