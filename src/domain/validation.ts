import { z } from 'zod';

// Onboarding validation
export const onboardingSchema = z.object({
  currency: z.enum(['GBP', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'Please select a currency' }),
  }),
  monthStartDay: z
    .number()
    .min(1, 'Day must be between 1 and 28')
    .max(28, 'Day must be between 1 and 28'),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// Transaction validation
export const transactionSchema = z.object({
  accountId: z.number().min(1, 'Please select an account'),
  categoryId: z.number().min(1, 'Please select a category'),
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Amount is required'),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  merchant: z.string().default(''),
  note: z.string().default(''),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// Account validation
export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50, 'Name too long'),
});

export type AccountInput = z.infer<typeof accountSchema>;

// Budget validation
export const budgetSchema = z.object({
  categoryId: z.number().min(1, 'Invalid category'),
  amount: z.string().min(1, 'Amount is required'),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format'),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
