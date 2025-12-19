import { useState } from 'react';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { createSettings } from '../db/repositories/settingsRepository';
import { seedDefaultCategories } from '../db/repositories/categoriesRepository';
import { seedDefaultAccount } from '../db/repositories/accountsRepository';

export function OnboardingPage() {
  const [currency, setCurrency] = useState('USD');
  const [monthStartDay, setMonthStartDay] = useState('1');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const day = parseInt(monthStartDay, 10);

    if (isNaN(day) || day < 1 || day > 28) {
      setError('Month start day must be between 1 and 28');
      return;
    }

    try {
      // Create settings
      await createSettings(currency, day);

      // Seed default data
      await seedDefaultAccount();
      await seedDefaultCategories();

      window.location.reload(); // Refresh to update onboarding status
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome</h1>
      </div>
      <div className="page-content">
        <Card>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Setup Your Budget</h2>
          
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="USD"
          />
          
          <Input
            label="Month Start Day (1-28)"
            type="number"
            value={monthStartDay}
            onChange={(e) => setMonthStartDay(e.target.value)}
            placeholder="1"
            min="1"
            max="28"
            error={error}
          />

          <p style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '20px' }}>
            Set the day your budget month starts (e.g., if you get paid on the 15th, use 15).
          </p>

          <Button title="Get Started" onPress={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
