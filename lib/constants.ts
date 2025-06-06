import { addressess } from "@/address";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";
import { Address } from "viem";
import STX_IMAGE from "@/public/tokens/stx.svg";
import RSTX_IMAGE from "@/public/tokens/rstx.svg";
import USDC from "@/public/tokens/usdc.svg";
import USDT from "@/public/tokens/usdt.svg";
import WETH from "@/public/tokens/weth.svg";
import { Token } from "./types";
import { ethers } from "ethers";

const TEST_NET = process.env.NEXT_PUBLIC_TESTNET;
const TEST_CHAINID = process.env.NEXT_PUBLIC_TEST_CHAINID;

export const defaultChainId: number = 421614;

export const DEFAULT_BUY_TOKEN = (chainId: number): string => {
  return "weth"; // return lowercase
};

export const DEFAULT_SELL_TOKEN = (chainId: number): string => {
  return "usdc"; // for example
};

export const isETH = (token: any) =>
  !token?.address ||
  token?.isNative ||
  token.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // standard ETH pseudo-address

export const fallbackUrls: Record<number, string> = {
  421614: "https://arbitrum-sepolia-rpc.publicnode.com",
  1: "https://eth-mainnet.public.blastapi.io", // Ethereum Mainnet
  5: "https://eth-goerli.public.blastapi.io", // Goerli Testnet
  137: "https://polygon-rpc.com", // Polygon
  31337: "http://127.0.0.1:8545",
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
  // Add other chains as needed
};

export const FACTORY_ADDRESS = (chainId: number): string => {
  return addressess[getNetworkNameUsingChainId(chainId)].FACTORY_ADDRESS;
};

export const ROUTER_ADDRESS = (chainId: number): string => {
  return addressess[getNetworkNameUsingChainId(chainId)].ROUTER_ADDRESS;
};

export const WETH_ADDRESS = (chainId: number): string => {
  return addressess[getNetworkNameUsingChainId(chainId)].WETH_ADDRESS;
};

export const isWETHAddress = (
  tokenAddress: string,
  chainId: number
): boolean => {
  if (!tokenAddress || !chainId) return false;
  const wethAddress =
    addressess[getNetworkNameUsingChainId(chainId)].WETH_ADDRESS;
  return tokenAddress.toLowerCase() === wethAddress.toLowerCase();
};

export const DefaultSlippage = "5.5";

export const MAINNET_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // or "native"
    chainId: 421614,
    decimals: 18,
    isNative: true,
  },
  {
    chainId: 421614,
    name: "STX Coin",
    symbol: "STX",
    decimals: 18,
    address: "0x7dE5CEdca10d8b851aD55Be6434c39a86674bb54",
    logoURI: STX_IMAGE,
  },
  {
    chainId: 421614,
    name: "RSTX Coin",
    symbol: "RSTX",
    decimals: 18,
    address: "0x2BCb93F7D8884410845fa1F8B8Df5df820673be3",
    logoURI: RSTX_IMAGE,
  },
  {
    chainId: 421614,
    name: "USDC Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    logoURI: USDC,
  },
  {
    chainId: 421614,
    name: "wrapped ETH",
    symbol: "WETH",
    decimals: 18,
    address: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
    logoURI: WETH,
  },
  // -------------------- Localhost (31337) Tokens --------------------
  {
    chainId: 31337,
    name: "DAI Stablecoin",
    symbol: "DAI",
    decimals: 18,
    address: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
    logoURI: "tokens/dai.svg", // You must import or define this logo
  },
  {
    chainId: 31337,
    name: "USDT Token",
    symbol: "USDT",
    decimals: 6,
    address: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
    logoURI: USDT, // You must import or define this logo
  },
  {
    chainId: 31337,
    name: "USDC Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
    logoURI: USDC, // You can reuse the same USDC logo
  },
  {
    chainId: 31337,
    name: "Wrapped ETH",
    symbol: "WETH",
    decimals: 18,
    address: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
    logoURI: WETH, // You can reuse the same WETH logo
  },
];

export const TOKENS_BY_CHAIN_AND_SYMBOL: Record<
  number,
  Record<string, Token>
> = {
  421614: {
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // or "native"
      chainId: 421614,
      decimals: 18,
      isNative: true,
    },
    stx: {
      chainId: 421614,
      name: "STX Coin",
      symbol: "STX",
      decimals: 18,
      address: "0x7dE5CEdca10d8b851aD55Be6434c39a86674bb54",
      logoURI: STX_IMAGE,
    },
    rstx: {
      chainId: 421614,
      name: "RSTX Coin",
      symbol: "RSTX",
      decimals: 18,
      address: "0x2BCb93F7D8884410845fa1F8B8Df5df820673be3",
      logoURI: RSTX_IMAGE,
    },
    usdc: {
      chainId: 421614,
      name: "USDC Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      logoURI: USDC,
    },
    weth: {
      chainId: 421614,
      name: "Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
      address: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
      logoURI: WETH,
    },
  },
  31337: {
    dai: {
      chainId: 31337,
      name: "DAI Stablecoin",
      symbol: "DAI",
      decimals: 18,
      address: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
      logoURI: "/tokens/dai.svg",
    },
    usdt: {
      chainId: 31337,
      name: "USDT Token",
      symbol: "USDT",
      decimals: 6,
      address: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
      logoURI: USDT,
    },
    usdc: {
      chainId: 31337,
      name: "USDC Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
      logoURI: USDC,
    },
    weth: {
      chainId: 31337,
      name: "Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
      address: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
      logoURI: WETH,
    },
  },
};

export const MAINNET_TOKENS_BY_ADDRESS: Record<string, Token> = {
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
    chainId: 1,
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    logoURI:
      "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/weth.svg",
  },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    chainId: 1,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    logoURI:
      "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/usdc.svg",
  },
  "0x6b175474e89094c44da98b954eedeac495271d0f": {
    chainId: 1,
    name: "Dai - PoS",
    symbol: "DAI",
    decimals: 18,
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    logoURI:
      "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/dai.svg",
  },
  "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e": {
    chainId: 1,
    name: "FLOKI",
    symbol: "FLOKI",
    decimals: 9,
    address: "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/c37119334a24f9933f373c6cc028a5bdbad2ecb4/blockchains/ethereum/assets/0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E/logo.png",
  },
};
