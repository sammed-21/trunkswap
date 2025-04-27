// // This function would be added to your poolStore.ts file

// // First, add these imports at the top
// import { ethers } from 'ethers';

// // These are simplified ABIs for demonstration - you'll need to use your actual ABIs
// const FACTORY_ABI = [
//   'function allPairsLength() external view returns (uint)',
//   'function allPairs(uint) external view returns (address)',
//   'function getPair(address tokenA, address tokenB) external view returns (address pair)'
// ];

// const PAIR_ABI = [
//   'function token0() external view returns (address)',
//   'function token1() external view returns (address)',
//   'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
//   'function balanceOf(address owner) external view returns (uint)',
//   'function totalSupply() external view returns (uint)'
// ];

// const ERC20_ABI = [
//   'function name() external view returns (string)',
//   'function symbol() external view returns (string)',
//   'function decimals() external view returns (uint8)'
// ];

// // Add this to your PoolState interface
// fetchUserPositions: async (provider: ethers.Provider, account: string, factoryAddress: string) => Promise<void>;

// // Then replace the fetchUserPositions implementation in your store:
// fetchUserPositions: async (provider:ethers.Provider, account:string, factoryAddress:string) => {
//   if (!provider || !account || !factoryAddress) {
//     set({ error: "Missing required parameters", isLoading: false });
//     return;
//   }

//   try {
//     set({ isLoading: true, error: null });

//     // Create factory contract instance
//     const factoryContract = new ethers.Contract(
//       factoryAddress,
//       FACTORY_ABI,
//       provider
//     );

//     // Get the total number of pairs
//     const pairsLength = await factoryContract.allPairsLength();

//     // For demonstration, we'll limit to the first 100 pairs to prevent excessive requests
//     const pairsToCheck = Math.min(100, parseInt(pairsLength.toString()));

//     const positions: PoolPosition[] = [];

//     // Check each pair
//     for (let i = 0; i < pairsToCheck; i++) {
//       try {
//         // Get pair address
//         const pairAddress = await factoryContract.allPairs(i);

//         // Create pair contract instance
//         const pairContract = new ethers.Contract(
//           pairAddress,
//           PAIR_ABI,
//           provider
//         );

//         // Check if user has LP tokens
//         const userLPBalance = await pairContract.balanceOf(account);

//         // If user has no LP tokens, skip this pair
//         if (userLPBalance.eq(0)) continue;

//         // Get pair tokens
//         const token0Address = await pairContract.token0();
//         const token1Address = await pairContract.token1();

//         // Create token contracts
//         const token0Contract = new ethers.Contract(
//           token0Address,
//           ERC20_ABI,
//           provider
//         );
//         const token1Contract = new ethers.Contract(
//           token1Address,
//           ERC20_ABI,
//           provider
//         );

//         // Get token symbols and decimals
//         const [
//           token0Symbol,
//           token1Symbol,
//           token0Decimals,
//           token1Decimals,
//           reserves,
//           totalSupply
//         ] = await Promise.all([
//           token0Contract.symbol(),
//           token1Contract.symbol(),
//           token0Contract.decimals(),
//           token1Contract.decimals(),
//           pairContract.getReserves(),
//           pairContract.totalSupply()
//         ]);

//         // Calculate user's share of the pool
//         const userShare = userLPBalance.mul(ethers.constants.WeiPerEther).div(totalSupply);

//         // Calculate token amounts based on user's share
//         const token0Amount = reserves[0].mul(userShare).div(ethers.constants.WeiPerEther);
//         const token1Amount = reserves[1].mul(userShare).div(ethers.constants.WeiPerEther);

//         // Format token amounts with proper decimals
//         const formattedToken0Amount = ethers.utils.formatUnits(token0Amount, token0Decimals);
//         const formattedToken1Amount = ethers.utils.formatUnits(token1Amount, token1Decimals);

//         // Add position to the list
//         positions.push({
//           pairAddress,
//           token0: token0Address,
//           token1: token1Address,
//           token0Symbol,
//           token1Symbol,
//           liquidity: ethers.utils.formatEther(userLPBalance),
//           token0Amount: formattedToken0Amount,
//           token1Amount: formattedToken1Amount
//         });
//       } catch (error) {
//         console.error(`Error fetching data for pair ${i}:`, error);
//         // Continue with next pair instead of failing the entire process
//       }
//     }

//     set({
//       userPositions: positions,
//       isLoading: false,
//       lastUpdated: Date.now()
//     });

//   } catch (error) {
//     console.error("Error fetching user positions:", error);
//     set({
//       error: error instanceof Error ? error.message : "Failed to fetch positions",
//       isLoading: false
//     });
//   }
// }
