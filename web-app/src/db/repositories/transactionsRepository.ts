import { db, type Transaction } from '../database';

export async function getAllTransactions(): Promise<Transaction[]> {
  return await db.transactions.orderBy('dateISO').reverse().toArray();
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const transaction = await db.transactions.get(id);
  return transaction || null;
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  return await db.transactions
    .where('dateISO')
    .between(startDate, endDate, true, true)
    .reverse()
    .sortBy('dateISO');
}

export async function getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
  return await db.transactions
    .where('accountId')
    .equals(accountId)
    .reverse()
    .sortBy('dateISO');
}

export async function getTransactionsByCategory(categoryId: number): Promise<Transaction[]> {
  return await db.transactions
    .where('categoryId')
    .equals(categoryId)
    .reverse()
    .sortBy('dateISO');
}

export async function searchTransactions(searchTerm: string): Promise<Transaction[]> {
  const allTransactions = await getAllTransactions();
  const lowerTerm = searchTerm.toLowerCase();

  return allTransactions.filter(
    (tx) =>
      tx.merchant.toLowerCase().includes(lowerTerm) ||
      tx.note.toLowerCase().includes(lowerTerm)
  );
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<number> {
  const id = await db.transactions.add(transaction);
  return id as number;
}

export async function updateTransaction(
  id: number,
  transaction: Partial<Omit<Transaction, 'id'>>
): Promise<void> {
  await db.transactions.update(id, transaction);
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.transactions.delete(id);
}
