import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Input } from '@/components';
import { getDatabase } from '@/db/database';

export default function EditCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const [name, setName] = useState(params.name || '');
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

      const db = await getDatabase();
      await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', [
        name.trim(),
        parseInt(params.id, 10),
      ]);

      Alert.alert('Success', 'Category renamed successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Error renaming category:', err);
      setError('Failed to rename category. Name may already exist.');
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
        placeholder="Enter new name"
        error={error}
        autoFocus
      />

      <Button
        title="Save Changes"
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
  button: {
    marginTop: 16,
  },
});
