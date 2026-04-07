export const GRAMS_PER_OUNCE = 31.1035;
export const NISAB_GOLD_GRAMS = 85;
export const ZAKAT_RATE = 0.025;

export function calcPricePerGram(usdPerOunce, usdToJod) {
  if (!usdPerOunce || !usdToJod) return 0;
  return (usdPerOunce / GRAMS_PER_OUNCE) * usdToJod;
}

const n = (v) => parseFloat(v) || 0;

function convertFxToJod(entries, fxRates) {
  if (!entries || !fxRates) return 0;
  return entries.reduce((sum, entry) => {
    const total = (parseFloat(entry.cashInHand) || 0) +
                  (parseFloat(entry.savingsBalance) || 0) +
                  (parseFloat(entry.checkingBalance) || 0);
    if (!total || !entry.currency) return sum;
    const jodRate = fxRates['JOD'];
    const currRate = fxRates[entry.currency];
    if (!jodRate || !currRate) return sum;
    return sum + total * (jodRate / currRate);
  }, 0);
}

function calcTotalAssets({ assetValues, goldPricePerGram, silverPricePerGram, fxRates }) {
  const foreignCashJod = convertFxToJod(assetValues.foreignCurrencies, fxRates);
  const karatMultiplier = { '24k': 1, '21k': 21 / 24, '18k': 18 / 24 }[assetValues.goldKarat || '24k'] || 1;
  const goldJod = assetValues.goldInputMode === 'value'
    ? n(assetValues.goldValue)
    : n(assetValues.goldWeight) * goldPricePerGram * karatMultiplier;
  return (
    n(assetValues.cashInHand) +
    n(assetValues.savingsBalance) +
    n(assetValues.checkingBalance) +
    foreignCashJod +
    goldJod +
    (assetValues.silverInputMode === 'value' ? n(assetValues.silverValue) : n(assetValues.silverWeight) * silverPricePerGram) +
    (assetValues.investments || []).reduce((sum, inv) => {
      if (inv.intention === 'trading') return sum + n(inv.marketValue);
      return sum + n(inv.profits) + n(inv.cashShare) + n(inv.receivables);
    }, 0) +
    n(assetValues.businessInventory) +
    n(assetValues.businessCash) +
    n(assetValues.businessReceivables) +
    n(assetValues.loansGiven) +
    n(assetValues.expectedPayments)
  );
}

function calcTotalLiabilities(liabilities) {
  return (
    n(liabilities.personalLoans) +
    n(liabilities.creditCard) +
    n(liabilities.mortgagePayments) +
    n(liabilities.carLoan) +
    n(liabilities.otherDebts)
  );
}

export function calcZakat({ assetValues, liabilities, goldPricePerGram, silverPricePerGram, fxRates }) {
  const totalAssets = calcTotalAssets({ assetValues, goldPricePerGram, silverPricePerGram, fxRates });
  const totalLiabilities = calcTotalLiabilities(liabilities);
  const netWealth = Math.max(0, totalAssets - totalLiabilities);
  const nisabValue = NISAB_GOLD_GRAMS * goldPricePerGram;
  const zakatRequired = nisabValue > 0 && netWealth >= nisabValue;
  const zakatDue = zakatRequired ? netWealth * ZAKAT_RATE : 0;

  return { totalAssets, totalLiabilities, netWealth, nisabValue, nisabStandard: 'gold', zakatRequired, zakatDue };
}

export function fmt(value) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}
