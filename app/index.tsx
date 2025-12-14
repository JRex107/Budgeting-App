import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getSettings } from '@/db/repositories/settingsRepository';
import { useEntitlements } from '@/state/useEntitlements';

export default function Index() {
  const router = useRouter();
  const { hasAccess } = useEntitlements();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Check if user has completed onboarding
        const settings = await getSettings();

        // Check entitlements
        if (!hasAccess) {
          router.replace('/paywall');
          return;
        }

        if (settings) {
          // Onboarding complete, go to main app
          router.replace('/(tabs)');
        } else {
          // Need to complete onboarding
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        // Default to onboarding if error
        router.replace('/onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [hasAccess]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
