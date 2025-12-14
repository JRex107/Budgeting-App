import { create } from 'zustand';

interface EntitlementsState {
  hasAccess: boolean;
  checkEntitlements: () => Promise<void>;
}

/**
 * Entitlements store
 * In v1, always returns hasAccess: true
 * Later, this can be updated to check in-app purchase status
 */
export const useEntitlements = create<EntitlementsState>((set) => ({
  hasAccess: true, // V1: Always allow access

  checkEntitlements: async () => {
    // V1: No-op, always has access
    // Later: Check RevenueCat or other IAP provider
    set({ hasAccess: true });
  },
}));

/**
 * Get entitlements without using the hook
 * Useful for non-component code
 */
export function getEntitlements(): { hasAccess: boolean } {
  return { hasAccess: true }; // V1: Always allow access
}
