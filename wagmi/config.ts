import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";
import arbitrum_sepolia from "@/public/chains/arbitrum-sepolia.svg";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

export const config = getDefaultConfig({
  appName: "TrunkSwap",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const chainMaps: Record<number, any> = {
  1: mainnet,
  42161: arbitrum,
  11155111: sepolia,
};

export const rpcMap: Record<number, string> = {
  1: "https://eth.llamarpc.com",
  42161: "https://arb1.arbitrum.io/rpc",
  421614: "https://arbitrum-sepolia-rpc.publicnode.com",
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
};

// lib/chainIcons.ts
export const chainIcons: Record<number, string | StaticImport> = {
  1: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
  137: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg",
  42161: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg",
  421614: arbitrum_sepolia, // Local file
  11155111: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
};
