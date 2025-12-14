import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components';
import { getSettings } from '@/db/repositories/settingsRepository';
import { getAllTransactions } from '@/db/repositories/transactionsRepository';
import {
  getCurrentMonthKey,
  getLastNMonthKeys,
  getMonthBoundaries,
  formatMonthKeyForDisplay,
} from '@/domain/monthCalculations';
import { formatMoney } from '@/domain/money';
import { calculateMonthSummary } from '@/domain/summaries';
import type { Transaction } from '@/db/types';

interface MonthData {
  monthKey: string;
  monthName: string;
  income: number;
  expense: number;
  net: number;
}

export default function OverviewScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState('GBP');
  const [monthStartDay, setMonthStartDay] = useState(1);
  const [monthData, setMonthData] = useState<MonthData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const settings = await getSettings();
      if (!settings) {
        router.replace('/onboarding');
        return;
      }

      setCurrency(settings.currency);
      setMonthStartDay(settings.monthStartDay);

      // Get last 6 months including current month
      const currentMonth = getCurrentMonthKey(settings.monthStartDay);
      const monthKeys = getLastNMonthKeys(currentMonth, 6);

      // Load all transactions
      const allTransactions = await getAllTransactions();

      // Calculate data for each month
      const data: MonthData[] = monthKeys.map((monthKey) => {
        const { startDate, endDate } = getMonthBoundaries(monthKey, settings.monthStartDay);
        const monthTransactions = allTransactions.filter(
          (tx) => tx.dateISO >= startDate && tx.dateISO <= endDate
        );
        const summary = calculateMonthSummary(monthTransactions);

        return {
          monthKey,
          monthName: formatMonthKeyForDisplay(monthKey),
          income: summary.income,
          expense: summary.expense,
          net: summary.net,
        };
      });

      setMonthData(data);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Calculate totals
  const totalIncome = monthData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthData.reduce((sum, m) => sum + m.expense, 0);
  const totalNet = totalIncome - totalExpense;
  const avgIncome = monthData.length > 0 ? totalIncome / monthData.length : 0;
  const avgExpense = monthData.length > 0 ? totalExpense / monthData.length : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Last 6 Months Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryValue, styles.incomeValue]}>
            {formatMoney(totalIncome, currency)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>
            {formatMoney(totalExpense, currency)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text
            style={[
              styles.summaryValue,
              totalNet >= 0 ? styles.positiveValue : styles.negativeValue,
            ]}
          >
            {formatMoney(totalNet, currency)}
          </Text>
        </View>
      </Card>

      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Monthly Averages</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Avg Income</Text>
          <Text style={[styles.summaryValue, styles.incomeValue]}>
            {formatMoney(avgIncome, currency)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Avg Expenses</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>
            {formatMoney(avgExpense, currency)}
          </Text>
        </View>
      </Card>

      <Card style={styles.trendCard}>
        <Text style={styles.sectionTitle}>Monthly Trend</Text>
        {monthData.map((month) => (
          <View key={month.monthKey} style={styles.monthRow}>
            <Text style={styles.monthName}>{month.monthName}</Text>
            <View style={styles.monthValues}>
              <View style={styles.valueColumn}>
                <Text style={styles.valueLabel}>Income</Text>
                <Text style={[styles.value, styles.incomeValue]}>
                  {formatMoney(month.income, currency)}
                </Text>
              </View>
              <View style={styles.valueColumn}>
                <Text style={styles.valueLabel}>Expenses</Text>
                <Text style={[styles.value, styles.expenseValue]}>
                  {formatMoney(month.expense, currency)}
                </Text>
              </View>
              <View style={styles.valueColumn}>
                <Text style={styles.valueLabel}>Net</Text>
                <Text
                  style={[
                    styles.value,
                    month.net >= 0 ? styles.positiveValue : styles.negativeValue,
                  ]}
                >
                  {formatMoney(month.net, currency)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  trendCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6E6E73',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeValue: {
    color: '#34C759',
  },
  expenseValue: {
    color: '#FF3B30',
  },
  positiveValue: {
    color: '#34C759',
  },
  negativeValue: {
    color: '#FF3B30',
  },
  monthRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  monthValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueColumn: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});
