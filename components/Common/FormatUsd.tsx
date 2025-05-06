import React from "react";

export const FormatUsd = (value: number): JSX.Element => {
  if (isNaN(value))
    return (
      <div className="font-medium text-lg flex items-baseline select-none text-gray-500 dark:text-slate-400 ">
        $ 0.<span className="text-sm font-semibold">00</span>
      </div>
    );

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  const [whole, decimal] = formatted.split(".");

  return (
    <div className="font-medium text-lg flex items-baseline select-none text-gray-500 dark:text-slate-400 ">
      {whole}.<span className="text-sm font-semibold">{decimal}</span>
    </div>
  );
};
