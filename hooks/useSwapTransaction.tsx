import { ethers, formatEther, formatUnits, parseUnits } from "ethers";
import { useEffect, useState, useCallback } from "react";
import { useSwapState, useSwapActions } from "@/state/swapStore";
import { useAccountState } from "@/state/accountStore";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { addressess } from "@/address";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";
import { useAccount } from "wagmi";
import { deadlineFormatted } from "@/lib/utils";
import { getGasEstimation } from "@/services/getEstimatedGas";
import { getRouterContract } from "@/services/getContracts";
import { defaultChainId } from "@/lib/constants";
import { useTxToast } from "./useToast";

// Replace with your actual router address

export function useSwapTransactions() {
  // const { address } = useAccount();
  const { withToast } = useTxToast();
  const {
    currentSellAsset,
    currentBuyAsset,
    TokenAAmount,
    TokenBAmount,
    slippage,
    deadline,
    needsApproval,
    isSwapping,
    isApproving,
    minAmountOut,
    quoteAmount,
  } = useSwapState();
  const {
    setNeedsApproval,
    setQuoteLoading,
    setMinAmountOut,
    setTokenBAmount,
    setIsApproving,
    setIsSwapping,
    setTransactionButtonText,
    updateTokenBalances,
    setEstimatedFees,
    setQuoteAmount,
    setPriceImpact,
    setFee,
    resetSwapState,
  } = useSwapActions();

  const { signer, provider, chainId, address } = useAccountState();
  const ROUTER_ADDRESS =
    addressess[getNetworkNameUsingChainId(chainId)].ROUTER_ADDRESS;
  // Check if token is approved
  const checkApproval = useCallback(async () => {
    if (!signer || !currentSellAsset?.address) {
      setNeedsApproval(false);
      return;
    }

    try {
      const tokenContract = new ethers.Contract(
        currentSellAsset.address,
        ERC20_ABI,
        signer
      );

      const signerAddress = await signer.getAddress();
      const allowance = await tokenContract.allowance(
        signerAddress,
        ROUTER_ADDRESS
      );
      const amountWei = ethers.parseUnits(
        TokenAAmount || "0",
        currentSellAsset.decimals
      );

      let needsApproval;
      // Check if allowance is sufficient
      if (allowance < amountWei) {
        needsApproval = true;
      } else {
        needsApproval = false;
      }
      setNeedsApproval(needsApproval);

      if (needsApproval) {
        setTransactionButtonText("Approve");
      } else {
        setTransactionButtonText("Swap");
      }
    } catch (error) {
      console.error("Error checking approval:", error);
      setNeedsApproval(false);
      setTransactionButtonText("Swap");
    }
  }, [
    currentSellAsset,
    TokenAAmount,
    signer,
    setNeedsApproval,
    setTransactionButtonText,
  ]);
  const getV2PriceImpact = async (amountOut: bigint, amountIn: bigint) => {
    let routerContract = getRouterContract(chainId, provider);
    const pairAddress = await routerContract
      .factory()
      .then((factoryAddress) => {
        const factoryContract = new ethers.Contract(
          factoryAddress,
          [
            "function getPair(address tokenA, address tokenB) external view returns (address pair)",
          ],
          provider
        );
        return factoryContract.getPair(
          currentSellAsset.address,
          currentBuyAsset.address
        );
      });
    // Get reserves from pair contract
    const pairContract = new ethers.Contract(
      pairAddress,
      [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
        "function token0() external view returns (address)",
        "function token1() external view returns (address)",
      ],
      provider
    );
    const [reserve0, reserve1] = await pairContract.getReserves();
    const token0 = await pairContract.token0();

    // Determine which token is which in the reserves
    let reserveIn, reserveOut;
    if (token0.toLowerCase() === currentSellAsset.address.toLowerCase()) {
      reserveIn = reserve0;
      reserveOut = reserve1;
    } else {
      reserveIn = reserve1;
      reserveOut = reserve0;
    }

    // Calculate price impact using the Uniswap formula:
    // 1 - (amountOut * reserveIn) / (amountIn * reserveOut)
    const numerator = amountOut * reserveIn;
    const denominator = amountIn * reserveOut;
    const priceImpactBps =
      (1 - Number(numerator) / Number(denominator)) * 10000;
    const formattedPriceImpact = (priceImpactBps / 100).toFixed(2) + "%";

    return formattedPriceImpact;
  };
  // Get quote for token swap
  const getQuote = useCallback(async () => {
    if (
      !provider ||
      !TokenAAmount ||
      !currentSellAsset?.address ||
      !currentBuyAsset?.address ||
      parseFloat(TokenAAmount) === 0
    ) {
      setQuoteAmount(null);
      setTokenBAmount("");
      return;
    }
    try {
      setQuoteLoading(true);
      const routerContract = getRouterContract(chainId, provider);

      const amountIn = ethers.parseUnits(
        TokenAAmount,
        currentSellAsset.decimals
      );
      const feePercentage = 0.003; // 0.3%
      const feeAmountInTokenA = parseFloat(TokenAAmount) * feePercentage;
      setFee(feeAmountInTokenA.toString());
      const amountsOut = await routerContract.getAmountsOut(amountIn, [
        currentSellAsset.address,
        currentBuyAsset.address,
      ]);

      const amountOut = amountsOut[1];
      const formattedAmountOut = ethers.formatUnits(
        amountOut,
        currentBuyAsset.decimals
      );

      setQuoteAmount(formattedAmountOut);
      setTokenBAmount(formattedAmountOut);
      // Calculate minimum amount out with slippage
      const slippageMultiplier = (100 - slippage) / 100;
      const slippageBasisPoints = Math.floor(slippageMultiplier * 10000);
      const minAmountOut =
        (amountOut * BigInt(slippageBasisPoints)) / BigInt(10000);

      setMinAmountOut({
        raw: minAmountOut,
        formatted: ethers.formatUnits(minAmountOut, currentBuyAsset.decimals),
      });

      const priceImpact = await getV2PriceImpact(amountOut, amountIn);
      setPriceImpact(priceImpact);

      let deadlineTimestamp = deadlineFormatted(deadline);

      const routeContract = new ethers.Contract(
        ROUTER_ADDRESS,
        ROUTER_ABI,
        provider
      );

      const recipient = address ?? "0x000000000000000000000000000000000000dEaD";

      const tx3 =
        await routeContract.swapExactTokensForTokens.populateTransaction(
          amountIn,
          minAmountOut, // Min amount out with slippage
          [currentSellAsset.address, currentBuyAsset.address],
          recipient,
          deadlineTimestamp
        );
      const { estimatedFee, formatedEstimatedFee } = await getGasEstimation(
        tx3,
        provider
      );

      setEstimatedFees({
        estimatedFees: estimatedFee,
        formatedEstimatedFee,
      });
    } catch (error) {
      console.error("Error getting quote:", error);
      setQuoteAmount(null);
      setTokenBAmount("");
      // setEstimatedFee(null)
    } finally {
      setQuoteLoading(false);
    }
  }, [
    signer,
    TokenAAmount,
    currentSellAsset,
    currentBuyAsset,
    slippage,
    setQuoteLoading,
    setTokenBAmount,
    setMinAmountOut,
  ]);

  // Approve token spending
  const approveToken = useCallback(async () => {
    if (!signer || !currentSellAsset?.address) return;

    try {
      setIsApproving(true);
      setTransactionButtonText("Approving...");

      const tokenContract = new ethers.Contract(
        currentSellAsset.address,
        ERC20_ABI,
        signer
      );

      // Max approval
      // const maxApproval = ethers.MaxUint256;

      // const tx = await tokenContract.approve(ROUTER_ADDRESS, maxApproval);

      let formatedSellTokenApproval = parseUnits(
        TokenAAmount,
        currentSellAsset.decimals
      );
      // const maxApproval = ethers.MaxUint256;
      await withToast(
        async () => {
          return tokenContract.approve(
            ROUTER_ADDRESS,
            formatedSellTokenApproval
          );
        },
        "approve",
        {
          chainId: chainId,
          meta: {
            tokenAAmount: TokenAAmount,
            tokenASymbol: currentSellAsset.symbol,
          },
        }
      );

      // Check approval again
      await checkApproval();
    } catch (error) {
      console.error("Error approving token:", error);
      setTransactionButtonText("Approve");
    } finally {
      setIsApproving(false);
    }
  }, [
    currentSellAsset,
    signer,
    setIsApproving,
    setTransactionButtonText,
    checkApproval,
  ]);

  // Execute swap
  const executeSwap = useCallback(async () => {
    if (
      !signer ||
      !address ||
      !TokenAAmount ||
      !currentSellAsset?.address ||
      !currentBuyAsset?.address ||
      !quoteAmount ||
      !minAmountOut
    )
      return;

    try {
      setIsSwapping(true);
      setTransactionButtonText("Swapping...");

      const routerContract = new ethers.Contract(
        ROUTER_ADDRESS,
        ROUTER_ABI,
        signer
      );

      const signerAddress = await signer.getAddress();
      const amountIn = ethers.parseUnits(
        TokenAAmount,
        currentSellAsset.decimals
      );

      // Calculate deadline timestamp
      const deadlineTimestamp = deadlineFormatted(deadline); // deadline in minutes

      await withToast(
        async () => {
          // This function returns the transaction promise
          return routerContract.swapExactTokensForTokens(
            amountIn,
            minAmountOut.raw, // Min amount out with slippage
            [currentSellAsset.address, currentBuyAsset.address],
            signerAddress,
            deadlineTimestamp
          );
        },
        "swap", // Transaction type
        {
          // actionLabel:"Swap",
          chainId: chainId, // Replace with your network's chain ID
          meta: {
            tokenAAmount: TokenAAmount,
            tokenASymbol: `${currentSellAsset.symbol}`,
            tokenBAmount: TokenBAmount,
            tokenBSymbol: `${currentBuyAsset.symbol}`,
            aggregate: "→",
          },
          // Optional callbacks
          onSuccess: async (receipt) => {
            // Clear form or update UI after successful swap
            // You could update balances here
            setTokenBAmount("");
            setTransactionButtonText("Swap");
            await updateTokenBalances(address!, provider);
            resetSwapState();
          },
          onError: (error) => {
            setTransactionButtonText("Swap");
            // Any additional error handling specific to your app
          },
        },
        // Optional custom title
        `Swap ${currentSellAsset.symbol} for ${currentBuyAsset.symbol}`
      );
      // Reset fields after successful swap
      setTokenBAmount("");
      setTransactionButtonText("Swap");
      await updateTokenBalances(address!, provider);
      resetSwapState();
    } catch (error) {
      // console.error("Error executing swap:", error);
      setTransactionButtonText("Swap");
    } finally {
      setIsSwapping(false);
    }
  }, [
    signer,
    TokenAAmount,
    currentSellAsset,
    currentBuyAsset,
    quoteAmount,
    deadline,
    setIsSwapping,
    setTokenBAmount,
    setTransactionButtonText,
  ]);

  // Handle transaction button click
  const handleTransaction = useCallback(() => {
    if (needsApproval) {
      approveToken();
    } else {
      executeSwap();
    }
  }, [needsApproval, approveToken, executeSwap]);

  // Get quote when input changes
  useEffect(() => {
    if (currentSellAsset?.address && currentBuyAsset?.address && TokenAAmount) {
      const debounceTimer = setTimeout(() => {
        getQuote();
      }, 500); // Add debounce to avoid too many calls

      return () => clearTimeout(debounceTimer);
    }
  }, [signer, currentSellAsset, currentBuyAsset, TokenAAmount, getQuote]);
  // Check approval when tokens or amounts change
  useEffect(() => {
    if (signer && currentSellAsset?.address && TokenAAmount) {
      if (!needsApproval) {
        checkApproval();
      }
    }
  }, [signer, currentSellAsset, TokenAAmount, checkApproval]);

  return {
    needsApproval,
    isApproving,
    isSwapping,
    quoteAmount,
    handleTransaction,
    checkApproval,
    getQuote,
    approveToken,
    executeSwap,
    quoteLoading: useSwapState().quoteLoading,
  };
}
