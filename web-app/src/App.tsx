import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeDatabase } from './db/database';
import { getSettings } from './db/repositories/settingsRepository';
import { seedDefaultCategories } from './db/repositories/categoriesRepository';
import { seedDefaultAccount } from './db/repositories/accountsRepository';

// Pages
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsPage } from './pages/SavingsPage';
import { OverviewPage } from './pages/OverviewPage';
import { SettingsPage } from './pages/SettingsPage';

// Layout
import { AppLayout } from './components/AppLayout';

// Context
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        const settings = await getSettings();

        if (settings) {
          setHasOnboarded(true);
        } else {
          // Seed default data for new users
          await seedDefaultAccount();
          await seedDefaultCategories();
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    init();

    // Theme initialization and listener for system preference changes
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const root = document.documentElement;

      if (savedTheme === 'light') {
        root.setAttribute('data-theme', 'light');
      } else if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        // Auto mode - follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
    };

    // Apply theme on mount
    applyTheme();

    // Listen for system theme changes (only affects auto mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      // Only update if in auto mode
      if (!savedTheme || savedTheme === 'auto') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {!hasOnboarded ? (
            <>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/savings" element={<SavingsPage />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
