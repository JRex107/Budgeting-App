import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components';
import { createCategory } from '@/db/repositories/categoriesRepository';

export default function AddCategoryScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isIncomeCategory, setIsIncomeCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!name.trim()) {
        setError('Category name is required');
        return;
      }

      // Create category
      await createCategory({ name: name.trim(), isIncomeCategory });

      router.back();
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. It may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Category Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g., Gym, Pets, Travel"
        error={error}
      />

      <View style={styles.typeSection}>
        <Text style={styles.typeLabel}>Category Type</Text>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              !isIncomeCategory && styles.typeButtonActive,
            ]}
            onPress={() => setIsIncomeCategory(false)}
          >
            <Text
              style={[
                styles.typeButtonText,
                !isIncomeCategory && styles.typeButtonTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              isIncomeCategory && styles.typeButtonActive,
            ]}
            onPress={() => setIsIncomeCategory(true)}
          >
            <Text
              style={[
                styles.typeButtonText,
                isIncomeCategory && styles.typeButtonTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button
        title="Add Category"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  typeSection: {
    marginBottom: 24,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
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
  button: {
    marginTop: 16,
  },
});
