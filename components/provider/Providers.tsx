"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "@/wagmi/config";
import { WalletInit } from "@/services/walletEvents";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletInit>{children}</WalletInit>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
