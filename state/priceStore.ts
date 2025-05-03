// import { ethers } from "ethers";
// import { create } from "zustand";

// interface PriceState {
//     prices: Record<string, number>;
//     loading: boolean;
//     fetchPriceFromChainlink: (tokenAddress: string, provider: ethers.Provider) => Promise<number>;
//     fetchTokenPrice: (tokenAddress: string, tokenSymbol: string, provider: ethers.Provider) => Promise<void>;
//     fetchAllTokenPrices: (tokens: Array<{address: string, symbol: string}>, provider: ethers.Provider) => Promise<void>;
//   }
//   const PRICE_FEEDS = {
//     // Format: TOKEN_ADDRESS: PRICE_FEED_ADDRESS
//     '0x0E15258734300290a651FdBAe8dEb039a8E7a2FA': '0x708BA0B5C0a25098E8D0c830A22c15C250A0AE7E', // Example: ETH/USD on Arbitrum Sepolia
//     // Add more tokens as needed
//   };

//   // For tokens without direct USD feeds, we can use token/ETH feeds and then ETH/USD
//   const TOKEN_ETH_FEEDS = {
//     // Format: TOKEN_ADDRESS: TOKEN_ETH_FEED_ADDRESS
//   };

//   // Fallback prices for testing and development
//   const FALLBACK_PRICES = {
//     'WETH': 3000, // $3000 per WETH
//     'USDC': 1,    // $1 per USDC
//     'DAI': 1,     // $1 per DAI
//     'SUPRA': 0.0065, // Example price for SUPRA
//     'dexUSDC': 1, // Example price for dexUSDC
//   };

//   export const usePriceStore = create<PriceState>((set, get) => ({
//     prices: {},
//     loading: false,

//     // Fetch price from Chainlink price feed
//     fetchPriceFromChainlink: async (tokenAddress: string, provider: ethers.Provider) => {
//       const priceFeedAddress = PRICE_FEEDS[tokenAddress.toLowerCase()];

//       if (!priceFeedAddress) {
//         console.warn(`No price feed found for token: ${tokenAddress}`);
//         return 0;
//       }

//       try {
//         const priceFeed = new ethers.Contract(
//           priceFeedAddress,
//           CHAINLINK_AGGREGATOR_ABI,
//           provider
//         );

//         // Get latest price data
//         const [, answer] = await priceFeed.latestRoundData();

//         // Get decimals
//         const decimals = await priceFeed.decimals();

//         // Calculate price with proper decimal formatting
//         const price = parseFloat(ethers.formatUnits(answer, decimals));
//         return price;
//       } catch (error) {
//         console.error(`Error fetching price for ${tokenAddress}:`, error);
//         return 0;
//       }
//     },

//     // Fetch token price with fallback
//     fetchTokenPrice: async (tokenAddress: string, tokenSymbol: string, provider: ethers.Provider) => {
//       set({ loading: true });

//       try {
//         let price = 0;

//         // Try Chainlink first
//         if (PRICE_FEEDS[tokenAddress.toLowerCase()]) {
//           price = await get().fetchPriceFromChainlink(tokenAddress, provider);
//         }

//         // If no price from Chainlink, use fallback
//         if (price === 0 && FALLBACK_PRICES[tokenSymbol]) {
//           price = FALLBACK_PRICES[tokenSymbol];
//           console.log(`Using fallback price for ${tokenSymbol}: $${price}`);
//         }

//         if (price > 0) {
//           set(state => ({
//             prices: {
//               ...state.prices,
//               [tokenAddress.toLowerCase()]: price,
//               [tokenSymbol]: price, // Store by both address and symbol for convenience
//             },
//           }));
//         }
//       } catch (error) {
//         console.error(`Error fetching price for ${tokenSymbol}:`, error);
//       } finally {
//         set({ loading: false });
//       }
//     },

//     // Fetch all token prices
//     fetchAllTokenPrices: async (tokens, provider) => {
//       set({ loading: true });

//       try {
//         await Promise.all(
//           tokens.map(token =>
//             get().fetchTokenPrice(token.address, token.symbol, provider)
//           )
//         );
//       } catch (error) {
//         console.error('Error fetching all token prices:', error);
//       } finally {
//         set({ loading: false });
//       }
//     },
//   }));
