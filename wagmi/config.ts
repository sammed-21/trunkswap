import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, arbitrumSepolia, mainnet, sepolia } from "viem/chains";

export const config = getDefaultConfig({
  appName: "TrunkSwap",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [arbitrumSepolia, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

// export const arbitrumSepoliapublicClient = createPublicClient({
//   chain: arbitrumSepolia,
//   transport: http(),
// });

// export const sepoliaClient = createPublicClient({
//   chain: sepolia,
//   transport: http(),
// });

export const chainMaps: Record<number, any> = {
  1: mainnet,
  42161: arbitrum,
  11155111: sepolia,
};

export const rpcMap: Record<number, string> = {
  1: "https://eth.llamarpc.com",
  42161: "https://arb1.arbitrum.io/rpc",
  421614: "https://sepolia-rollup.arbitrum.io/rpc",
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
};
