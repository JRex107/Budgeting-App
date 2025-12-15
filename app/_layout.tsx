import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeDatabase } from '@/db/database';

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-transaction" options={{ title: 'Add Transaction', presentation: 'modal' }} />
      <Stack.Screen name="add-account" options={{ title: 'Add Account', presentation: 'modal' }} />
      <Stack.Screen name="add-category" options={{ title: 'Add Category', presentation: 'modal' }} />
      <Stack.Screen name="edit-category" options={{ title: 'Rename Category', presentation: 'modal' }} />
      <Stack.Screen name="manage-categories" options={{ title: 'Manage Categories' }} />
      <Stack.Screen name="paywall" options={{ title: 'Subscription', presentation: 'modal' }} />
    </Stack>
  );
}
