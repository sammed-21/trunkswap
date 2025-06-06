"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBackward, FaForward } from "react-icons/fa6";
import { Tabs, TabsList } from "../ui/tabs";

const unsupportedTokens = ["RSTX", "STX"]; // Add other dummy tokens here
const fallbackToken = "USDC"; // Or use "ETH"
interface props {
  token0?: string;
  token1?: string;
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
      token0: props.token0 ?? swapState.token0,
      token1: props.token1 ?? swapState.token1,
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
  // const { token0, token1, chartActiveToken } = useSwapState();
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
    effectiveTokens.token0,
    effectiveTokens.token1,
    theme,
  ]);

  return (
    <div className="w-full h-full flex flex-col ">
      {/* <div className="flex py-3 px-4 border-t-[1px] border-x-[1px] border-border bg-forground flex-row gap-2">
        <span
          key={effectiveTokens.token0}
          className={`p-2   cursor-pointer transition ${
            effectiveTokens.chartActiveToken === effectiveTokens.token0
              ? "bg-primary text-white"
              : "bg-accent text-white border-bordder rounded-lg"
          }`}
          onClick={() => setChartActiveToken(effectiveTokens.token0)}
        >
          {effectiveTokens.token0}
        </span>
        <span
          key={effectiveTokens.token1}
          className={`p-2   cursor-pointer transition ${
            effectiveTokens.chartActiveToken === effectiveTokens.token1
              ? "bg-primary text-white"
              : "bg-accent text-white border-bordder rounded-lg"
          }`}
          onClick={() => setChartActiveToken(effectiveTokens.token1)}
        >
          {effectiveTokens.token1}
        </span>
      </div> */}
      <div className="flex py-3 px-4 border-t-[1px] border-x-[1px] rounded-t-lg border-border justify-between w-full bg-forground gap-2">
        <Tabs>
          <TabsList className="grid w-full grid-cols-2">
            {[effectiveTokens.token0, effectiveTokens.token1].map(
              (tokenSymbol) => {
                const isActive =
                  effectiveTokens.chartActiveToken === tokenSymbol;

                return (
                  <span
                    key={tokenSymbol}
                    className={`px-4 col-span-1 cursor-pointer transition rounded-lg ${
                      isActive
                        ? "bg-background border-primary"
                        : "bg-accent border-border"
                    }`}
                    onClick={() => setChartActiveToken(tokenSymbol)}
                  >
                    {tokenSymbol}
                  </span>
                );
              }
            )}
          </TabsList>
        </Tabs>
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
