import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components';
import { accountSchema } from '@/domain/validation';
import { createAccount } from '@/db/repositories/accountsRepository';

export default function AddAccountScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Validate input
      const result = accountSchema.safeParse({ name });

      if (!result.success) {
        const fieldErrors: { name?: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0] === 'name') {
            fieldErrors.name = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      // Create account
      await createAccount({ name: result.data.name });

      Alert.alert('Success', 'Account added successfully');
      router.back();
    } catch (error) {
      console.error('Error adding account:', error);
      Alert.alert('Error', 'Failed to add account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Account Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g., Checking, Savings, Cash"
        error={errors.name}
      />

      <Button
        title="Add Account"
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
