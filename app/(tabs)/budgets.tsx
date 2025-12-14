import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Card, ProgressBar } from '@/components';
import { getSettings } from '@/db/repositories/settingsRepository';
import { getAllTransactions } from '@/db/repositories/transactionsRepository';
import { getExpenseCategories } from '@/db/repositories/categoriesRepository';
import {
  getBudgetsByMonth,
  createOrUpdateBudget,
  copyBudgetsToNextMonth,
} from '@/db/repositories/budgetsRepository';
import {
  getCurrentMonthKey,
  getMonthBoundaries,
  getPreviousMonthKey,
  getNextMonthKey,
  formatMonthKeyForDisplay,
} from '@/domain/monthCalculations';
import { formatMoney, parseMoneyToMinor } from '@/domain/money';
import { calculateBudgetProgress } from '@/domain/summaries';
import type { Category, Budget, Transaction } from '@/db/types';

interface BudgetWithProgress {
  categoryId: number;
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export default function BudgetsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState('GBP');
  const [monthStartDay, setMonthStartDay] = useState(1);
  const [currentMonthKey, setCurrentMonthKey] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    loadData();
  }, [currentMonthKey]);

  // Reload data when screen comes into focus (e.g., after adding a category)
  useFocusEffect(
    React.useCallback(() => {
      if (currentMonthKey) {
        loadData();
      }
    }, [currentMonthKey])
  );

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

      if (!currentMonthKey) {
        const monthKey = getCurrentMonthKey(settings.monthStartDay);
        setCurrentMonthKey(monthKey);
        return;
      }

      // Load expense categories
      const expenseCategories = await getExpenseCategories();
      setCategories(expenseCategories);

      // Load budgets for current month
      const monthBudgets = await getBudgetsByMonth(currentMonthKey);
      setBudgets(monthBudgets);

      // Load transactions for current month
      const { startDate, endDate } = getMonthBoundaries(currentMonthKey, settings.monthStartDay);
      const allTransactions = await getAllTransactions();
      const monthTransactions = allTransactions.filter(
        (tx) => tx.dateISO >= startDate && tx.dateISO <= endDate && tx.type === 'expense'
      );
      setTransactions(monthTransactions);
    } catch (error) {
      console.error('Error loading budgets:', error);
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

  const handleEditBudget = (categoryId: number, currentAmount: number) => {
    setEditingCategory(categoryId);
    setEditAmount((currentAmount / 100).toString());
  };

  const handleSaveBudget = async (categoryId: number) => {
    try {
      const amountMinor = parseMoneyToMinor(editAmount);

      await createOrUpdateBudget({
        monthKey: currentMonthKey,
        categoryId,
        amountMinor,
      });

      setEditingCategory(null);
      setEditAmount('');
      await loadData();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleCopyLastMonth = async () => {
    try {
      const lastMonth = getPreviousMonthKey(currentMonthKey);
      await copyBudgetsToNextMonth(lastMonth, currentMonthKey);
      Alert.alert('Success', 'Budgets copied from last month');
      await loadData();
    } catch (error) {
      console.error('Error copying budgets:', error);
      Alert.alert('Error', 'Failed to copy budgets from last month');
    }
  };

  if (isLoading || !currentMonthKey) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Calculate budget progress for each category
  const budgetProgress: BudgetWithProgress[] = categories.map((category) => {
    const budget = budgets.find((b) => b.categoryId === category.id);
    const spent = transactions
      .filter((tx) => tx.categoryId === category.id)
      .reduce((sum, tx) => sum + tx.amountMinor, 0);

    const budgeted = budget?.amountMinor || 0;
    const progress = calculateBudgetProgress(spent, budgeted);

    return {
      categoryId: category.id,
      categoryName: category.name,
      budgeted: progress.budgeted,
      spent: progress.spent,
      remaining: progress.remaining,
      percentage: progress.percentage,
      isOverBudget: progress.isOverBudget,
    };
  });

  // Sort: budgeted categories first, then alphabetically
  budgetProgress.sort((a, b) => {
    if (a.budgeted > 0 && b.budgeted === 0) return -1;
    if (a.budgeted === 0 && b.budgeted > 0) return 1;
    return a.categoryName.localeCompare(b.categoryName);
  });

  return (
    <View style={styles.container}>
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

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={handleCopyLastMonth} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Copy Last Month</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/add-category')}
          style={[styles.actionButton, styles.addCategoryButton]}
        >
          <Text style={[styles.actionButtonText, styles.addCategoryButtonText]}>
            + Add Category
          </Text>
        </TouchableOpacity>
      </View>

      {/* Budget List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {budgetProgress.map((item) => (
          <Card key={item.categoryId} style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.categoryName}>{item.categoryName}</Text>
              {editingCategory === item.categoryId ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => handleSaveBudget(item.categoryId)}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleEditBudget(item.categoryId, item.budgeted)}
                >
                  <Text style={styles.budgetAmount}>
                    {item.budgeted > 0
                      ? formatMoney(item.budgeted, currency)
                      : 'Set Budget'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {item.budgeted > 0 && (
              <>
                <ProgressBar
                  current={item.spent}
                  max={item.budgeted}
                  showPercentage={false}
                />
                <View style={styles.budgetDetails}>
                  <Text style={styles.detailText}>
                    Spent: {formatMoney(item.spent, currency)}
                  </Text>
                  <Text
                    style={[
                      styles.detailText,
                      item.isOverBudget && styles.overBudgetText,
                    ]}
                  >
                    Remaining: {formatMoney(Math.max(0, item.remaining), currency)}
                  </Text>
                </View>
              </>
            )}
          </Card>
        ))}
      </ScrollView>
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
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  addCategoryButton: {
    backgroundColor: '#007AFF',
  },
  addCategoryButtonText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  budgetCard: {
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6E6E73',
  },
  overBudgetText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});
