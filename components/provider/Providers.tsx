"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";

import { config } from "@/wagmi/config";
import { WalletInit } from "@/services/walletEvents";
import { useTheme } from "next-themes";

const queryClient = new QueryClient();

export const customDarkTheme = darkTheme({
  accentColor: "#12abfc",
  accentColorForeground: "#61c7f2",
  borderRadius: "none",
});

export const customLightTheme = lightTheme({
  accentColor: "#0caaff",
  accentColorForeground: "#ffffff",
  borderRadius: "none",
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme === "dark" ? customDarkTheme : customLightTheme}
          modalSize="compact"
        >
          <WalletInit>{children}</WalletInit>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
