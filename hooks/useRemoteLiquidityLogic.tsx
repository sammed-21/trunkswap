import { ERC20_ABI } from "@/abi/ERC20ABI";
import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { ROUTER_ADDRESS } from "@/lib/constants";
import { deadlineFormatted } from "@/lib/utils";
import { useAccountStore } from "@/state/accountStore";
import { useLiqudityState, useLiquidityActions } from "@/state/liquidityStore";
import { ethers, formatUnits, Signer } from "ethers";
import React from "react";
import { useTxToast } from "./useToast";

export function useRemoveLiquidityLogic() {
  const { withToast } = useTxToast();
  const { selectedPool, percentToRemove, deadline } = useLiqudityState();
  const { setIsRemovingLiquidity, setError, fetchPools, resetForm } =
    useLiquidityActions();

  const { chainId, address, provider, signer } = useAccountStore.getState();

  const removeLiquidity = async (signer: Signer) => {
    const userAddress = address;

    let routerAddress = ROUTER_ADDRESS(chainId);
    // const provider = useAccountStore.getState().provider;
    if (!signer) return null;
    if (!selectedPool || percentToRemove <= 0 || percentToRemove > 100) {
      setError("no pool");
      return null;
    }

    try {
      setIsRemovingLiquidity(true);

      const routerContract = new ethers.Contract(
        routerAddress,
        ROUTER_ABI,
        signer
      );
      const pairContract = new ethers.Contract(
        selectedPool.pairAddress,
        PAIR_ABI,
        signer
      );

      // Calculate LP tokens to remove

      const userLpBalanceBN = ethers.parseUnits(
        selectedPool?.userLpBalance!,
        18
      );
      const lpToRemove =
        (userLpBalanceBN * BigInt(Math.floor(percentToRemove))) / BigInt(100);

      if (lpToRemove === BigInt(0)) {
        setIsRemovingLiquidity(false);
        setError("You don't have any liquidity to remove.");
        return null;
      }

      // Approve LP tokens if needed
      const allowance = await pairContract.allowance(
        userAddress,
        routerAddress
      );
      if (allowance < lpToRemove) {
        const approveTx = await withToast(
          async () => {
            return pairContract.approve(routerAddress, lpToRemove);
          },
          "approve",
          {
            chainId: chainId,
            meta: {
              tokenAAmount: formatUnits(lpToRemove, 18),
              tokenASymbol: "lp",
            },
          }
        );
      }

      // Calculate minimum amounts (with 0.5% slippage)
      const reserves = await pairContract.getReserves();
      const totalSupply = await pairContract.totalSupply();

      const reserve0 = BigInt(reserves[0]);
      const reserve1 = BigInt(reserves[1]);
      const totalSupplyBN = BigInt(totalSupply);
      const lpToRemoveBN = BigInt(lpToRemove);

      const amount0Min =
        (reserve0 * lpToRemoveBN * BigInt(995)) /
        (totalSupplyBN * BigInt(1000));
      const amount1Min =
        (reserve1 * lpToRemoveBN * BigInt(995)) /
        (totalSupplyBN * BigInt(1000));

      // Deadline 20 minutes from now
      // const deadlines = Math.floor(Date.now() / 1000) + deadline * 60;

      // Remove liquidity
      // const tx = await routerContract.removeLiquidity(
      //   selectedPool.token0.address,
      //   selectedPool.token1.address,
      //   lpToRemove,
      //   amount0Min,
      //   amount1Min,
      //   userAddress,
      //   deadlines,
      //   { gasLimit: 3000000 }
      // );

      const deadlineTimestamp = deadlineFormatted(deadline); // deadline in minutes

      const receipt = await withToast(
        async () => {
          // This function returns the transaction promise
          return routerContract.removeLiquidity(
            selectedPool.token0.address,
            selectedPool.token1.address,
            lpToRemove,
            amount0Min,
            amount1Min,
            userAddress,
            deadlineTimestamp,
            { gasLimit: 3000000 }
          );
        },
        "removeLiquidity", // Transaction type
        {
          // actionLabel:"Swap",
          chainId: chainId, // Replace with your network's chain ID
          meta: {
            tokenAAmount: formatUnits(lpToRemove, 18),
            // tokenASymbol: `${selectedTokenA.symbol}`,
            // tokenBAmount: tokenBAmount,
            // tokenBSymbol: `${selectedTokenB.symbol}`,
            // aggregate: "+",
          },
          // Optional callbacks
          onSuccess: async (receipt) => {
            // Clear form or update UI after successful swap
            resetForm();

            // Refresh pools
            await fetchPools(provider!);

            setIsRemovingLiquidity(false);
            // You could update balances here
            // setTokenBAmount("");
            // setTransactionButtonText("Swap");
            // await updateTokenBalances(address!, provider);
            // resetSwapState();
          },
          onError: (error) => {
            // setTransactionButtonText("Swap");
            // Any additional error handling specific to your app
          },
        }
        // Optional custom title
        // `Swap ${currentSellAsset.symbol} for ${currentBuyAsset.symbol}`
      );

      // const receipt = await tx.wait();

      // Reset form after successful transaction

      // return
      return receipt;
    } catch (error) {
      console.error("Error removing liquidity:", error);

      setIsRemovingLiquidity(false);
      setError("Failed to remove liquidity. Please try again.");
      return null;
    }
  };

  return { removeLiquidity };
}
