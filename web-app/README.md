# Budgeting App - Web Version

A minimalist, offline-first budgeting Progressive Web App (PWA).

## Features

- **Offline-first**: Works without internet using IndexedDB
- **PWA**: Installable on iOS and Android home screens
- **No account needed**: All data stored locally on device
- **Custom month boundaries**: Set your budget month to start on any day (1-28)
- **Dashboard**: View income, expenses, and net for current month
- **Category tracking**: See spending breakdown by category
- **Responsive**: Works on desktop and mobile

## Local Development

```bash
cd web-app
npm install
npm run dev
```

Visit `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Deployment Options

### Option 1: Vercel (Recommended - FREE)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd web-app
   vercel
   ```

3. Follow the prompts. Your app will be live at `https://your-app.vercel.app`

### Option 2: Netlify (FREE)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```bash
   cd web-app
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. Your app will be live at `https://your-app.netlify.app`

### Option 3: GitHub Pages (FREE)

1. Build the app:
   ```bash
   npm run build
   ```

2. Push the `dist` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings
4. Your app will be at `https://yourusername.github.io/repo-name`

## Installing as PWA on iPhone

Once deployed:

1. Open the deployed URL in Safari on iPhone
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Budget" and tap "Add"
5. The app icon will appear on your home screen
6. Launch it like any other app - works offline!

## Installing as PWA on Android

1. Open the deployed URL in Chrome on Android
2. Tap the menu (three dots)
3. Tap "Add to Home screen" or "Install app"
4. The app will be installed and can be launched from your home screen

## Cost

**$0 per month**

All deployment options listed are completely free. No backend, no database hosting, no recurring costs.
