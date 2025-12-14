import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components';
import { transactionSchema } from '@/domain/validation';
import { parseMoneyToMinor } from '@/domain/money';
import { getTodayISO } from '@/domain/monthCalculations';
import { createTransaction } from '@/db/repositories/transactionsRepository';
import { getAllAccounts } from '@/db/repositories/accountsRepository';
import {
  getExpenseCategories,
  getIncomeCategories,
} from '@/db/repositories/categoriesRepository';
import type { Category, Account } from '@/db/types';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dateISO, setDateISO] = useState(getTodayISO());
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    try {
      const allAccounts = await getAllAccounts();
      setAccounts(allAccounts);

      // Set default account if not already set
      if (!accountId && allAccounts.length > 0) {
        setAccountId(allAccounts[0].id);
      }

      // Load categories based on type
      const cats =
        type === 'income'
          ? await getIncomeCategories()
          : await getExpenseCategories();
      setCategories(cats);

      // Reset category when switching type
      if (cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Validate input
      const result = transactionSchema.safeParse({
        accountId: accountId || 0,
        categoryId: categoryId || 0,
        type,
        amount,
        dateISO,
        merchant,
        note,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      // Convert amount to minor units
      const amountMinor = parseMoneyToMinor(amount);

      if (amountMinor <= 0) {
        setErrors({ amount: 'Amount must be greater than zero' });
        return;
      }

      // Create transaction
      await createTransaction({
        accountId: result.data.accountId,
        categoryId: result.data.categoryId,
        type: result.data.type,
        amountMinor,
        dateISO: result.data.dateISO,
        merchant: result.data.merchant,
        note: result.data.note,
      });

      Alert.alert('Success', 'Transaction added successfully');
      router.back();
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          onPress={() => setType('expense')}
        >
          <Text
            style={[
              styles.typeButtonText,
              type === 'expense' && styles.typeButtonTextActive,
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          onPress={() => setType('income')}
        >
          <Text
            style={[
              styles.typeButtonText,
              type === 'income' && styles.typeButtonTextActive,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Input
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={errors.amount}
      />

      {/* Merchant */}
      <Input
        label="Merchant / Description"
        value={merchant}
        onChangeText={setMerchant}
        placeholder="Where did you spend?"
        error={errors.merchant}
      />

      {/* Account Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Account</Text>
        <View style={styles.optionsContainer}>
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.option,
                accountId === account.id && styles.optionSelected,
              ]}
              onPress={() => setAccountId(account.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  accountId === account.id && styles.optionTextSelected,
                ]}
              >
                {account.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.accountId && <Text style={styles.error}>{errors.accountId}</Text>}
      </View>

      {/* Category Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.optionsContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.option,
                categoryId === category.id && styles.optionSelected,
              ]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  categoryId === category.id && styles.optionTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.categoryId && <Text style={styles.error}>{errors.categoryId}</Text>}
      </View>

      {/* Date */}
      <Input
        label="Date (YYYY-MM-DD)"
        value={dateISO}
        onChangeText={setDateISO}
        placeholder="2024-01-01"
        error={errors.dateISO}
      />

      {/* Note */}
      <Input
        label="Note (Optional)"
        value={note}
        onChangeText={setNote}
        placeholder="Any additional details..."
        multiline
        numberOfLines={3}
      />

      {/* Submit Button */}
      <Button
        title="Add Transaction"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E6E73',
  },
  typeButtonTextActive: {
    color: '#007AFF',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FF',
  },
  optionText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
  },
});
