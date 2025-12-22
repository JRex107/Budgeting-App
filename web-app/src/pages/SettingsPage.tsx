import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { getSettings, updateSettings } from '../db/repositories/settingsRepository';
import { getAllCategories, createCategory, deleteCategory } from '../db/repositories/categoriesRepository';
import { getAllAccounts, createAccount, deleteAccount } from '../db/repositories/accountsRepository';
import { getAllSavingsPots, createSavingsPot, deleteSavingsPot } from '../db/repositories/savingsPotsRepository';
import { getAllTransactions } from '../db/repositories/transactionsRepository';
import { resetDatabase } from '../db/database';
import type { Category, Account, SavingsPot } from '../db/database';

export function SettingsPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([]);
  const [currency, setCurrency] = useState('');
  const [monthStartDay, setMonthStartDay] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddPotOpen, setIsAddPotOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newPotName, setNewPotName] = useState('');
  const [newPotTarget, setNewPotTarget] = useState('');
  const [newPotColor, setNewPotColor] = useState('#007AFF');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [isEditSettingsOpen, setIsEditSettingsOpen] = useState(false);
  const [editCurrency, setEditCurrency] = useState('');
  const [editMonthStartDay, setEditMonthStartDay] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    loadData();
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;

    if (selectedTheme === 'auto') {
      // Remove data-theme attribute to use CSS prefers-color-scheme
      root.removeAttribute('data-theme');
    } else {
      // Set data-theme attribute to force light or dark mode
      root.setAttribute('data-theme', selectedTheme);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const loadData = async () => {
    const settings = await getSettings();
    if (settings) {
      setCurrency(settings.currency);
      setMonthStartDay(settings.monthStartDay.toString());
    }

    const cats = await getAllCategories();
    setCategories(cats);

    const accs = await getAllAccounts();
    setAccounts(accs);

    const pots = await getAllSavingsPots();
    setSavingsPots(pots);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    await createCategory({
      name: newCategoryName.trim(),
      isIncomeCategory: categoryType === 'income' ? 1 : 0,
    });

    setNewCategoryName('');
    setIsAddCategoryOpen(false);
    await loadData();
  };

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    await createAccount(newAccountName.trim());

    setNewAccountName('');
    setIsAddAccountOpen(false);
    await loadData();
  };

  const handleAddPot = async () => {
    if (!newPotName.trim()) {
      toast.error('Please enter a pot name');
      return;
    }

    const targetMinor = newPotTarget ? parseFloat(newPotTarget) * 100 : 0;

    await createSavingsPot({
      name: newPotName.trim(),
      targetAmountMinor: Math.round(targetMinor),
      currentAmountMinor: 0,
      colorHex: newPotColor,
    });

    setNewPotName('');
    setNewPotTarget('');
    setNewPotColor('#007AFF');
    setIsAddPotOpen(false);
    await loadData();
  };

  const handleOpenEditSettings = () => {
    setEditCurrency(currency);
    setEditMonthStartDay(monthStartDay);
    setIsEditSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    const day = parseInt(editMonthStartDay, 10);
    if (isNaN(day) || day < 1 || day > 28) {
      toast.error('Month start day must be between 1 and 28');
      return;
    }

    await updateSettings({
      currency: editCurrency,
      monthStartDay: day,
    });

    setIsEditSettingsOpen(false);
    await loadData();
    toast.success('Settings updated! The app will reload to apply changes.');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleDeleteCategory = async (category: Category) => {
    const transactions = await getAllTransactions();
    const hasTransactions = transactions.some(tx => tx.categoryId === category.id);

    if (hasTransactions) {
      toast.error(`Cannot delete "${category.name}" because it has transactions. Delete the transactions first.`);
      return;
    }

    if (window.confirm(`Delete category "${category.name}"?`)) {
      if (category.id) {
        await deleteCategory(category.id);
        await loadData();
      }
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    const transactions = await getAllTransactions();
    const hasTransactions = transactions.some(tx => tx.accountId === account.id);

    if (hasTransactions) {
      toast.error(`Cannot delete "${account.name}" because it has transactions. Delete the transactions first.`);
      return;
    }

    if (window.confirm(`Delete account "${account.name}"?`)) {
      if (account.id) {
        await deleteAccount(account.id);
        await loadData();
      }
    }
  };

  const handleDeletePot = async (pot: SavingsPot) => {
    if (pot.currentAmountMinor > 0) {
      toast.error(`Cannot delete "${pot.name}" because it has a balance. Withdraw all money first.`);
      return;
    }

    if (window.confirm(`Delete savings pot "${pot.name}"?`)) {
      if (pot.id) {
        await deleteSavingsPot(pot.id);
        await loadData();
      }
    }
  };

  const handleResetApp = () => {
    if (!window.confirm('WARNING: Reset all data? This will delete ALL transactions, budgets, and settings. This cannot be undone!')) {
      return;
    }

    if (!window.confirm('Are you ABSOLUTELY SURE? All your data will be permanently deleted!')) {
      return;
    }

    resetDatabase().then(() => {
      toast.success('App reset successfully. Reloading...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    });
  };

  const incomeCategories = categories.filter(c => c.isIncomeCategory === 1);
  const expenseCategories = categories.filter(c => c.isIncomeCategory === 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      <div className="page-content">
        <div>
          <Card>
            <h3>
              App Settings
            </h3>
            <div>
              <div>Currency</div>
              <div>{currency}</div>
            </div>
            <div>
              <div>Month Start Day</div>
              <div>Day {monthStartDay}</div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Button
                title="Edit Settings"
                onPress={handleOpenEditSettings}
                variant="secondary"
              />
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3>
              Appearance
            </h3>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Theme</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                Choose your preferred color theme
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleThemeChange('light')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: theme === 'light' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: theme === 'light' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  color: theme === 'light' ? '#fff' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Sun size={20} strokeWidth={2.5} />
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: theme === 'dark' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: theme === 'dark' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  color: theme === 'dark' ? '#fff' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Moon size={20} strokeWidth={2.5} />
                Dark
              </button>
              <button
                onClick={() => handleThemeChange('auto')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: theme === 'auto' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: theme === 'auto' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  color: theme === 'auto' ? '#fff' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Monitor size={20} strokeWidth={2.5} />
                Auto
              </button>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3>
              Accounts
            </h3>
            <Button
              title="+ Add Account"
              onPress={() => setIsAddAccountOpen(true)}
              variant="secondary"
            />

            <div style={{ marginTop: '16px' }}>
              {accounts.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  No accounts yet. Add one to get started!
                </p>
              ) : (
                accounts.map(acc => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #F2F2F7',
                    }}
                  >
                    <span>{acc.name}</span>
                    <button
                      onClick={() => handleDeleteAccount(acc)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#FF3B30',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3>
              Categories
            </h3>
            <Button
              title="+ Add Category"
              onPress={() => setIsAddCategoryOpen(true)}
              variant="secondary"
             
            />

            <div>
              <h4>
                EXPENSE CATEGORIES
              </h4>
              {expenseCategories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #F2F2F7',
                  }}
                >
                  <span>{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#FF3B30',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div>
              <h4>
                INCOME CATEGORIES
              </h4>
              {incomeCategories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #F2F2F7',
                  }}
                >
                  <span>{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#FF3B30',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3>
              Savings Pots
            </h3>
            <Button
              title="+ Add Savings Pot"
              onPress={() => setIsAddPotOpen(true)}
              variant="secondary"
            />

            <div style={{ marginTop: '16px' }}>
              {savingsPots.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  No savings pots yet. Create pots to save for specific goals!
                </p>
              ) : (
                savingsPots.map(pot => (
                  <div
                    key={pot.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #F2F2F7',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: pot.colorHex,
                        }}
                      />
                      <span>{pot.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePot(pot)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#FF3B30',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card>
          <h3>
            Danger Zone
          </h3>
          <p>
            Reset all app data including transactions, budgets, categories, and settings.
          </p>
          <Button title="Reset App" onPress={handleResetApp} variant="danger" />
        </Card>
      </div>

      <Modal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} title="Add Account">
        <Input
          label="Account Name"
          value={newAccountName}
          onChange={(e) => setNewAccountName(e.target.value)}
          placeholder="e.g., Main Account"
        />

        <Button title="Add Account" onPress={handleAddAccount} />
      </Modal>

      <Modal isOpen={isAddPotOpen} onClose={() => setIsAddPotOpen(false)} title="Add Savings Pot">
        <Input
          label="Pot Name"
          value={newPotName}
          onChange={(e) => setNewPotName(e.target.value)}
          placeholder="e.g., Emergency Fund"
        />

        <Input
          label="Target Amount (optional)"
          type="number"
          step="0.01"
          value={newPotTarget}
          onChange={(e) => setNewPotTarget(e.target.value)}
          placeholder="0.00"
        />

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
            Color
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFCC00'].map(color => (
              <button
                key={color}
                onClick={() => setNewPotColor(color)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: color,
                  border: newPotColor === color ? '3px solid #000' : 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        <Button title="Add Savings Pot" onPress={handleAddPot} />
      </Modal>

      <Modal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} title="Add Category">
        <div>
          <Button
            title="Expense"
            variant={categoryType === 'expense' ? 'primary' : 'secondary'}
            onPress={() => setCategoryType('expense')}
           
          />
          <Button
            title="Income"
            variant={categoryType === 'income' ? 'primary' : 'secondary'}
            onPress={() => setCategoryType('income')}
           
          />
        </div>

        <Input
          label="Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="e.g., Groceries"
        />

        <Button title="Add Category" onPress={handleAddCategory} />
      </Modal>

      <Modal isOpen={isEditSettingsOpen} onClose={() => setIsEditSettingsOpen(false)} title="Edit Settings">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
            Currency
          </label>
          <select
            value={editCurrency}
            onChange={(e) => setEditCurrency(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid transparent',
              backgroundColor: '#F2F2F7',
            }}
          >
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <Input
          label="Month Start Day (1-28)"
          type="number"
          value={editMonthStartDay}
          onChange={(e) => setEditMonthStartDay(e.target.value)}
          min="1"
          max="28"
          placeholder="1"
        />

        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Changing these settings will affect how your budget months are calculated. The app will reload after saving.
        </p>

        <Button title="Save Settings" onPress={handleSaveSettings} />
      </Modal>
    </div>
  );
}
