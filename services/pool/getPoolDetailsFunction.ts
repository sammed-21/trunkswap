import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { addressess } from "@/address";
import { Contract, ethers, formatUnits } from "ethers";
import { getNetworkNameUsingChainId } from "../getNetworkNameUsingChainId";
import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { getPrice } from "@/lib/utils";
import { Prices } from "@/lib/types";
import { getUSDValue } from "../priceFeed";
import { usePriceStore } from "@/state/priceStore";
export async function getAllPairs(factoryContract: Contract) {
  let allPairsLength = await factoryContract.allPairsLength();

  const pairAddresses = [];

  for (let i = 0; i < (allPairsLength > 10 ? 5 : allPairsLength); i++) {
    const pairAddress = await factoryContract.allPairs(i);
    if (pairAddress == null) {
      return;
    }
    pairAddresses.push(pairAddress);
  }

  return pairAddresses;
}

export async function getPairDetails(
  pairAddress: any,
  provider: any
  // address?: string | undefined
) {
  const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
  const token0Address = await pairContract.token0();
  const token1Address = await pairContract.token1();
  const reserves = await pairContract.getReserves();
  const totalSupply = await pairContract.totalSupply();
  // const balance = await pairContract.balanceOf(address);

  const token0Contract = new ethers.Contract(
    token0Address,
    ERC20_ABI,
    provider
  );
  const token1Contract = new ethers.Contract(
    token1Address,
    ERC20_ABI,
    provider
  );

  const token0Symbol = await token0Contract.symbol();
  const token0Decimals = await token0Contract.decimals();
  const token1Symbol = await token1Contract.symbol();
  const token1Decimals = await token1Contract.decimals();

  let reserve0 = formatUnits(reserves[0], token0Decimals).toString();
  let reserve1 = formatUnits(reserves[1], token1Decimals).toString();
  const tvl = await getTVLForPool(
    reserve0,
    token0Symbol,
    reserve1,
    token1Symbol
  );
  console.log(tvl);

  return {
    pairAddress,
    token0: {
      address: token0Address,
      symbol: token0Symbol,
    },
    token1: {
      address: token1Address,
      symbol: token1Symbol,
    },
    reserve0,
    reserve1,
    reserves,

    totalSupply,
    tvl,
    // balance,
  };
}

export const factoryContract = (chainId: any, provider: any) =>
  new ethers.Contract(
    addressess[getNetworkNameUsingChainId(chainId)].FACTORY_ADDRESS,
    FACTORY_ABI,
    provider
  );

export async function poolData(factoryContract: Contract, provider: any) {
  const pairAddresses = await getAllPairs(factoryContract);
  if (!pairAddresses) return;
  const poolDetails = await Promise.all(
    pairAddresses.map(
      // address => user address
      (pairAddress) => getPairDetails(pairAddress, provider) // ✅ passing provider explicitly
    )
  );
  return poolDetails;
}

// Adjust the path if needed

export const getTVLForPool = async (
  reserve0: string,
  symbol0: string,
  reserve1: string,
  symbol1: string
): Promise<number> => {
  const value0 = await usePriceStore.getState().getUSDValue(reserve0, symbol0);
  const value1 = await usePriceStore.getState().getUSDValue(reserve1, symbol1);

  return value0 + value1;
};
