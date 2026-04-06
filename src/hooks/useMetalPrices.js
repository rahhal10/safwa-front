import { useState, useEffect } from 'react';
import { calcPricePerGram } from '../utils/zakatCalculator';

const FALLBACK_USD_TO_JOD = 0.709;
const CACHE_KEY = 'safwa_metal_prices_v2';
const CACHE_TTL_MS = 30 * 60 * 1000;

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) return cached;
  } catch (_) {}
  return null;
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch (_) {}
}

export function useMetalPrices() {
  const [state, setState] = useState({
    goldUsdPerOunce: null,
    silverUsdPerOunce: null,
    usdToJod: null,
    goldJodPerGram: null,
    silverJodPerGram: null,
    fxRates: null,
    lastUpdated: null,
    loading: true,
    error: null,
    usingCache: false,
    usingFallbackRate: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      const cached = loadCache();

      try {
        const [goldRes, silverRes, fxRes] = await Promise.allSettled([
          fetch('https://api.gold-api.com/price/XAU').then((r) => r.json()),
          fetch('https://api.gold-api.com/price/XAG').then((r) => r.json()),
          fetch('https://open.er-api.com/v6/latest/USD').then((r) => r.json()),
        ]);

        if (cancelled) return;

        const goldUsd = goldRes.status === 'fulfilled' ? Number(goldRes.value?.price) : null;
        const silverUsd = silverRes.status === 'fulfilled' ? Number(silverRes.value?.price) : null;
        const rawRates = fxRes.status === 'fulfilled' ? fxRes.value?.rates : null;
        const usdToJod = rawRates ? Number(rawRates.JOD) : null;

        const usingFallbackRate = !usdToJod || isNaN(usdToJod);
        const effectiveRate = usingFallbackRate ? FALLBACK_USD_TO_JOD : usdToJod;
        const fxRates = rawRates || { USD: 1, JOD: FALLBACK_USD_TO_JOD };

        if (goldUsd && silverUsd && !isNaN(goldUsd) && !isNaN(silverUsd)) {
          const goldJodPerGram = calcPricePerGram(goldUsd, effectiveRate);
          const silverJodPerGram = calcPricePerGram(silverUsd, effectiveRate);
          const data = {
            goldUsdPerOunce: goldUsd,
            silverUsdPerOunce: silverUsd,
            usdToJod: effectiveRate,
            goldJodPerGram,
            silverJodPerGram,
            fxRates,
            lastUpdated: new Date().toISOString(),
            loading: false,
            error: null,
            usingCache: false,
            usingFallbackRate,
          };
          saveCache(data);
          setState(data);
        } else if (cached) {
          setState({ ...cached, loading: false, usingCache: true, error: null });
        } else {
          setState((prev) => ({ ...prev, loading: false, error: 'priceLoadError' }));
        }
      } catch (_) {
        if (cancelled) return;
        if (cached) {
          setState({ ...cached, loading: false, usingCache: true, error: null });
        } else {
          setState((prev) => ({ ...prev, loading: false, error: 'priceLoadError' }));
        }
      }
    }

    fetchPrices();
    return () => { cancelled = true; };
  }, []);

  return state;
}
