# Safwa Zakat Calculator – Frontend

React + Vite frontend for the Safwa Islamic Bank Zakat Calculator.  
Guides the user through a 5-step form, calculates their Zakat locally, then sends all data to the backend to be saved.

---

## Stack

- **Framework**: React (Vite)
- **Styling**: CSS (custom)
- **Languages**: Arabic & English (built-in i18n)
- **Live prices**: Gold & silver fetched from external APIs at runtime

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.  
All `/api/*` requests are proxied to the backend at `http://localhost:3001`.

> The backend must be running for submissions to be saved. See `safwaBack/README.md`.

### 3. Build for production
```bash
npm run build
```

---

## Form Steps

| Step | Name              | Description                                          |
|------|-------------------|------------------------------------------------------|
| 1    | Personal Info     | Phone number and account number                      |
| 2    | Asset Categories  | Select which asset types the user owns               |
| 3    | Asset Details     | Enter values for each selected asset                 |
| 4    | Liabilities       | Enter outstanding debts                              |
| 5    | Zakat Summary     | Shows calculation result and saves to backend        |

---

## Project Structure

```
src/
├── pages/
│   └── ZakatCalculator.jsx   # Main page — manages all step state and API call
├── components/
│   ├── StepPersonalInfo.jsx
│   ├── StepAssetSelection.jsx
│   ├── StepAssetDetails.jsx
│   ├── StepLiabilities.jsx
│   ├── StepSummary.jsx
│   ├── LanguageSwitcher.jsx
│   └── ui/
│       ├── InputField.jsx
│       └── StepNavigation.jsx
├── hooks/
│   └── useMetalPrices.js     # Fetches live gold/silver prices and FX rates
├── utils/
│   ├── zakatCalculator.js    # Pure calculation logic (nisab, zakat due)
│   └── validation.js         # Step-level form validation
└── i18n/
    ├── LanguageContext.jsx    # Language provider and useLanguage hook
    ├── en.json
    └── ar.json
```

---

## How Submission Works

When the user clicks **Calculate Zakat** on step 5:

1. Zakat is calculated locally using `calcZakat()` and displayed immediately.
2. All form state is serialised into a JSON payload via `buildPayload()`.
3. The payload is `POST`ed to `/api/users` (proxied to the backend).
4. The backend saves everything to the database in a single transaction.

---

## i18n

The app supports **Arabic** (default) and **English**.  
Translation keys live in `src/i18n/en.json` and `src/i18n/ar.json`.  
The language switcher is always visible in the header.
