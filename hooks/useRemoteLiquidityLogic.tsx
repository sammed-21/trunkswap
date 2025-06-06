import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { isETH, isWETHAddress, ROUTER_ADDRESS } from "@/lib/constants";
import { deadlineFormatted } from "@/lib/utils";
import { useAccountStore } from "@/state/accountStore";
import { useLiqudityState, useLiquidityActions } from "@/state/liquidityStore";
import { ethers, formatUnits, Signer } from "ethers";
import { useTxToast } from "./useToast";
import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { useSwapActions } from "@/state/swapStore";

export function useRemoveLiquidityLogic() {
  const { withToast } = useTxToast();
  const { isConnected } = useAccount();
  const [actionToPerform, setActionToPerform] = useState<
    "approve" | "remove" | null
  >(null);
  const { selectedPool, percentToRemove, deadline, needsApprovalLP } =
    useLiqudityState();
  const {
    setIsRemovingLiquidity,
    setError,
    fetchPools,
    setIsLpApproving,
    setTransactionRemoveLiquidityText,
    resetForm,
    setNeedsApprovalLP,
    getUserBalances,
  } = useLiquidityActions();
  const { updateTokenBalances } = useSwapActions();

  const { chainId, address, provider, signer } = useAccountStore.getState();

  const removeLiquidity = async (signer: Signer) => {
    if (!provider) {
      setError("No Provider");
      return;
    }
    if (!signer) {
      setError("No Signer");
      return;
    }
    const userAddress = signer.getAddress();
    if (!userAddress) {
      setError("No UserAddress");
      return;
    }
    if (!isConnected || !address) {
      setError("Please connect your wallet");
      return;
    }

    let routerAddress = ROUTER_ADDRESS(chainId);
    // const provider = useAccountStore.getState().provider;
    if (!signer) return null;
    if (!selectedPool || percentToRemove <= 0 || percentToRemove > 100) {
      setError("no pool");
      return null;
    }

    try {
      setIsRemovingLiquidity(true);
      try {
        const blockNumber = await provider.getBlockNumber();
      } catch (rpcError) {
        setError("RPC endpoint may be unstable. Please try again later.");
        setIsRemovingLiquidity(false);
        // setTransactionButtonText("Add Liquidity");
        return null;
      }

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
      //get latest nonce
      const [currentNonce, block, feeData] = await Promise.all([
        provider.getTransactionCount(userAddress, "latest"),
        provider.getBlock("latest"),
        provider.getFeeData(),
      ]);

      const gasLimit = BigInt(500000);

      const txParams = {
        nonce: currentNonce,
        gasLimit: gasLimit,
        gasPrice: feeData.gasPrice
          ? (feeData.gasPrice * BigInt(11)) / BigInt(10)
          : undefined,
      };

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
      // const allowance = await pairContract.allowance(
      //   userAddress,
      //   routerAddress
      // );
      // if (allowance < lpToRemove) {
      //   const approveTx = await withToast(
      //     async () => {
      //       return pairContract.approve(routerAddress, lpToRemove);
      //     },
      //     "approve",
      //     {
      //       chainId: chainId,
      //       meta: {
      //         tokenAAmount: formatUnits(lpToRemove, 18),
      //         token0Symbol: "lp",
      //       },
      //     }
      //   );
      // }

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
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      const deadlineTimestamp = deadlineFormatted(deadline); // deadline in minutes

      const receipt = await withToast(
        async () => {
          // This function returns the transaction promise
          // This function returns the transaction promise
          const isToken0ETH = isWETHAddress(
            selectedPool.token0.address,
            chainId
          );
          const isToken1ETH = isWETHAddress(
            selectedPool.token1.address,
            chainId
          );
          if (isToken0ETH || isToken1ETH) {
            // One of the tokens is ETH, use removeLiquidityETH
            const tokenAddress = isToken0ETH
              ? selectedPool.token1.address
              : selectedPool.token0.address;
            const tokenMin = isToken0ETH ? amount1Min : amount0Min;
            const ethMin = isToken0ETH ? amount0Min : amount1Min;

            return routerContract.removeLiquidityETH(
              tokenAddress, // address of the ERC20 token
              lpToRemove, // liquidity amount to remove
              tokenMin, // minimum amount of token to receive
              ethMin, // minimum amount of ETH to receive
              userAddress, // recipient address
              deadlineTimestamp, // deadline
              txParams
            );
          } else {
            // Both tokens are ERC20, use regular removeLiquidity
            return routerContract.removeLiquidity(
              selectedPool.token0.address,
              selectedPool.token1.address,
              lpToRemove,
              amount0Min,
              amount1Min,
              userAddress,
              deadlineTimestamp,
              txParams
            );
          }
        },
        "removeLiquidity", // Transaction type
        {
          // actionLabel:"Swap",
          chainId: chainId, // Replace with your network's chain ID
          meta: {
            tokenAAmount: formatUnits(lpToRemove, 18),
            token0Symbol: `LP`,
            // tokenBAmount: tokenBAmount,
            // token1Symbol: `${selectedToken1.symbol}`,
            // aggregate: "+",
          },
          // Optional callbacks
          onSuccess: async (receipt) => {
            // Clear form or update UI after successful swap
            resetForm();
            setTransactionRemoveLiquidityText("Remove Liquidity");
            await getUserBalances(address);
            await updateTokenBalances(address!, provider);

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
        // `Remove ${currentSellAsset.symbol} for ${currentBuyAsset.symbol}`
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
  const ApproveLP = async (signer: Signer) => {
    if (!selectedPool || percentToRemove <= 0 || percentToRemove > 100) {
      setError("Invalid pool or removal amount");
      return false;
    }
    if (!provider) {
      setError("No Provider");
      return;
    }

    try {
      const userAddress = await signer.getAddress();
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
        setError("You don't have any liquidity to remove.");
        return false;
      }

      // Check allowance
      const routerAddress = ROUTER_ADDRESS(chainId);
      const allowance = await pairContract.allowance(
        userAddress,
        routerAddress
      );

      if (allowance < lpToRemove) {
        setIsLpApproving(true);
        setTransactionRemoveLiquidityText("Approve LP");

        // Get optimized transaction parameters
        const [currentNonce, feeData] = await Promise.all([
          provider.getTransactionCount(userAddress, "latest"),
          provider.getFeeData(),
        ]);

        const txParams = {
          nonce: currentNonce,
          gasLimit: BigInt(300000),
          gasPrice: feeData.gasPrice
            ? (feeData.gasPrice * BigInt(11)) / BigInt(10)
            : undefined,
        };

        // Execute approval with toast
        await withToast(
          async () => {
            return pairContract.approve(routerAddress, lpToRemove, txParams);
          },
          "approve",
          {
            chainId: chainId,
            meta: {
              tokenAAmount: formatUnits(lpToRemove, 18),
              token0Symbol: "LP",
            },
            onSuccess: () => {
              setIsLpApproving(false);
              setTransactionRemoveLiquidityText("Remove Liquidity");
            },
            onError: (error) => {
              setIsLpApproving(false);
              setError("Approval failed: " + error.message);
            },
          },
          "Approve LP Token "
        );

        // Wait for the approval to be mined and confirmed (important)
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Double-check the allowance again to ensure it's updated
        const newAllowance = await pairContract.allowance(
          userAddress,
          routerAddress
        );
        return newAllowance >= lpToRemove;
      } else {
        // Already approved
        setIsLpApproving(true);
        return true;
      }
    } catch (error: any) {
      console.error("Error checking/approving LP tokens:", error);
      setError("Failed to approve LP tokens: " + error.message);
      setIsLpApproving(false);
      return false;
    }
  };
  const checkNeedApprovalLP = async (signer: Signer) => {
    if (!selectedPool || percentToRemove <= 0 || percentToRemove > 100) {
      setError("Invalid pool or removal amount");
      setActionToPerform(null);
      return;
    }

    if (!provider) {
      setError("No Provider");
      setActionToPerform(null);
      return;
    }

    try {
      const userAddress = await signer.getAddress();
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
      if (BigInt(userLpBalanceBN) === BigInt(0)) {
        setNeedsApprovalLP(false);
        setTransactionRemoveLiquidityText("Insufficient Balance");
      }
      const lpToRemove =
        (BigInt(userLpBalanceBN) * BigInt(Math.floor(percentToRemove))) /
        BigInt(100);
      if (lpToRemove === BigInt(0)) {
        setError("You don't have any liquidity to remove.");
        setActionToPerform(null);
        return;
      }

      // Check allowance
      const routerAddress = ROUTER_ADDRESS(chainId);
      const allowance = await pairContract.allowance(
        userAddress,
        routerAddress
      );

      if (BigInt(allowance) < BigInt(lpToRemove)) {
        setNeedsApprovalLP(true);
        setTransactionRemoveLiquidityText("Approve LP");
        setActionToPerform("approve");
      } else {
        setNeedsApprovalLP(false);
        setTransactionRemoveLiquidityText("Remove Liquidity");
        setActionToPerform("remove");
      }
    } catch (error: any) {
      console.error("Error checking/approving LP tokens:", error);
      setError("Failed to approve LP tokens: " + error.message);
      setNeedsApprovalLP(false);
      return false;
    }
  };

  useEffect(() => {
    const needApprovalLP = async () => {
      if (signer && percentToRemove > 1) {
        await checkNeedApprovalLP(signer);
      }
    };

    needApprovalLP();
  }, [signer, percentToRemove]);

  const handleApproveLP = useCallback(async () => {
    if (needsApprovalLP) {
      await ApproveLP(signer);
    }
  }, [needsApprovalLP]);

  const handleTransaction = async () => {
    if (!provider || !signer || !isConnected || !actionToPerform) return;

    try {
      if (actionToPerform === "approve") {
        setIsLpApproving(true);
        setTransactionRemoveLiquidityText("Approving LP...");
        await ApproveLP(signer);
        setIsLpApproving(false);

        // Re-check approval after approve
        await checkNeedApprovalLP(signer);
      } else if (actionToPerform === "remove") {
        await removeLiquidity(signer); // assumes internal loading states
      }
    } catch (err) {
      console.error("Transaction error:", err);
      setIsLpApproving(false);
      setIsRemovingLiquidity(false);
      setTransactionRemoveLiquidityText("Remove Liquidity");
    }
  };

  return { removeLiquidity, ApproveLP, handleApproveLP, handleTransaction };
}
