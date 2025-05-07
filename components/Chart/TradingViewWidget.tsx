"use client";
import { useSwapState } from "@/state/swapStore";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

const unsupportedTokens = ["RSTX", "STX"]; // Add other dummy tokens here
const fallbackToken = "BTC"; // Or use "ETH"

export const TradingViewWidget = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const { TokenA, TokenB } = useSwapState();
  const { theme } = useTheme();
  const [activeToken, setActiveToken] = useState<string>(TokenA);
  const [loading, setLoading] = useState<boolean>(true);

  const getSymbol = (token: string) => {
    const tokenSymbol = token === "WETH" ? "ETH" : token;
    return unsupportedTokens.includes(tokenSymbol)
      ? fallbackToken
      : tokenSymbol;
  };

  const fullSymbol = `${getSymbol(activeToken)}USD`;

  useEffect(() => {
    if (!container.current) return;

    setLoading(true);
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.onload = () => setLoading(false); // Stop loading on successful load
    script.onerror = () => setLoading(false); // Even on error, stop loading

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: fullSymbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: theme,

      style: "1",
      locale: "en",
      support_host: "https://www.tradingview.com",
    });

    container.current.appendChild(script);
  }, [activeToken, theme]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        {[TokenA, TokenB].map((token) => (
          <span
            key={token}
            className={`p-2   cursor-pointer transition ${
              activeToken === token
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-forground text-black dark:text-white"
            }`}
            onClick={() => setActiveToken(token)}
          >
            {token}
          </span>
        ))}
      </div>

      {/* Loader while chart is loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      <div
        className={`tradingview-widget-container transition-opacity duration-500 ${
          loading ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        ref={container}
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: "calc(100% - 32px)", width: "100%" }}
        />
        <div className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/"
            rel="noopener nofollow"
            target="_blank"
          >
            <span className="text-blue-500">
              Track all markets on TradingView
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
