export const GRAMS_PER_OUNCE = 31.1035;
export const NISAB_SILVER_GRAMS = 595;
export const NISAB_GOLD_GRAMS = 85;
export const ZAKAT_RATE = 0.025;

export function calcPricePerGram(usdPerOunce, usdToJod) {
  if (!usdPerOunce || !usdToJod) return 0;
  return (usdPerOunce / GRAMS_PER_OUNCE) * usdToJod;
}

export function calcNisab(silverPricePerGram) {
  return NISAB_SILVER_GRAMS * silverPricePerGram;
}

export function calcNisabByStandard(standard, goldPricePerGram, silverPricePerGram) {
  if (standard === 'gold') return NISAB_GOLD_GRAMS * goldPricePerGram;
  return NISAB_SILVER_GRAMS * silverPricePerGram;
}

const n = (v) => parseFloat(v) || 0;

export function calcTotalAssets({ assetValues, goldPricePerGram, silverPricePerGram }) {
  return (
    n(assetValues.cashInHand) +
    n(assetValues.savingsBalance) +
    n(assetValues.checkingBalance) +
    n(assetValues.goldWeight) * goldPricePerGram +
    n(assetValues.silverWeight) * silverPricePerGram +
    n(assetValues.stocksValue) +
    n(assetValues.fundsValue) +
    n(assetValues.businessInventory) +
    n(assetValues.businessCash) +
    n(assetValues.amountOwed)
  );
}

export function calcTotalLiabilities(liabilities) {
  return (
    n(liabilities.personalLoans) +
    n(liabilities.creditCard) +
    n(liabilities.mortgagePayments) +
    n(liabilities.carLoan) +
    n(liabilities.otherDebts)
  );
}

export function calcZakat({ assetValues, liabilities, goldPricePerGram, silverPricePerGram, nisabStandard = 'silver' }) {
  const totalAssets = calcTotalAssets({ assetValues, goldPricePerGram, silverPricePerGram });
  const totalLiabilities = calcTotalLiabilities(liabilities);
  const netWealth = Math.max(0, totalAssets - totalLiabilities);
  const nisabValue = calcNisabByStandard(nisabStandard, goldPricePerGram, silverPricePerGram);
  const zakatRequired = nisabValue > 0 && netWealth >= nisabValue;
  const zakatDue = zakatRequired ? netWealth * ZAKAT_RATE : 0;

  return { totalAssets, totalLiabilities, netWealth, nisabValue, nisabStandard, zakatRequired, zakatDue };
}

export function fmt(value) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}
