import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { formatMoney } from '../domain/money';
import { getCurrentMonthKey, getMonthBoundaries } from '../domain/monthCalculations';
import { calculateMonthSummary, calculateCategoryBreakdown } from '../domain/summaries';
import { getSettings } from '../db/repositories/settingsRepository';
import { getAllTransactions } from '../db/repositories/transactionsRepository';
import { getAllCategories } from '../db/repositories/categoriesRepository';
import { getAllSavingsPots, getTotalSavings } from '../db/repositories/savingsPotsRepository';
import type { SavingsPot } from '../db/database';

export function DashboardPage() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [savingsPots, setSavingsPots] = useState<SavingsPot[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const settings = await getSettings();
      if (!settings) return;

      setCurrency(settings.currency);

      const monthKey = getCurrentMonthKey(settings.monthStartDay);
      const boundaries = getMonthBoundaries(monthKey, settings.monthStartDay);
      const allTransactions = await getAllTransactions();
      const categories = await getAllCategories();

      // Filter transactions for current month
      const monthTransactions = allTransactions.filter(
        (tx) => tx.dateISO >= boundaries.startDate && tx.dateISO <= boundaries.endDate
      );

      const monthlySummary = calculateMonthSummary(monthTransactions);
      const categoryBreakdown = calculateCategoryBreakdown(monthTransactions, categories);

      // Load savings data
      const pots = await getAllSavingsPots();
      const total = await getTotalSavings();

      setSummary(monthlySummary);
      setBreakdown(categoryBreakdown);
      setSavingsPots(pots);
      setTotalSavings(total);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setLoading(false);
    }
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
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="page-content">
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '4px' }}>Income</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#34C759' }}>
              {formatMoney(summary.income, currency)}
            </p>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '4px' }}>Expenses</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#FF3B30' }}>
              {formatMoney(summary.expense, currency)}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '4px' }}>Net</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: summary.net >= 0 ? '#34C759' : '#FF3B30' }}>
              {formatMoney(summary.net, currency)}
            </p>
          </div>
        </Card>

        {savingsPots.length > 0 && (
          <Card>
            <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>💰 Savings</h3>
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
          <div style={{ marginTop: '20px' }}>
            <Card>
              <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Spending by Category</h3>
              {breakdown.map((cat) => (
                <div key={cat.categoryId} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>{cat.categoryName}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {formatMoney(cat.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
