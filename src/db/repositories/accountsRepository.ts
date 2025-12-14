import { getDatabase } from '../database';
import { Account, CreateAccount } from '../types';

export async function getAllAccounts(): Promise<Account[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Account>(
    'SELECT * FROM accounts ORDER BY name ASC'
  );
  return results;
}

export async function getAccountById(id: number): Promise<Account | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Account>(
    'SELECT * FROM accounts WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function createAccount(account: CreateAccount): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO accounts (name) VALUES (?)',
    [account.name]
  );
  return result.lastInsertRowId;
}

export async function deleteAccount(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
}

export async function seedDefaultAccounts(): Promise<void> {
  const db = await getDatabase();
  const existing = await getAllAccounts();

  if (existing.length === 0) {
    const defaultAccounts = ['Cash', 'Checking', 'Savings'];

    for (const name of defaultAccounts) {
      await db.runAsync('INSERT INTO accounts (name) VALUES (?)', [name]);
    }
  }
}
