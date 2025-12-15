import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '@/components';
import { resetDatabase } from '@/db/database';

export default function SettingsScreen() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete ALL data including transactions, budgets, categories, and accounts. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              await resetDatabase();
              Alert.alert(
                'Reset Complete',
                'All data has been cleared. The app will restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/onboarding');
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error resetting database:', error);
              Alert.alert('Error', 'Failed to reset the app. Please try again.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>Expo SDK 54</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Text style={styles.description}>
          Rename or delete your custom budget categories.
        </Text>
        <Button
          title="Manage Categories"
          onPress={() => router.push('/manage-categories')}
          variant="secondary"
          style={styles.manageButton}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.description}>
          Reset the app to clear all your data and start fresh. This will delete:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• All transactions</Text>
          <Text style={styles.bullet}>• All budgets</Text>
          <Text style={styles.bullet}>• Custom categories and accounts</Text>
          <Text style={styles.bullet}>• App settings</Text>
        </View>
        <Button
          title="Reset App"
          onPress={handleResetApp}
          variant="danger"
          loading={isResetting}
          style={styles.resetButton}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          A minimalist budgeting app for iOS and Android. Offline-first with no
          account required.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6E6E73',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  description: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 20,
  },
  bullet: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 24,
    paddingLeft: 8,
  },
  manageButton: {
    marginTop: 8,
  },
  resetButton: {
    marginTop: 8,
  },
});
