import { ethers, Contract } from "ethers";

export type Symbol = "ETH" | "WETH" | "USDC" | "STX" | "RSTX";

interface PriceFeedsByChain {
  [chainId: number]: {
    [symbol: string]: string; // Mapping from 'ETH_USD', 'USDC_USD' => address
  };
}

interface Prices {
  ETH_USD: number;
  USDC_USD: number;
  STX_USD: number;
  RSTX_USD: number;
}

const PRICE_FEED_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// 👇 Add feeds per chain
const CHAINLINK_FEEDS: PriceFeedsByChain = {
  421614: {
    ETH_USD: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
    USDC_USD: "0x0153002d20B96532C639313c2d54c3dA09109309",
  },
  // 84532: {
  //   ETH_USD: "0xBaseFeedAddressForETHUSD",
  //   USDC_USD: "0xBaseFeedAddressForUSDCUSD"
  // }
};

let feeds: Record<string, Contract> = {};

const DEFAULT_PRICES: Record<string, number> = {
  STX_USD: 1.0, // Assuming STX is a stablecoin at $1
  RSTX_USD: 1.0, // Assuming rSTX is also pegged at $1
};
let lastUpdated = 0;
const updateInterval = 6000; // 1 min
let updatePromise: Promise<Prices> | null = null;

let prices: Prices = {
  ETH_USD: 0,
  USDC_USD: 0,
  STX_USD: DEFAULT_PRICES.STX_USD,
  RSTX_USD: DEFAULT_PRICES.RSTX_USD,
};
export const initializePriceFeed = async (
  chainId: number,
  provider: ethers.Provider
) => {
  if (!provider) return;

  if (!(chainId in CHAINLINK_FEEDS)) {
    console.warn(`No Chainlink feeds configured for chainId ${chainId}`);
    return;
  }

  const chainFeeds = CHAINLINK_FEEDS[chainId];

  // Initialize contract instances
  feeds = Object.entries(chainFeeds).reduce((acc, [key, address]) => {
    try {
      acc[key] = new Contract(address, PRICE_FEED_ABI, provider);
    } catch (error) {
      console.error(`Failed to initialize price feed for ${key}:`, error);
    }
    return acc;
  }, {} as Record<string, Contract>);
  prices.STX_USD = DEFAULT_PRICES.STX_USD;
  prices.RSTX_USD = DEFAULT_PRICES.RSTX_USD;

  await updatePrices();
};

export const updatePrices = async (): Promise<Prices> => {
  const now = Date.now();

  // Return cached prices if updated recently
  if (now - lastUpdated < updateInterval) return prices;

  // If there's already an update in progress, return that promise
  if (updatePromise) return updatePromise;

  // Start a new update
  updatePromise = (async () => {
    if (!feeds || Object.keys(feeds).length === 0) return prices;

    try {
      const pricePromises = Object.entries(feeds).map(
        async ([key, contract]) => {
          try {
            const [, answer, , updatedAt]: any =
              await contract.latestRoundData();
            const decimals: number = await contract.decimals();
            const price = parseFloat(ethers.formatUnits(answer, decimals));

            const updatedAtMs = Number(updatedAt) * 1000;
            if (now - updatedAtMs > 86400000) {
              console.warn(
                `${key} price data is stale (more than 24 hours old)!`
              );
            }

            return { key, price };
          } catch (error) {
            console.error(`Failed to fetch price for ${key}:`, error);
            return { key, price: prices[key as keyof Prices] || 0 };
          }
        }
      );

      const updatedPrices = await Promise.allSettled(pricePromises);

      updatedPrices.forEach((result) => {
        if (result.status === "fulfilled") {
          const { key, price } = result.value;
          prices[key as keyof Prices] = price;
        }
      });

      lastUpdated = now;
      return { ...prices };
    } catch (error) {
      console.error("Failed to update prices:", error);
      return prices;
    } finally {
      updatePromise = null;
    }
  })();

  return updatePromise;
};

/**
 * Get USD value for a given token amount
 * @param amount The token amount (string or number)
 * @param symbol The token symbol
 * @param forceUpdate If true, forces a price update before calculating
 * @returns The USD value of the tokens
 */
export const getUSDValue = async (
  amount: number | string,
  symbol: Symbol | string,
  forceUpdate = false
): Promise<number> => {
  if (!amount) return 0;

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 0;

  // Force update prices if requested or if we don't have prices yet
  if (forceUpdate || prices.ETH_USD === 0 || prices.USDC_USD === 0) {
    await updatePrices();
  }

  switch (symbol.toUpperCase() as Symbol) {
    case "ETH":
    case "WETH":
      return numAmount * prices.ETH_USD;
    case "USDC":
      return numAmount * prices.USDC_USD;

    case "STX":
      return numAmount * prices.STX_USD;
    case "RSTX":
      return numAmount * prices.RSTX_USD;
    default:
      console.warn(`No price data for symbol: ${symbol}`);
      return 0;
  }
};

/**
 * Get USD value for a given token amount (synchronous version)
 * This version doesn't update prices, just uses current cached values
 */
export const getUSDValueSync = (
  amount: number | string,
  symbol: Symbol | string
): number => {
  if (!amount) return 0;

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 0;

  switch (symbol.toUpperCase() as Symbol) {
    case "ETH":
    case "WETH":
      return numAmount * prices.ETH_USD;
    case "USDC":
      return numAmount * prices.USDC_USD;
    case "STX":
      return numAmount * prices.STX_USD;
    case "RSTX":
      return numAmount * prices.RSTX_USD;
    default:
      console.warn(`No price data for symbol: ${symbol}`);
      return 0;
  }
};

/**
 * Format a number as USD currency
 */
export const formatUSD = (value: number): string => {
  if (isNaN(value)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Get current price for a specific token
 */
export const getTokenUSDPrice = (symbol: Symbol | string): number => {
  switch (symbol.toUpperCase()) {
    case "ETH":
    case "WETH":
      return prices.ETH_USD;
    case "USDC":
      return prices.USDC_USD;
    case "STX":
      return prices.STX_USD;
    case "RSTX":
      return prices.RSTX_USD;
    default:
      return 0;
  }
};
