import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components';

/**
 * Paywall screen - placeholder for future subscription implementation
 * In v1, this screen should never be shown since hasAccess is always true
 */
export default function PaywallScreen() {
  const router = useRouter();

  const handleRestorePurchases = () => {
    // TODO: Implement restore purchases with RevenueCat or similar
    console.log('Restore purchases requested');
  };

  const handleSubscribe = () => {
    // TODO: Implement subscription purchase
    console.log('Subscribe requested');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Access Required</Text>
      <Text style={styles.description}>
        Subscribe to unlock full access to all budgeting features.
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Subscribe" onPress={handleSubscribe} style={styles.button} />
        <Button
          title="Restore Purchases"
          onPress={handleRestorePurchases}
          variant="secondary"
          style={styles.button}
        />
      </View>

      <Text style={styles.note}>
        This is a placeholder screen. In v1, all users have free access.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1C1C1E',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6E6E73',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  note: {
    marginTop: 24,
    fontSize: 12,
    textAlign: 'center',
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
