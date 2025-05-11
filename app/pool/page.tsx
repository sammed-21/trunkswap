"use client";
import { PoolPositionsList } from "@/components/Pool/PoolDataDisply";
import { PoolList } from "@/components/Pool/PoolList";
import { PoolListHead } from "@/components/Pool/PoolListHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PoolPage() {
  return (
    <div className="w-full relative h-full mx-auto py-10 px-4 gap-4 flex flex-col items-start justify-center">
      <Tabs defaultValue="pools" className="w-full max-w-[1440px] mx-auto">
        <TabsList className="mb-4">
          {/* <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="my-liquidity">My Liquidity</TabsTrigger> */}
        </TabsList>

        <TabsContent value="pools">
          <PoolListHead />
          <div className="w-full flex flex-col justify-center">
            <PoolList />
          </div>
        </TabsContent>

        {/* <TabsContent value="my-liquidity">
          <PoolListHead />
          <div className="w-full flex flex-col justify-center">

            <PoolPositionsList />
            <p className="text-muted-foreground text-sm">
              You don’t have any liquidity positions yet.
            </p>
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Pool, useLiquidityStore } from "@/state/liquidityStore";
// import { useAccountStore } from "@/state/accountStore";
// import { useAccount } from "wagmi";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatCurrency } from "@/lib/utils";

// export default function PoolsPage() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortOption, setSortOption] = useState<"liquidity" | "volume" | "name">(
//     "liquidity"
//   );

//   // Get data from stores
//   const { isConnected, address } = useAccount();
//   const { provider } = useAccountStore();
//   const {
//     pools,
//     fetchPools,
//     isLoadingPools,
//     error: poolsError,
//     setSelectedPool,
//   } = useLiquidityStore();

//   // Load pools on component mount
//   useEffect(() => {
//     if (provider && isConnected) {
//       fetchPools(provider);
//     }
//   }, [provider, isConnected, fetchPools]);

//   // Filter pools based on search query
//   const filteredPools = pools.filter((pool) => {
//     const query = searchQuery.toLowerCase();
//     return (
//       pool.token0.symbol.toLowerCase().includes(query) ||
//       pool.token1.symbol.toLowerCase().includes(query) ||
//       pool.pairAddress.toLowerCase().includes(query)
//     );
//   });

//   // Sort pools based on selected option
//   const sortedPools = [...filteredPools].sort((a, b) => {
//     switch (sortOption) {
//       case "name":
//         return `${a.token0.symbol}/${a.token1.symbol}`.localeCompare(
//           `${b.token0.symbol}/${b.token1.symbol}`
//         );
//       case "liquidity":
//         // Sort by total value locked (reserves)
//         const liquidityA = parseFloat(a.reserves0) * parseFloat(a.token0Price);
//         const liquidityB = parseFloat(b.reserves0) * parseFloat(b.token0Price);
//         return liquidityB - liquidityA;
//       default:
//         return 0;
//     }
//   });

//   // Handle pool selection
//   const handlePoolSelect = (pool: Pool) => {
//     setSelectedPool(pool);
//     router.push(`/pool/${pool.pairAddress}`);
//   };

//   // Handle create new pair
//   const handleCreatePair = () => {
//     router.push("/add-liquidity");
//   };

//   return (
//     // <ErrorBoundary fallback={<div className="p-4 text-red-500">Error loading pools</div>}>
//     <div className="  mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Liquidity Pools</h1>
//         <button
//           onClick={handleCreatePair}
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
//         >
//           Create New Pair
//         </button>
//       </div>

//       {/* Search and filter tools */}
//       <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1">
//             <input
//               type="text"
//               placeholder="Search by token symbol or address"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
//             />
//           </div>
//           <div className="md:w-48">
//             <select
//               value={sortOption}
//               onChange={(e) => setSortOption(e.target.value as any)}
//               className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
//             >
//               <option value="liquidity">Sort by Liquidity</option>
//               <option value="name">Sort by Name</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Connection warning */}
//       {!isConnected && (
//         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
//           <p>Please connect your wallet to view your liquidity positions.</p>
//         </div>
//       )}

//       {/* Loading state */}
//       {isLoadingPools && (
//         <div className="flex justify-center items-center h-40">
//           <Skeleton className="h-3 w-10 bg-accent" />
//         </div>
//       )}

//       {/* Error state */}
//       {poolsError && (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
//           <p>{poolsError}</p>
//         </div>
//       )}

//       {/* Empty state */}
//       {!isLoadingPools && !poolsError && sortedPools.length === 0 && (
//         <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
//           <p className="text-lg mb-4">
//             {searchQuery
//               ? "No pools match your search"
//               : "No liquidity pools found"}
//           </p>
//           {!searchQuery && (
//             <button
//               onClick={handleCreatePair}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
//             >
//               Create First Pool
//             </button>
//           )}
//         </div>
//       )}

//       {/* Pools list */}
//       {!isLoadingPools && !poolsError && sortedPools.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {sortedPools.map((pool) => (
//             <div
//               key={pool.pairAddress}
//               onClick={() => handlePoolSelect(pool)}
//               className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition"
//             >
//               {address && (
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-lg font-medium">{`${pool.token0.symbol}/${pool.token1.symbol}`}</h3>
//                   {parseFloat(pool.userLpBalance!) > 0 && (
//                     <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
//                       Your Position
//                     </span>
//                   )}
//                 </div>
//               )}

//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Liquidity:</span>
//                   <span>
//                     {formatCurrency(
//                       parseFloat(pool.reserves0) *
//                         parseFloat(pool.token0Price) *
//                         2
//                     )}
//                   </span>
//                 </div>

//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Tokens:</span>
//                   <span className="flex flex-col items-end">
//                     <div>{`${parseFloat(pool.reserves0).toLocaleString(
//                       undefined,
//                       { maximumFractionDigits: 6 }
//                     )} ${pool.token0.symbol}`}</div>
//                     <div>{`${parseFloat(pool.reserves1).toLocaleString(
//                       undefined,
//                       { maximumFractionDigits: 6 }
//                     )} ${pool.token1.symbol}`}</div>
//                   </span>
//                 </div>
//                 {address && (
//                   <>
//                     {parseFloat(pool.userLpBalance!) > 0 && (
//                       <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
//                         <span className="text-gray-500">Your share:</span>
//                         <span>
//                           {(
//                             (parseFloat(pool.userLpBalance!) /
//                               parseFloat(pool.totalSupply)) *
//                             100
//                           ).toFixed(2)}
//                           %
//                         </span>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//     // </ErrorBoundary>
//   );
// }
