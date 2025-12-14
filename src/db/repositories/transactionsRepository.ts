import { getDatabase } from '../database';
import { Transaction, CreateTransaction } from '../types';

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY dateISO DESC, id DESC'
  );
  return results;
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE dateISO >= ? AND dateISO <= ? ORDER BY dateISO DESC, id DESC',
    [startDate, endDate]
  );
  return results;
}

export async function getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE accountId = ? ORDER BY dateISO DESC, id DESC',
    [accountId]
  );
  return results;
}

export async function getTransactionsByCategory(categoryId: number): Promise<Transaction[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE categoryId = ? ORDER BY dateISO DESC, id DESC',
    [categoryId]
  );
  return results;
}

export async function searchTransactions(searchTerm: string): Promise<Transaction[]> {
  const db = await getDatabase();
  const term = `%${searchTerm}%`;
  const results = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE merchant LIKE ? OR note LIKE ? ORDER BY dateISO DESC, id DESC',
    [term, term]
  );
  return results;
}

export async function createTransaction(transaction: CreateTransaction): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO transactions (accountId, categoryId, type, amountMinor, dateISO, merchant, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.accountId,
      transaction.categoryId,
      transaction.type,
      transaction.amountMinor,
      transaction.dateISO,
      transaction.merchant,
      transaction.note,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTransaction(id: number, transaction: Partial<Transaction>): Promise<void> {
  const db = await getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (transaction.accountId !== undefined) {
    updates.push('accountId = ?');
    values.push(transaction.accountId);
  }
  if (transaction.categoryId !== undefined) {
    updates.push('categoryId = ?');
    values.push(transaction.categoryId);
  }
  if (transaction.type !== undefined) {
    updates.push('type = ?');
    values.push(transaction.type);
  }
  if (transaction.amountMinor !== undefined) {
    updates.push('amountMinor = ?');
    values.push(transaction.amountMinor);
  }
  if (transaction.dateISO !== undefined) {
    updates.push('dateISO = ?');
    values.push(transaction.dateISO);
  }
  if (transaction.merchant !== undefined) {
    updates.push('merchant = ?');
    values.push(transaction.merchant);
  }
  if (transaction.note !== undefined) {
    updates.push('note = ?');
    values.push(transaction.note);
  }

  if (updates.length > 0) {
    values.push(id);
    await db.runAsync(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}
