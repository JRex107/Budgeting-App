import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { ProgressBar } from '../components/ProgressBar';
import { formatMoney, parseMoneyInput } from '../domain/money';
import { getCurrentMonthKey, getMonthBoundaries } from '../domain/monthCalculations';
import { getSettings } from '../db/repositories/settingsRepository';
import { getBudgetsByMonth, createBudget, updateBudget, deleteBudget, getBudgetByMonthAndCategory } from '../db/repositories/budgetsRepository';
import { getExpenseCategories } from '../db/repositories/categoriesRepository';
import { getAllTransactions } from '../db/repositories/transactionsRepository';
import type { Budget, Category } from '../db/database';

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [monthKey, setMonthKey] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spentByCategory, setSpentByCategory] = useState<Map<number, number>>(new Map());

  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const settings = await getSettings();
    if (!settings) return;

    setCurrency(settings.currency);
    const currentMonthKey = getCurrentMonthKey(settings.monthStartDay);
    setMonthKey(currentMonthKey);

    const cats = await getExpenseCategories();
    setCategories(cats);
    if (cats.length > 0) setFormCategory(cats[0].id?.toString() || '');

    const monthBudgets = await getBudgetsByMonth(currentMonthKey);
    setBudgets(monthBudgets);

    const boundaries = getMonthBoundaries(currentMonthKey, settings.monthStartDay);
    const transactions = await getAllTransactions();
    const monthTransactions = transactions.filter(
      tx => tx.type === 'expense' && tx.dateISO >= boundaries.startDate && tx.dateISO <= boundaries.endDate
    );

    const spentMap = new Map<number, number>();
    monthTransactions.forEach(tx => {
      const current = spentMap.get(tx.categoryId) || 0;
      spentMap.set(tx.categoryId, current + tx.amountMinor);
    });
    setSpentByCategory(spentMap);
  };

  const handleAddBudget = async () => {
    const amountMinor = parseMoneyInput(formAmount);
    if (amountMinor <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const categoryId = parseInt(formCategory, 10);
    const existing = await getBudgetByMonthAndCategory(monthKey, categoryId);

    if (existing && existing.id) {
      await updateBudget(existing.id, amountMinor);
    } else {
      await createBudget({ monthKey, categoryId, amountMinor });
    }

    setFormAmount('');
    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteBudget = async (id: number) => {
    if (window.confirm('Delete this budget?')) {
      await deleteBudget(id);
      await loadData();
    }
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Budgets</h1>
      </div>
      <div className="page-content">
        <div style={{ marginBottom: '20px' }}>
          <Card>
            <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#8E8E93' }}>Current Month</h3>
            <p style={{ fontSize: '20px', fontWeight: '600' }}>{monthKey}</p>
          </Card>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Button title="+ Add Budget" onPress={() => setIsModalOpen(true)} />
        </div>

        {budgets.length === 0 ? (
          <Card>
            <p style={{ textAlign: 'center', color: '#8E8E93' }}>
              No budgets set. Add a budget to track your spending!
            </p>
          </Card>
        ) : (
          budgets.map((budget) => {
            const spent = spentByCategory.get(budget.categoryId) || 0;
            const remaining = budget.amountMinor - spent;

            return (
              <div key={budget.id} style={{ marginBottom: '16px' }}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                      {getCategoryName(budget.categoryId)}
                    </h3>
                    <button
                      onClick={() => budget.id && handleDeleteBudget(budget.id)}
                      style={{
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

                  <div style={{ marginBottom: '12px' }}>
                    <ProgressBar
                      current={spent}
                      max={budget.amountMinor}
                      label={`${formatMoney(spent, currency)} of ${formatMoney(budget.amountMinor, currency)}`}
                      showPercentage={true}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#8E8E93' }}>Remaining</span>
                    <span style={{ fontWeight: '600', color: remaining >= 0 ? '#34C759' : '#FF3B30' }}>
                      {formatMoney(remaining, currency)}
                    </span>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Budget">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
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
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="Budget Amount"
          type="number"
          step="0.01"
          value={formAmount}
          onChange={(e) => setFormAmount(e.target.value)}
          placeholder="0.00"
        />

        <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '16px' }}>
          Set your spending limit for this category for {monthKey}.
        </p>

        <Button title="Save Budget" onPress={handleAddBudget} />
      </Modal>
    </div>
  );
}
