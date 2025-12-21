import { useEffect, useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { Card } from '../components/Card';
import { formatMoney } from '../domain/money';
import { getMonthBoundaries } from '../domain/monthCalculations';
import { calculateMonthSummary } from '../domain/summaries';
import { getSettings } from '../db/repositories/settingsRepository';
import { getAllTransactions } from '../db/repositories/transactionsRepository';
import { getTotalSavings } from '../db/repositories/savingsPotsRepository';

interface MonthData {
  monthKey: string;
  income: number;
  expense: number;
  net: number;
}

export function OverviewPage() {
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const settings = await getSettings();
    if (!settings) return;

    setCurrency(settings.currency);

    const transactions = await getAllTransactions();
    const today = new Date();
    const data: MonthData[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, settings.monthStartDay);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

      const boundaries = getMonthBoundaries(monthKey, settings.monthStartDay);
      const monthTransactions = transactions.filter(
        tx => tx.dateISO >= boundaries.startDate && tx.dateISO <= boundaries.endDate
      );

      const summary = calculateMonthSummary(monthTransactions);
      data.push({
        monthKey,
        income: summary.income,
        expense: summary.expense,
        net: summary.net,
      });
    }

    // Load savings data
    const savings = await getTotalSavings();

    setMonthsData(data);
    setTotalSavings(savings);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  const totalIncome = monthsData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthsData.reduce((sum, m) => sum + m.expense, 0);
  const totalNet = totalIncome - totalExpense;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
      </div>
      <div className="page-content">
        <div style={{ marginBottom: '20px' }}>
          <Card>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#8E8E93' }}>
              Last 6 Months
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', color: '#8E8E93' }}>Total Income</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#34C759' }}>
                {formatMoney(totalIncome, currency)}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', color: '#8E8E93' }}>Total Expenses</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#FF3B30' }}>
                {formatMoney(totalExpense, currency)}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', color: '#8E8E93' }}>Net</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: totalNet >= 0 ? '#34C759' : '#FF3B30' }}>
                {formatMoney(totalNet, currency)}
              </div>
            </div>
            {totalSavings > 0 && (
              <div style={{ paddingTop: '12px', borderTop: '1px solid #E5E5EA' }}>
                <div style={{ fontSize: '14px', color: '#8E8E93', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PiggyBank size={16} strokeWidth={2.5} />
                  Total Savings
                </div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#007AFF' }}>
                  {formatMoney(totalSavings, currency)}
                </div>
              </div>
            )}
          </Card>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
          Monthly Breakdown
        </h3>

        {monthsData.map((month) => (
          <div key={month.monthKey} style={{ marginBottom: '12px' }}>
            <Card>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>{month.monthKey}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ color: '#8E8E93' }}>Income</span>
                <span style={{ fontWeight: '600', color: '#34C759' }}>
                  {formatMoney(month.income, currency)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ color: '#8E8E93' }}>Expenses</span>
                <span style={{ fontWeight: '600', color: '#FF3B30' }}>
                  {formatMoney(month.expense, currency)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingTop: '8px', borderTop: '1px solid #E5E5EA' }}>
                <span style={{ color: '#8E8E93', fontWeight: '600' }}>Net</span>
                <span style={{ fontWeight: '600', color: month.net >= 0 ? '#34C759' : '#FF3B30' }}>
                  {formatMoney(month.net, currency)}
                </span>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
