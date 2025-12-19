import { db, type Account } from '../database';

export async function getAllAccounts(): Promise<Account[]> {
  return await db.accounts.orderBy('name').toArray();
}

export async function getAccountById(id: number): Promise<Account | null> {
  const account = await db.accounts.get(id);
  return account || null;
}

export async function createAccount(name: string): Promise<number> {
  const id = await db.accounts.add({ name });
  return id as number;
}

export async function updateAccount(id: number, name: string): Promise<void> {
  await db.accounts.update(id, { name });
}

export async function deleteAccount(id: number): Promise<void> {
  await db.accounts.delete(id);
}

export async function seedDefaultAccount(): Promise<void> {
  try {
    const existing = await getAllAccounts();
    console.log('Existing accounts before seed:', existing);

    if (existing.length === 0) {
      console.log('Adding Main Account...');
      const id = await db.accounts.add({ name: 'Main Account' });
      console.log('Main Account created with ID:', id);

      // Verify it was added
      const verify = await getAllAccounts();
      console.log('Accounts after seed:', verify);
    } else {
      console.log('Accounts already exist, skipping seed');
    }
  } catch (err) {
    console.error('Error seeding default account:', err);
    throw err;
  }
}
