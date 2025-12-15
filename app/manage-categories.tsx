import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from '@/components';
import {
  getAllCategories,
  deleteCategory,
} from '@/db/repositories/categoriesRepository';
import { getAllTransactions } from '@/db/repositories/transactionsRepository';
import type { Category } from '@/db/types';

export default function ManageCategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const allCategories = await getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    // Check if category has transactions
    const transactions = await getAllTransactions();
    const hasTransactions = transactions.some((tx) => tx.categoryId === category.id);

    if (hasTransactions) {
      Alert.alert(
        'Cannot Delete',
        `"${category.name}" has existing transactions. Delete those transactions first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              await loadCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleRenameCategory = (category: Category) => {
    router.push({
      pathname: '/edit-category',
      params: { id: category.id, name: category.name },
    });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard}>
      <View style={styles.categoryRow}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryType}>
            {item.isIncomeCategory ? 'Income' : 'Expense'}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleRenameCategory(item)}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteCategory(item)}
            style={[styles.actionButton, styles.deleteActionButton]}
          >
            <Text style={[styles.actionButtonText, styles.deleteActionText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.header}>
            Tap Rename to edit or Delete to remove categories
          </Text>
        }
        ListFooterComponent={
          <Button
            title="+ Add New Category"
            onPress={() => router.push('/add-category')}
            style={styles.addButton}
          />
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
  listContent: {
    padding: 16,
  },
  header: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteActionButton: {
    backgroundColor: '#FF3B30',
  },
  deleteActionText: {
    color: '#fff',
  },
  addButton: {
    marginTop: 24,
  },
});
