// import { Skeleton } from "@/components/ui/skeleton";
// import { MAINNET_TOKENS_BY_SYMBOL } from "@/lib/constants";
// import { Prices } from "@/lib/types";
// import Image from "next/image";
// import React, { useCallback, useEffect, useState } from "react";
// import { GoArrowSwitch } from "react-icons/go";
// // Token logos

// interface TokenConversionProps {
//   prices: Prices | null;
//   from: string;
//   to: string;
// }

// const TokenConversion: React.FC<TokenConversionProps> = ({
//   prices,
//   from,
//   to,
// }) => {
//   const [isReversed, setIsReversed] = useState(false);
//   const [conversionRate, setConversionRate] = useState<number | null>(null);

//   const getPrice = useCallback(
//     (token: string): number | null => {
//       return prices?.[`${token == "WETH" ? "ETH" : token}_USD`] ?? null;
//     },
//     [from, to]
//   );

//   const calculateRate = useCallback(
//     (fromToken: string, toToken: string): number | null => {
//       const fromPrice = getPrice(fromToken);
//       const toPrice = getPrice(toToken);

//       if (fromPrice === null || toPrice === null || toPrice === 0) return null;

//       return fromPrice / toPrice;
//     },
//     [prices, from, to]
//   );

//   useEffect(() => {
//     const updateRate = () => {
//       const fromToken = isReversed ? to : from;
//       const toToken = isReversed ? from : to;
//       const rate = calculateRate(fromToken, toToken);

//       setConversionRate(rate);
//     };

//     updateRate(); // initial
//     // const interval = setInterval(updateRate, 10000); // every 10 sec

//     // return () => clearInterval(interval);
//   }, [isReversed, prices, from, to]);

//   const displayFrom = isReversed ? to : from;
//   const displayTo = isReversed ? from : to;

//   return (
//     <div className="flex flex-row items-center gap-2 h-8  pb-1 w-fit bg-background  ">
//       {conversionRate !== null && (
//         <>
//           <div className="text-sm font-medium flex items-center gap-2">
//             <span>1 {displayFrom}</span>
//             <Image
//               src={MAINNET_TOKENS_BY_SYMBOL[displayFrom.toLowerCase()].logoURI}
//               alt={displayFrom}
//               className="h-6 w-6"
//             />
//             <span>=</span>

//             <>
//               <span>{conversionRate.toFixed(6)}</span>
//               <Image
//                 src={MAINNET_TOKENS_BY_SYMBOL[displayTo.toLowerCase()].logoURI}
//                 alt={displayTo}
//                 className="h-6 w-6 ml-1"
//               />
//               <span>{displayTo}</span>
//             </>
//           </div>
//           <button
//             className="px-3 py-1    rounded  "
//             onClick={() => setIsReversed(!isReversed)}
//           >
//             <GoArrowSwitch size={20} />
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default TokenConversion;

import { Skeleton } from "@/components/ui/skeleton";
import { MAINNET_TOKENS_BY_SYMBOL } from "@/lib/constants";
import { Prices } from "@/lib/types";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { GoArrowSwitch } from "react-icons/go";

interface TokenConversionProps {
  prices: Prices | null;
  from: string;
  to: string;
}

const TokenConversion: React.FC<TokenConversionProps> = ({
  prices,
  from,
  to,
}) => {
  const [isReversed, setIsReversed] = useState(false);
  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const getPrice = useCallback(
    (token: string): number | null => {
      return prices?.[`${token === "WETH" ? "ETH" : token}_USD`] ?? null;
    },
    [prices]
  );

  const calculateRate = useCallback(
    (fromToken: string, toToken: string): number | null => {
      const fromPrice = getPrice(fromToken);
      const toPrice = getPrice(toToken);
      if (!fromPrice || !toPrice) return null;
      return fromPrice / toPrice;
    },
    [getPrice]
  );

  useEffect(() => {
    const updateRate = () => {
      const fromToken = isReversed ? to : from;
      const toToken = isReversed ? from : to;
      const rate = calculateRate(fromToken, toToken);
      setConversionRate(rate);
    };

    updateRate();
  }, [isReversed, from, to, calculateRate]);

  const displayFrom = isReversed ? to : from;
  const displayTo = isReversed ? from : to;

  return (
    <div className="flex flex-row items-center gap-2 h-8 pb-1 w-fit bg-background">
      {conversionRate !== null ? (
        <>
          <div className="text-sm font-medium flex items-center gap-2">
            <span>1 {displayFrom}</span>
            <Image
              src={MAINNET_TOKENS_BY_SYMBOL[displayFrom.toLowerCase()].logoURI}
              alt={displayFrom}
              className="h-6 w-6"
              width={24}
              height={24}
            />
            <span>=</span>
            <span>{conversionRate.toFixed(6)}</span>
            <Image
              src={MAINNET_TOKENS_BY_SYMBOL[displayTo.toLowerCase()].logoURI}
              alt={displayTo}
              className="h-6 w-6 ml-1"
              width={24}
              height={24}
            />
            <span>{displayTo}</span>
          </div>
          <button
            className="px-3 py-1 rounded"
            onClick={() => setIsReversed(!isReversed)}
          >
            <GoArrowSwitch size={20} />
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Skeleton className="w-64 h-4" />
          </div>
        </>
      )}
    </div>
  );
};

export default TokenConversion;
