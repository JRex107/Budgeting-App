# Budgeting App

A minimalist, offline-first budgeting app for iOS and Android built with React Native and Expo.

## Features (v1)

- **Onboarding**: Set currency (GBP/USD/EUR) and custom month start day (1-28)
- **Dashboard**: Monthly income, expenses, and net totals with category breakdown
- **Transactions**: Add, view, filter, and search transactions
- **Budgets**: Set monthly budgets per category with progress tracking
- **Overview**: View 6-month financial trends
- **Offline-First**: All data stored locally with SQLite
- **No Account Required**: Fully functional without any login or sync

## Tech Stack

- **Framework**: Expo + TypeScript
- **Navigation**: expo-router (file-based routing)
- **Database**: SQLite via expo-sqlite
- **State Management**: Zustand
- **Validation**: Zod
- **UI**: React Native core components + custom reusable components

## Project Structure

```
budgeting-app/
├── app/                      # Routes (expo-router)
│   ├── (tabs)/              # Main tab navigation
│   │   ├── index.tsx        # Dashboard
│   │   ├── transactions.tsx # Transactions list
│   │   ├── budgets.tsx      # Budget management
│   │   └── overview.tsx     # 6-month overview
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Entry point
│   ├── onboarding.tsx       # First-time setup
│   ├── add-transaction.tsx  # Add transaction modal
│   ├── add-account.tsx      # Add account modal
│   └── paywall.tsx          # Subscription placeholder
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ProgressBar.tsx
│   ├── db/                  # Database layer
│   │   ├── database.ts      # SQLite initialization
│   │   ├── types.ts         # Database types
│   │   └── repositories/    # Data access layer
│   ├── domain/              # Business logic
│   │   ├── money.ts         # Money formatting/parsing
│   │   ├── monthCalculations.ts # Month boundary logic
│   │   ├── summaries.ts     # Financial calculations
│   │   └── validation.ts    # Zod schemas
│   └── state/               # Zustand stores
│       └── useEntitlements.ts # Subscription state (v1: always true)
├── assets/                  # Images and icons
├── app.json                 # Expo configuration
├── package.json
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS: macOS with Xcode
- For Android: Android Studio with SDK

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Budgeting-App
```

2. Install dependencies:
```bash
npm install
```

3. Add app assets:
   - Place `icon.png` (1024x1024) in `/assets`
   - Place `splash.png` in `/assets`
   - Place `adaptive-icon.png` (1024x1024) in `/assets`

   (Expo will use default placeholders if these are missing during development)

### Running the App

#### Development Mode

Start the Expo development server:
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

#### Run on iOS:
```bash
npm run ios
```

#### Run on Android:
```bash
npm run android
```

## Database Schema

### Tables

**settings**
- `id` (always 1)
- `currency` (GBP/USD/EUR)
- `monthStartDay` (1-28)

**accounts**
- `id`
- `name`

**categories**
- `id`
- `name`
- `isIncomeCategory` (boolean)

**transactions**
- `id`
- `accountId`
- `categoryId`
- `type` ('income' | 'expense')
- `amountMinor` (integer, pence/cents)
- `dateISO` (YYYY-MM-DD)
- `merchant`
- `note`

**budgets**
- `id`
- `monthKey` (YYYY-MM)
- `categoryId`
- `amountMinor` (integer, pence/cents)

### Default Seed Data

**Accounts**:
- Cash
- Checking
- Savings

**Expense Categories**:
- Groceries
- Dining
- Transport
- Entertainment
- Shopping
- Bills
- Healthcare
- Other

**Income Categories**:
- Salary
- Freelance
- Investment
- Other Income

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Build for Android:
```bash
eas build --platform android
```

### Submit to App Stores

#### iOS App Store

```bash
eas submit --platform ios
```

Prerequisites:
- Apple Developer account
- App Store Connect app created
- Provisioning profiles configured

#### Google Play Store

```bash
eas submit --platform android
```

Prerequisites:
- Google Play Developer account
- Service account JSON key
- App created in Play Console

## Key Features Explained

### Month Boundaries

The app respects custom month start days. For example, if `monthStartDay = 15`:
- A "month" runs from the 15th of one calendar month to the 14th of the next
- Date 2024-01-14 belongs to month "2023-12"
- Date 2024-01-15 belongs to month "2024-01"

### Money Storage

All monetary amounts are stored as integers in minor units (pence/cents) to avoid floating-point precision issues:
- £10.50 is stored as 1050
- $123.45 is stored as 12345

### Subscription Readiness (v1: Not Enabled)

The app includes an entitlements system that's ready for future subscription features:
- `getEntitlements()` currently returns `{ hasAccess: true }`
- Paywall screen exists but is never shown in v1
- To add subscriptions later:
  - Integrate RevenueCat or similar IAP provider
  - Update `useEntitlements.ts` to check actual purchase status
  - No other code changes needed

## Development Notes

### Type Safety

The project uses strict TypeScript. All database models have typed interfaces in `src/db/types.ts`.

### Validation

All user inputs are validated using Zod schemas in `src/domain/validation.ts`.

### State Management

Zustand is used minimally:
- `useEntitlements`: Subscription state (future use)

Most state is local component state or loaded directly from SQLite.

### Testing

To add tests:
```bash
npm install --save-dev jest @testing-library/react-native
```

Run tests:
```bash
npm test
```

## Troubleshooting

### Database Issues

Reset the database by uninstalling and reinstalling the app, or use:
```typescript
import { resetDatabase } from '@/db/database';
await resetDatabase();
```

### iOS Build Issues

- Ensure Xcode is up to date
- Clear derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Clean build folder in Xcode

### Android Build Issues

- Ensure Java 17 is installed
- Clear Gradle cache: `cd android && ./gradlew clean`

## Future Enhancements (Not in v1)

These features are intentionally excluded from v1 but could be added later:
- AI-powered insights
- Bank linking / account sync
- Import/export (CSV, OFX)
- Receipt scanning
- Automated rules
- Recurring transactions
- Financial goals
- Cloud sync
- Multi-device support
- Subscription paywall (infrastructure ready)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
