import { useEffect, useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { Skeleton, SkeletonCard } from '../components/Skeleton';
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
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Overview</h1>
        </div>
        <div className="page-content">
          <Card>
            <Skeleton variant="text" width="120px" height="18px" />
            <div style={{ marginBottom: '12px', marginTop: '16px' }}>
              <Skeleton variant="text" width="100px" height="14px" />
              <Skeleton variant="text" width="140px" height="24px" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Skeleton variant="text" width="120px" height="14px" />
              <Skeleton variant="text" width="140px" height="24px" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Skeleton variant="text" width="60px" height="14px" />
              <Skeleton variant="text" width="140px" height="24px" />
            </div>
          </Card>

          <div style={{ marginTop: '20px' }}>
            <SkeletonCard />
          </div>

          <div style={{ marginTop: '20px' }}>
            <Skeleton variant="text" width="180px" height="20px" />
          </div>

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ marginTop: '12px' }}>
              <SkeletonCard />
            </div>
          ))}
        </div>
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

        {/* Trends Chart */}
        <div style={{ marginBottom: '20px' }}>
          <Card>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Income & Expense Trends
            </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthsData.map(m => ({
                  month: m.monthKey,
                  Income: m.income / 100, // Convert to major units
                  Expenses: m.expense / 100,
                  Net: m.net / 100,
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="month"
                  stroke="var(--color-text-secondary)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="var(--color-text-secondary)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${currency === 'GBP' ? '£' : '$'}${value}`}
                />
                <Tooltip
                  formatter={(value) => formatMoney((value as number) * 100, currency)}
                  contentStyle={{
                    background: 'var(--glass-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', r: 5 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="Net"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
