import { db, type SavingsPot, type PotTransaction } from '../database';

// Savings Pots CRUD
export async function getAllSavingsPots(): Promise<SavingsPot[]> {
  return await db.savingsPots.orderBy('name').toArray();
}

export async function getSavingsPotById(id: number): Promise<SavingsPot | null> {
  const pot = await db.savingsPots.get(id);
  return pot || null;
}

export async function createSavingsPot(pot: Omit<SavingsPot, 'id'>): Promise<number> {
  const id = await db.savingsPots.add(pot);
  return id as number;
}

export async function updateSavingsPot(id: number, updates: Partial<Omit<SavingsPot, 'id'>>): Promise<void> {
  await db.savingsPots.update(id, updates);
}

export async function deleteSavingsPot(id: number): Promise<void> {
  // Delete all transactions for this pot first
  await db.potTransactions.where('potId').equals(id).delete();
  // Then delete the pot
  await db.savingsPots.delete(id);
}

// Pot Transactions
export async function getPotTransactions(potId: number): Promise<PotTransaction[]> {
  return await db.potTransactions.where('potId').equals(potId).reverse().sortBy('dateISO');
}

export async function getAllPotTransactions(): Promise<PotTransaction[]> {
  return await db.potTransactions.orderBy('dateISO').reverse().toArray();
}

export async function createPotTransaction(transaction: Omit<PotTransaction, 'id'>): Promise<number> {
  const id = await db.potTransactions.add(transaction);

  // Update pot balance
  const pot = await db.savingsPots.get(transaction.potId);
  if (pot) {
    const newBalance = pot.currentAmountMinor + transaction.amountMinor;
    await db.savingsPots.update(transaction.potId, { currentAmountMinor: newBalance });
  }

  return id as number;
}

export async function deletePotTransaction(id: number): Promise<void> {
  const transaction = await db.potTransactions.get(id);
  if (transaction) {
    // Reverse the balance change
    const pot = await db.savingsPots.get(transaction.potId);
    if (pot) {
      const newBalance = pot.currentAmountMinor - transaction.amountMinor;
      await db.savingsPots.update(transaction.potId, { currentAmountMinor: newBalance });
    }

    await db.potTransactions.delete(id);
  }
}

// Helper to get pot balance
export async function getPotBalance(potId: number): Promise<number> {
  const pot = await db.savingsPots.get(potId);
  return pot?.currentAmountMinor || 0;
}

// Calculate total savings across all pots
export async function getTotalSavings(): Promise<number> {
  const pots = await getAllSavingsPots();
  return pots.reduce((sum, pot) => sum + pot.currentAmountMinor, 0);
}
