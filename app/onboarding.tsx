import React, { useState } from 'react';
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
import { onboardingSchema } from '@/domain/validation';
import { createSettings } from '@/db/repositories';
import { seedDefaultAccounts } from '@/db/repositories/accountsRepository';
import { seedDefaultCategories } from '@/db/repositories/categoriesRepository';

const CURRENCIES = [
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('GBP');
  const [monthStartDay, setMonthStartDay] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ monthStartDay?: string }>({});

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      // Validate input
      const result = onboardingSchema.safeParse({
        currency: selectedCurrency,
        monthStartDay: parseInt(monthStartDay, 10),
      });

      if (!result.success) {
        const fieldErrors: { monthStartDay?: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0] === 'monthStartDay') {
            fieldErrors.monthStartDay = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      // Save settings
      await createSettings(result.data.currency, result.data.monthStartDay);

      // Seed default accounts and categories
      await seedDefaultAccounts();
      await seedDefaultCategories();

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Budgeting App</Text>
        <Text style={styles.subtitle}>
          Let's set up your preferences to get started
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Your Currency</Text>
        {CURRENCIES.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.option,
              selectedCurrency === currency.code && styles.optionSelected,
            ]}
            onPress={() => setSelectedCurrency(currency.code)}
          >
            <Text
              style={[
                styles.optionText,
                selectedCurrency === currency.code && styles.optionTextSelected,
              ]}
            >
              {currency.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Input
          label="Month Start Day (1-28)"
          value={monthStartDay}
          onChangeText={setMonthStartDay}
          keyboardType="number-pad"
          placeholder="1"
          error={errors.monthStartDay}
        />
        <Text style={styles.hint}>
          Choose which day your budget month starts. Most people use 1 (first of
          the month) or their payday.
        </Text>
      </View>

      <Button
        title="Get Started"
        onPress={handleComplete}
        loading={isLoading}
        style={styles.button}
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
  header: {
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6E6E73',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginBottom: 12,
    backgroundColor: '#F2F2F7',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FF',
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  hint: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
  },
});
