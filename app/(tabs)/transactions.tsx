import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components';
import { getSettings } from '@/db/repositories/settingsRepository';
import {
  getAllTransactions,
  searchTransactions,
} from '@/db/repositories/transactionsRepository';
import { getAllAccounts } from '@/db/repositories/accountsRepository';
import { getAllCategories } from '@/db/repositories/categoriesRepository';
import {
  getCurrentMonthKey,
  getMonthBoundaries,
  getPreviousMonthKey,
  getNextMonthKey,
  formatMonthKeyForDisplay,
} from '@/domain/monthCalculations';
import { formatMoney } from '@/domain/money';
import type { Transaction, Account, Category } from '@/db/types';

export default function TransactionsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState('GBP');
  const [monthStartDay, setMonthStartDay] = useState(1);
  const [currentMonthKey, setCurrentMonthKey] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [currentMonthKey]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, selectedAccount, selectedCategory]);

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

      // Load all data
      const { startDate, endDate } = getMonthBoundaries(currentMonthKey, settings.monthStartDay);
      const allTransactions = await getAllTransactions();
      const monthTransactions = allTransactions.filter(
        (tx) => tx.dateISO >= startDate && tx.dateISO <= endDate
      );
      setTransactions(monthTransactions);

      const allAccounts = await getAllAccounts();
      setAccounts(allAccounts);

      const allCategories = await getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.merchant.toLowerCase().includes(query) ||
          tx.note.toLowerCase().includes(query)
      );
    }

    // Apply account filter
    if (selectedAccount !== null) {
      filtered = filtered.filter((tx) => tx.accountId === selectedAccount);
    }

    // Apply category filter
    if (selectedCategory !== null) {
      filtered = filtered.filter((tx) => tx.categoryId === selectedCategory);
    }

    setFilteredTransactions(filtered);
  };

  const handlePreviousMonth = () => {
    setCurrentMonthKey(getPreviousMonthKey(currentMonthKey));
  };

  const handleNextMonth = () => {
    setCurrentMonthKey(getNextMonthKey(currentMonthKey));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAccount(null);
    setSelectedCategory(null);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const account = accounts.find((a) => a.id === item.accountId);
    const category = categories.find((c) => c.id === item.categoryId);

    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.merchant}>{item.merchant || 'Transaction'}</Text>
            <Text style={styles.category}>{category?.name}</Text>
          </View>
          <Text
            style={[
              styles.amount,
              item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
            ]}
          >
            {item.type === 'income' ? '+' : '-'}
            {formatMoney(item.amountMinor, currency)}
          </Text>
        </View>
        <View style={styles.transactionFooter}>
          <Text style={styles.detail}>{account?.name}</Text>
          <Text style={styles.detail}>{item.dateISO}</Text>
        </View>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </Card>
    );
  };

  if (isLoading || !currentMonthKey) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const hasActiveFilters = searchQuery || selectedAccount || selectedCategory;

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by merchant or note..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filters:</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
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
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1C1C1E',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#8E8E93',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#34C759',
  },
  expenseAmount: {
    color: '#FF3B30',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  note: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
