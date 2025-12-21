import { useEffect, useState } from 'react';
import { PiggyBank, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { MonthHeader } from '../components/MonthHeader';
import { formatMoney } from '../domain/money';
import { getCurrentMonthKey, getMonthBoundaries, getPreviousMonthKey, getNextMonthKey } from '../domain/monthCalculations';
import { calculateMonthSummary, calculateCategoryBreakdown } from '../domain/summaries';
import { getSettings } from '../db/repositories/settingsRepository';
import { getAllTransactions } from '../db/repositories/transactionsRepository';
import { getAllCategories } from '../db/repositories/categoriesRepository';
import { getAllSavingsPots, getTotalSavings } from '../db/repositories/savingsPotsRepository';
import { getBudgetsByMonth } from '../db/repositories/budgetsRepository';
import type { SavingsPot, Budget } from '../db/database';
import './DashboardPage.css';

interface BudgetWithUsage extends Budget {
  spent: number;
  percentage: number;
  categoryName: string;
}

export function DashboardPage() {
  const [monthKey, setMonthKey] = useState('');
  const [monthStartDay, setMonthStartDay] = useState(1);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<BudgetWithUsage[]>([]);
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (monthKey && monthStartDay) {
      loadMonthData();
    }
  }, [monthKey]);

  const loadData = async () => {
    try {
      const settings = await getSettings();
      if (!settings) return;

      setCurrency(settings.currency);
      setMonthStartDay(settings.monthStartDay);

      const currentMonthKey = getCurrentMonthKey(settings.monthStartDay);
      setMonthKey(currentMonthKey);

      // Load savings data (not month-specific)
      const pots = await getAllSavingsPots();
      const total = await getTotalSavings();
      setSavingsPots(pots);
      setTotalSavings(total);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  const loadMonthData = async () => {
    try {
      const settings = await getSettings();
      if (!settings) return;

      const boundaries = getMonthBoundaries(monthKey, settings.monthStartDay);
      const allTransactions = await getAllTransactions();
      const categories = await getAllCategories();

      // Filter transactions for selected month
      const monthTransactions = allTransactions.filter(
        (tx) => tx.dateISO >= boundaries.startDate && tx.dateISO <= boundaries.endDate
      );

      const monthlySummary = calculateMonthSummary(monthTransactions);
      const categoryBreakdown = calculateCategoryBreakdown(monthTransactions, categories);

      // Load budgets and calculate usage
      const monthBudgets = await getBudgetsByMonth(monthKey);
      const budgetsWithUsage: BudgetWithUsage[] = monthBudgets.map(budget => {
        const spent = monthTransactions
          .filter(tx => tx.type === 'expense' && tx.categoryId === budget.categoryId)
          .reduce((sum, tx) => sum + tx.amountMinor, 0);

        const percentage = budget.amountMinor > 0 ? (spent / budget.amountMinor) * 100 : 0;
        const categoryName = categories.find(c => c.id === budget.categoryId)?.name || 'Unknown';

        return {
          ...budget,
          spent,
          percentage,
          categoryName,
        };
      });

      setSummary(monthlySummary);
      setBreakdown(categoryBreakdown);
      setBudgets(budgetsWithUsage);
    } catch (error) {
      console.error('Failed to load month data:', error);
    }
  };

  const handlePrevMonth = () => {
    setMonthKey(getPreviousMonthKey(monthKey));
  };

  const handleNextMonth = () => {
    setMonthKey(getNextMonthKey(monthKey));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <MonthHeader
          monthKey={monthKey}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* 3-Card Stats Layout */}
        <div className="stats-grid">
          <Card>
            <div className="stat-card">
              <div className="stat-icon stat-icon-income">
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Income</p>
                <p className="stat-value stat-value-income">
                  {formatMoney(summary.income, currency)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-icon stat-icon-expense">
                <TrendingDown size={24} strokeWidth={2.5} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Expenses</p>
                <p className="stat-value stat-value-expense">
                  {formatMoney(summary.expense, currency)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-icon stat-icon-net">
                <DollarSign size={24} strokeWidth={2.5} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Net</p>
                <p className={`stat-value ${summary.net >= 0 ? 'stat-value-income' : 'stat-value-expense'}`}>
                  {formatMoney(summary.net, currency)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Budgets Preview */}
        {budgets.length > 0 && (
          <Card>
            <h3 className="section-title">Budgets at a Glance</h3>
            <div className="budgets-preview">
              {budgets
                .sort((a, b) => b.percentage - a.percentage) // Sort by percentage descending
                .slice(0, 5) // Top 5 budgets
                .map((budget) => {
                  const isWarning = budget.percentage >= 80 && budget.percentage < 100;
                  const isDanger = budget.percentage >= 100;
                  const statusClass = isDanger ? 'danger' : isWarning ? 'warning' : 'normal';

                  return (
                    <div key={budget.id} className={`budget-preview-item budget-${statusClass}`}>
                      <div className="budget-preview-header">
                        <span className="budget-category-name">{budget.categoryName}</span>
                        <span className="budget-percentage">{Math.round(budget.percentage)}%</span>
                      </div>
                      <div className="budget-preview-bar">
                        <div
                          className={`budget-preview-fill budget-fill-${statusClass}`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="budget-preview-amounts">
                        <span className="budget-spent">{formatMoney(budget.spent, currency)}</span>
                        <span className="budget-total">of {formatMoney(budget.amountMinor, currency)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {savingsPots.length > 0 && (
          <Card>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PiggyBank size={20} strokeWidth={2.5} />
              Savings
            </h3>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F2F2F7', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '4px' }}>Total Saved</p>
              <p style={{ fontSize: '24px', fontWeight: '600', color: '#007AFF' }}>
                {formatMoney(totalSavings, currency)}
              </p>
            </div>
            {savingsPots.slice(0, 3).map((pot) => {
              const progress = pot.targetAmountMinor > 0
                ? Math.min((pot.currentAmountMinor / pot.targetAmountMinor) * 100, 100)
                : 0;
              return (
                <div key={pot.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: pot.colorHex,
                        }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{pot.name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {formatMoney(pot.currentAmountMinor, currency)}
                    </span>
                  </div>
                  {pot.targetAmountMinor > 0 && (
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#F2F2F7', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          backgroundColor: pot.colorHex,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        )}

        {breakdown.length > 0 && (
          <Card>
            <h3 className="section-title">Spending by Category</h3>
            <div className="category-breakdown">
              {breakdown
                .sort((a, b) => b.amount - a.amount) // Sort by amount descending
                .map((cat, index) => {
                  const maxAmount = breakdown[0]?.amount || 1;
                  const percentage = (cat.amount / maxAmount) * 100;
                  return (
                    <div key={cat.categoryId} className="category-bar-item">
                      <div className="category-bar-header">
                        <div className="category-rank">#{index + 1}</div>
                        <span className="category-name">{cat.categoryName}</span>
                        <span className="category-amount">
                          {formatMoney(cat.amount, currency)}
                        </span>
                      </div>
                      <div className="category-bar-track">
                        <div
                          className="category-bar-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
