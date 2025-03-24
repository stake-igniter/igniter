"use client";

import React, { createContext } from "react";

export enum Currency {
  POKT = "POKT",
  USD = "USD",
}

interface CurrencyContext {
  currency: Currency;
  toggleCurrency: () => void;
}

export const CurrencyContext = createContext<CurrencyContext>({
  currency: Currency.POKT,
  toggleCurrency: () => null,
});

interface CurrencyContextProviderProps {
  children: React.ReactNode;
}

export const CurrencyContextProvider = ({
  children,
}: CurrencyContextProviderProps) => {
  const [currency, setCurrency] = React.useState<Currency>(Currency.POKT);

  const preferredCurrency = React.useMemo(
    () => ({
      toggleCurrency: () => {
        const newCurrency =
          currency === Currency.POKT ? Currency.USD : Currency.POKT;
        setCurrency(newCurrency);
        return newCurrency;
      },
      currency,
    }),
    [currency]
  );

  return (
    <CurrencyContext.Provider value={preferredCurrency}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => React.useContext(CurrencyContext);
