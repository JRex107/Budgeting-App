import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SlideOver } from '../components/SlideOver';
import { FilterChip } from '../components/FilterChip';
import { formatMoney, parseMoneyInput } from '../domain/money';
import { formatDateISO } from '../domain/monthCalculations';
import { getSettings } from '../db/repositories/settingsRepository';
import { getAllTransactions, createTransaction, deleteTransaction } from '../db/repositories/transactionsRepository';
import { getAllCategories } from '../db/repositories/categoriesRepository';
import { getAllAccounts } from '../db/repositories/accountsRepository';
import type { Transaction, Category, Account } from '../db/database';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter state
  const [filterAccount, setFilterAccount] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Form state
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formAccount, setFormAccount] = useState('');
  const [formDate, setFormDate] = useState(formatDateISO(new Date()));
  const [formMerchant, setFormMerchant] = useState('');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    loadData();

    // Reload data when page becomes visible (user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    const settings = await getSettings();
    if (settings) setCurrency(settings.currency);
    
    const txs = await getAllTransactions();
    const cats = await getAllCategories();
    const accs = await getAllAccounts();
    
    setTransactions(txs);
    setCategories(cats);
    setAccounts(accs);
    
    if (cats.length > 0) setFormCategory(cats[0].id?.toString() || '');
    if (accs.length > 0) setFormAccount(accs[0].id?.toString() || '');
  };

  const handleAddTransaction = async () => {
    const amountMinor = parseMoneyInput(formAmount);
    if (amountMinor <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    await createTransaction({
      type: formType,
      amountMinor,
      categoryId: parseInt(formCategory, 10),
      accountId: parseInt(formAccount, 10),
      dateISO: formDate,
      merchant: formMerchant,
      note: formNote,
    });

    // Reset form
    setFormAmount('');
    setFormMerchant('');
    setFormNote('');
    setFormDate(formatDateISO(new Date()));
    setIsModalOpen(false);
    
    await loadData();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this transaction?')) {
      await deleteTransaction(id);
      await loadData();
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        tx.merchant.toLowerCase().includes(searchLower) ||
        tx.note.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Account filter
    if (filterAccount !== null && tx.accountId !== filterAccount) {
      return false;
    }

    // Category filter
    if (filterCategory !== null && tx.categoryId !== filterCategory) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }

    return true;
  });

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getAccountName = (id: number) => accounts.find(a => a.id === id)?.name || 'Unknown';

  const handleOpenModal = async () => {
    await loadData(); // Refresh data before opening modal
    setIsModalOpen(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
      </div>
      <div className="page-content">
        <div>
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
          <FilterChip
            label="Type"
            value={filterType === 'income' ? 'Income' : filterType === 'expense' ? 'Expense' : ''}
            isActive={filterType !== 'all'}
            onToggle={() => {
              if (filterType === 'all') setFilterType('expense');
              else if (filterType === 'expense') setFilterType('income');
              else setFilterType('all');
            }}
            onRemove={() => setFilterType('all')}
          />

          <FilterChip
            label="Account"
            value={filterAccount !== null ? getAccountName(filterAccount) : ''}
            isActive={filterAccount !== null}
            onToggle={() => {
              if (filterAccount === null && accounts.length > 0) {
                setFilterAccount(accounts[0].id!);
              } else if (filterAccount !== null) {
                const currentIndex = accounts.findIndex(a => a.id === filterAccount);
                const nextIndex = (currentIndex + 1) % accounts.length;
                setFilterAccount(accounts[nextIndex].id!);
              }
            }}
            onRemove={() => setFilterAccount(null)}
          />

          <FilterChip
            label="Category"
            value={filterCategory !== null ? getCategoryName(filterCategory) : ''}
            isActive={filterCategory !== null}
            onToggle={() => {
              if (filterCategory === null && categories.length > 0) {
                setFilterCategory(categories[0].id!);
              } else if (filterCategory !== null) {
                const currentIndex = categories.findIndex(c => c.id === filterCategory);
                const nextIndex = (currentIndex + 1) % categories.length;
                setFilterCategory(categories[nextIndex].id!);
              }
            }}
            onRemove={() => setFilterCategory(null)}
          />
        </div>

        <Button
          title="+ Add Transaction"
          onPress={handleOpenModal}
        />

        {filteredTransactions.length === 0 ? (
          <Card>
            <p>
              No transactions yet. Add your first transaction!
            </p>
          </Card>
        ) : (
          filteredTransactions.map((tx) => (
            <Card key={tx.id}>
              <div>
                <div>
                  <div>
                    <span>
                      {tx.merchant || getCategoryName(tx.categoryId)}
                    </span>
                    <span
                      style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: tx.type === 'income' ? '#34C759' : '#1C1C1E',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amountMinor, currency)}
                    </span>
                  </div>
                  <div>
                    {getCategoryName(tx.categoryId)} • {tx.dateISO}
                  </div>
                  {tx.note && (
                    <div>{tx.note}</div>
                  )}
                </div>
                <button
                  onClick={() => tx.id && handleDelete(tx.id)}
                  style={{
                    marginLeft: '12px',
                    padding: '6px 10px',
                    backgroundColor: '#FF3B30',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Delete
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <SlideOver isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
        {(categories.length === 0 || accounts.length === 0) ? (
          <div>
            <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '16px' }}>
              {categories.length === 0 && accounts.length === 0
                ? 'No categories or accounts available. Please add them in Settings first.'
                : categories.length === 0
                ? 'No categories available. Please add categories in Settings first.'
                : 'No accounts available. Please contact support.'}
            </p>
            <Button title="Close" onPress={() => setIsModalOpen(false)} variant="secondary" />
          </div>
        ) : (
          <>
            <div>
              <Button
                title="Expense"
                variant={formType === 'expense' ? 'primary' : 'secondary'}
                onPress={() => setFormType('expense')}
              />
              <Button
                title="Income"
                variant={formType === 'income' ? 'primary' : 'secondary'}
                onPress={() => setFormType('income')}
              />
            </div>

            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0.00"
            />

            <div>
              <label>
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid transparent',
                  backgroundColor: '#F2F2F7',
                }}
              >
                {categories
                  .filter(c => formType === 'income' ? c.isIncomeCategory === 1 : c.isIncomeCategory === 0)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label>
                Account
              </label>
              <select
                value={formAccount}
                onChange={(e) => setFormAccount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '1px solid transparent',
                  backgroundColor: '#F2F2F7',
                }}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />

            <Input
              label="Merchant (optional)"
              value={formMerchant}
              onChange={(e) => setFormMerchant(e.target.value)}
              placeholder="Store name"
            />

            <Input
              label="Note (optional)"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="Additional details"
            />

            <Button title="Add Transaction" onPress={handleAddTransaction} />
          </>
        )}
      </SlideOver>
    </div>
  );
}
