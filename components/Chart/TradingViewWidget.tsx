"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBackward, FaForward } from "react-icons/fa6";

const unsupportedTokens = ["RSTX", "STX"]; // Add other dummy tokens here
const fallbackToken = "USDC"; // Or use "ETH"
interface props {
  TokenA?: string;
  TokenB?: string;
  chartActiveToken?: string;
}
export const TradingViewWidget = (props: props) => {
  const container = useRef<HTMLDivElement | null>(null);
  const swapState = useSwapState();
  const { setChartActiveToken, setChartFlag } = useSwapActions();
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(true);

  const effectiveTokens = useMemo(() => {
    return {
      TokenA: props.TokenA ?? swapState.TokenA,
      TokenB: props.TokenB ?? swapState.TokenB,
      chartActiveToken: props.chartActiveToken ?? swapState.chartActiveToken,
    };
  }, [props, swapState]);

  const getSymbol = (token: string) => {
    const tokenSymbol = token === "WETH" ? "ETH" : token;
    return unsupportedTokens.includes(tokenSymbol)
      ? fallbackToken
      : tokenSymbol;
  };

  const fullSymbol = `${getSymbol(effectiveTokens.chartActiveToken)}USD`;

  // const container = useRef<HTMLDivElement | null>(null);
  // const { TokenA, TokenB, chartActiveToken } = useSwapState();
  // const { setChartActiveToken } = useSwapActions();
  // const { theme } = useTheme();
  // const [loading, setLoading] = useState<boolean>(true);
  // console.log(chartActiveToken);
  // const getSymbol = (token: string) => {
  //   const tokenSymbol = token === "WETH" ? "ETH" : token;
  //   return unsupportedTokens.includes(tokenSymbol)
  //     ? fallbackToken
  //     : tokenSymbol;
  // };

  // const fullSymbol = `${getSymbol(chartActiveToken)}USD`;

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
  }, [
    effectiveTokens.chartActiveToken,
    effectiveTokens.TokenA,
    effectiveTokens.TokenB,
    theme,
  ]);

  return (
    <div className="w-full h-full flex flex-col ">
      {/* <div className="flex py-3 px-4 border-t-[1px] border-x-[1px] border-border bg-forground flex-row gap-2">
        <span
          key={effectiveTokens.TokenA}
          className={`p-2   cursor-pointer transition ${
            effectiveTokens.chartActiveToken === effectiveTokens.TokenA
              ? "bg-primary text-white"
              : "bg-accent text-white border-bordder rounded-none"
          }`}
          onClick={() => setChartActiveToken(effectiveTokens.TokenA)}
        >
          {effectiveTokens.TokenA}
        </span>
        <span
          key={effectiveTokens.TokenB}
          className={`p-2   cursor-pointer transition ${
            effectiveTokens.chartActiveToken === effectiveTokens.TokenB
              ? "bg-primary text-white"
              : "bg-accent text-white border-bordder rounded-none"
          }`}
          onClick={() => setChartActiveToken(effectiveTokens.TokenB)}
        >
          {effectiveTokens.TokenB}
        </span>
      </div> */}
      <div className="flex py-3 px-4 border-t-[1px] border-x-[1px] border-border justify-between w-full bg-forground gap-2">
        <div>
          {[effectiveTokens.TokenA, effectiveTokens.TokenB].map(
            (tokenSymbol) => {
              const isActive = effectiveTokens.chartActiveToken === tokenSymbol;

              return (
                <span
                  key={tokenSymbol}
                  className={`p-2 cursor-pointer transition border-[1px] ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-accent text-lightgray dark:text-white border-border"
                  }`}
                  onClick={() => setChartActiveToken(tokenSymbol)}
                >
                  {tokenSymbol}
                </span>
              );
            }
          )}
        </div>
        <div
          className="lg:hidden"
          onClick={() => setChartFlag(swapState.chartFlag ? false : true)}
        >
          <h1 className="text-ms cursor-pointer flex items-center gap-1 text-title font-medium">
            back to Swap <FaForward />
          </h1>
        </div>
      </div>

      {/* Loader while chart is loading */}
      {loading && (
        <div className="flex items-center h-full  border-x-[1px] border-border border-b-[1px] justify-center ">
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
