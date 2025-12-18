import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { getSettings } from '../db/repositories/settingsRepository';
import { getAllCategories, createCategory, deleteCategory } from '../db/repositories/categoriesRepository';
import { getAllTransactions } from '../db/repositories/transactionsRepository';
import { resetDatabase } from '../db/database';
import type { Category } from '../db/database';

export function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState('');
  const [monthStartDay, setMonthStartDay] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const settings = await getSettings();
    if (settings) {
      setCurrency(settings.currency);
      setMonthStartDay(settings.monthStartDay.toString());
    }

    const cats = await getAllCategories();
    setCategories(cats);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
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

  const handleDeleteCategory = async (category: Category) => {
    const transactions = await getAllTransactions();
    const hasTransactions = transactions.some(tx => tx.categoryId === category.id);

    if (hasTransactions) {
      alert(`Cannot delete "${category.name}" because it has transactions. Delete the transactions first.`);
      return;
    }

    if (window.confirm(`Delete category "${category.name}"?`)) {
      if (category.id) {
        await deleteCategory(category.id);
        await loadData();
      }
    }
  };

  const handleResetApp = () => {
    if (!window.confirm('⚠️ Reset all data? This will delete ALL transactions, budgets, and settings. This cannot be undone!')) {
      return;
    }

    if (!window.confirm('Are you ABSOLUTELY SURE? All your data will be permanently deleted!')) {
      return;
    }

    resetDatabase().then(() => {
      alert('App reset successfully. Reloading...');
      window.location.reload();
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
    </div>
  );
}
