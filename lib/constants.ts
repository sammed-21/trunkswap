import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { addressess } from "@/address";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";
import { ethers } from "ethers";
import { Address } from "viem";
import STX_IMAGE from "@/public/tokens/stx.svg";
import RSTX_IMAGE from "@/public/tokens/rstx.svg";

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

export const MAGIC_CALLDATA_STRING = "f".repeat(130); // used when signing the eip712 message

export const AFFILIATE_FEE = 100; // 1% affiliate fee. Denoted in Bps.
export const FEE_RECIPIENT = "0x75A94931B81d81C7a62b76DC0FcFAC77FbE1e917"; // The ETH address that should receive affiliate fees

export const MAINNET_EXCHANGE_PROXY =
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

export const MAX_ALLOWANCE =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935n";

interface Token {
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
}

export const fallbackUrls: Record<number, string> = {
  421614: "https://sepolia-rollup.arbitrum.io/rpc",
  1: "https://eth-mainnet.public.blastapi.io", // Ethereum Mainnet
  5: "https://eth-goerli.public.blastapi.io", // Goerli Testnet
  137: "https://polygon-rpc.com", // Polygon
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
  // Add other chains as needed
};
export const FactoryAddressChainId = 421614;
export const FACTORY_ADDRESS = (chainId: any) =>
  addressess[getNetworkNameUsingChainId((chainId = FactoryAddressChainId))]
    .FACTORY_ADDRESS;

export const DefaultSlippage = "5.5";

export const MAINNET_TOKENS: Token[] = [
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
    chainId: 1,
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    logoURI:
      "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/weth.svg",
  },
  {
    chainId: 1,
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    logoURI:
      "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/usdc.svg",
  },
  {
    chainId: 1,
    name: "Dai - PoS",
    symbol: "DAI",
    decimals: 18,
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    logoURI:
      "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/dai.svg",
  },
  {
    chainId: 1,
    name: "FLOKI",
    symbol: "FLOKI",
    decimals: 9,
    address: "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/c37119334a24f9933f373c6cc028a5bdbad2ecb4/blockchains/ethereum/assets/0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E/logo.png",
  },
];

export const MAINNET_TOKENS_BY_SYMBOL: Record<string, Token> = {
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
  // dai: {
  //   chainId: 1,
  //   name: "Dai - PoS",
  //   symbol: "DAI",
  //   decimals: 18,
  //   address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  //   logoURI:
  //     "https://raw.githubusercontent.com/maticnetwork/polygon-token-assets/main/assets/tokenAssets/dai.svg",
  // },
  // floki: {
  //   chainId: 1,
  //   name: "FLOKI",
  //   symbol: "FLOKI",
  //   decimals: 9,
  //   address: "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e",
  //   logoURI:
  //     "https://raw.githubusercontent.com/trustwallet/assets/c37119334a24f9933f373c6cc028a5bdbad2ecb4/blockchains/ethereum/assets/0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E/logo.png",
  // },
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
export const defaultChainId = 421614;
export const DEFAULT_BUY_TOKEN = (chainId: number) => {
  if (chainId == 1) {
    return "weth";
  } else if (chainId == 421614) {
    return "rstx";
  } else {
    return "weth";
  }
};

export const DEFAULT_SELL_TOKEN = (chainId: number) => {
  if (chainId == 1) {
    return "weth";
  } else if (chainId == 421614) {
    return "stx";
  } else {
    return "weth";
  }
};
