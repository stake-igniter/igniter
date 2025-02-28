"use client";

import React from "react";
import { Currency, useCurrency } from "@igniter/ui/context/currency";
import { Button, ButtonGroup } from "@igniter/ui/components/button";

const CurrencySelector: React.FC = () => {
  const { currency, toggleCurrency } = useCurrency();

  const handleCurrencyChange = () => {
    toggleCurrency();
  };

  const activeButton = currency === Currency.POKT ? 0 : 1;

  return (
    <div className="flex items-center justify-center">
      <ButtonGroup activeButton={activeButton}>
        <Button onClick={handleCurrencyChange} className={`min-w-[65px]`}>
          POKT
        </Button>
        <Button onClick={handleCurrencyChange} className={`min-w-[55px]`}>
          USD
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default CurrencySelector;
