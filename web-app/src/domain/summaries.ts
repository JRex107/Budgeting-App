import type { Transaction, Category } from '../db/database';

export interface MonthSummary {
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

/**
 * Calculate summary totals for a list of transactions
 */
export function calculateMonthSummary(transactions: Transaction[]): MonthSummary {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      income += tx.amountMinor;
    } else {
      expense += tx.amountMinor;
    }
  }

  return {
    income,
    expense,
    net: income - expense,
  };
}

/**
 * Calculate category breakdown for expenses
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  topN: number = 5
): CategoryBreakdown[] {
  // Only include expense transactions
  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense');

  // Sum amounts by category
  const categoryTotals = new Map<number, number>();

  for (const tx of expenseTransactions) {
    const current = categoryTotals.get(tx.categoryId) || 0;
    categoryTotals.set(tx.categoryId, current + tx.amountMinor);
  }

  // Calculate total expenses
  const totalExpense = Array.from(categoryTotals.values()).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Create breakdown array
  const breakdown: CategoryBreakdown[] = [];

  for (const [categoryId, amount] of categoryTotals.entries()) {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      breakdown.push({
        categoryId,
        categoryName: category.name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      });
    }
  }

  // Sort by amount descending
  breakdown.sort((a, b) => b.amount - a.amount);

  // Return top N categories + "Other"
  if (breakdown.length <= topN) {
    return breakdown;
  }

  const topCategories = breakdown.slice(0, topN);
  const otherCategories = breakdown.slice(topN);

  const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0);

  if (otherTotal > 0) {
    topCategories.push({
      categoryId: -1,
      categoryName: 'Other',
      amount: otherTotal,
      percentage: totalExpense > 0 ? (otherTotal / totalExpense) * 100 : 0,
    });
  }

  return topCategories;
}

/**
 * Calculate budget progress for a category
 */
export function calculateBudgetProgress(
  spent: number,
  budgeted: number
): {
  spent: number;
  budgeted: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
} {
  const remaining = budgeted - spent;
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

  return {
    spent,
    budgeted,
    remaining,
    percentage,
    isOverBudget: spent > budgeted,
  };
}
