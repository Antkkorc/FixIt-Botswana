import React, { createContext, useContext, useState, useMemo } from 'react';
import en from '@/i18n/en.json';
import tn from '@/i18n/tn.json';

const translations = { en, tn };

const LocalizationContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export function LocalizationProvider({ children }) {
  const [locale, setLocale] = useState('en');

  const t = (key) => {
    const parts = key.split('.');
    let val = translations[locale];
    for (const p of parts) {
      if (val && Object.prototype.hasOwnProperty.call(val, p)) {
        val = val[p];
      } else {
        // Fallback to key when missing
        return key;
      }
    }
    return val;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  return useContext(LocalizationContext);
}
