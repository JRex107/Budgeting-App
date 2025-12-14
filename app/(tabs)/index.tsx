import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components';
import { getSettings } from '@/db/repositories/settingsRepository';
import { getAllTransactions } from '@/db/repositories/transactionsRepository';
import { getAllCategories } from '@/db/repositories/categoriesRepository';
import {
  getCurrentMonthKey,
  getMonthBoundaries,
  getPreviousMonthKey,
  getNextMonthKey,
  formatMonthKeyForDisplay,
} from '@/domain/monthCalculations';
import { formatMoney } from '@/domain/money';
import { calculateMonthSummary, calculateCategoryBreakdown } from '@/domain/summaries';
import type { Transaction, Category } from '@/db/types';

export default function DashboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState('GBP');
  const [monthStartDay, setMonthStartDay] = useState(1);
  const [currentMonthKey, setCurrentMonthKey] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();
  }, [currentMonthKey]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load settings
      const settings = await getSettings();
      if (!settings) {
        router.replace('/onboarding');
        return;
      }

      setCurrency(settings.currency);
      setMonthStartDay(settings.monthStartDay);

      // Set current month if not already set
      if (!currentMonthKey) {
        const monthKey = getCurrentMonthKey(settings.monthStartDay);
        setCurrentMonthKey(monthKey);
        return; // Will reload via useEffect
      }

      // Load transactions for the month
      const { startDate, endDate } = getMonthBoundaries(currentMonthKey, settings.monthStartDay);
      const allTransactions = await getAllTransactions();
      const monthTransactions = allTransactions.filter(
        (tx) => tx.dateISO >= startDate && tx.dateISO <= endDate
      );
      setTransactions(monthTransactions);

      // Load categories
      const allCategories = await getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonthKey(getPreviousMonthKey(currentMonthKey));
  };

  const handleNextMonth = () => {
    setCurrentMonthKey(getNextMonthKey(currentMonthKey));
  };

  const handleAddTransaction = () => {
    router.push('/add-transaction');
  };

  if (isLoading || !currentMonthKey) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const summary = calculateMonthSummary(transactions);
  const breakdown = calculateCategoryBreakdown(transactions, categories, 5);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {formatMonthKeyForDisplay(currentMonthKey)}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
            <Text style={styles.monthButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, styles.incomeAmount]}>
              {formatMoney(summary.income, currency)}
            </Text>
          </Card>

          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, styles.expenseAmount]}>
              {formatMoney(summary.expense, currency)}
            </Text>
          </Card>

          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text
              style={[
                styles.summaryAmount,
                summary.net >= 0 ? styles.positiveAmount : styles.negativeAmount,
              ]}
            >
              {formatMoney(summary.net, currency)}
            </Text>
          </Card>
        </View>

        {/* Category Breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {breakdown.length > 0 ? (
            breakdown.map((item) => (
              <View key={item.categoryId} style={styles.breakdownItem}>
                <View style={styles.breakdownInfo}>
                  <Text style={styles.categoryName}>{item.categoryName}</Text>
                  <Text style={styles.categoryAmount}>
                    {formatMoney(item.amount, currency)}
                  </Text>
                </View>
                <Text style={styles.categoryPercentage}>
                  {item.percentage.toFixed(0)}%
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No expenses this month</Text>
          )}
        </Card>
      </ScrollView>

      {/* Add Transaction Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddTransaction}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#34C759',
  },
  expenseAmount: {
    color: '#FF3B30',
  },
  positiveAmount: {
    color: '#34C759',
  },
  negativeAmount: {
    color: '#FF3B30',
  },
  breakdownCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  breakdownInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#8E8E93',
    minWidth: 40,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
