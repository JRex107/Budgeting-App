import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
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

  const filteredTransactions = searchTerm
    ? transactions.filter(tx => 
        tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.note.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : transactions;

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Unknown';

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

        <Button
          title="+ Add Transaction"
          onPress={() => setIsModalOpen(true)}
         
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
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
      </Modal>
    </div>
  );
}
