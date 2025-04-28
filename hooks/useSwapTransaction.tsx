import { ethers, formatEther } from "ethers";
import { useEffect, useState, useCallback } from "react";
import { useSwapState, useSwapActions } from "@/state/swapStore";
import { useAccountState } from "@/state/accountStore";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { addressess } from "@/address";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";
import { useAccount } from "wagmi";
import { deadlineFormatted } from "@/lib/utils";

// Replace with your actual router address
const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export function useSwapTransactions() {
  const { chainId, address } = useAccount();
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
  } = useSwapState();
  const ROUTER_ADDRESS =
    addressess[getNetworkNameUsingChainId(chainId)].ROUTER_ADDRESS;
  const {
    setNeedsApproval,
    setQuoteLoading,
    setMinAmountOut,
    setTokenBAmount,
    setIsApproving,
    setIsSwapping,
    setTransactionButtonText,
    updateTokenBalances,
  } = useSwapActions();

  const { signer, provider } = useAccountState();
  const [quotedAmount, setQuotedAmount] = useState<string | null>(null);

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
      console.log({ needsApproval });
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

  // Get quote for token swap
  const getQuote = useCallback(async () => {
    if (
      !provider ||
      !TokenAAmount ||
      !currentSellAsset?.address ||
      !currentBuyAsset?.address ||
      parseFloat(TokenAAmount) === 0
    ) {
      setQuotedAmount(null);
      setTokenBAmount("");
      return;
    }
    console.log("after the getout if statement");
    try {
      setQuoteLoading(true);

      const routerContract = new ethers.Contract(
        ROUTER_ADDRESS,
        ROUTER_ABI,
        provider
      );

      const amountIn = ethers.parseUnits(
        TokenAAmount,
        currentSellAsset.decimals
      );
      const weth = await routerContract.WETH();
      console.log(weth);

      // Get amount out
      const amountsOut = await routerContract.getAmountsOut(amountIn, [
        currentSellAsset.address,
        currentBuyAsset.address,
      ]);

      const amountOut = amountsOut[1];
      const formattedAmountOut = ethers.formatUnits(
        amountOut,
        currentBuyAsset.decimals
      );

      setQuotedAmount(formattedAmountOut);
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

      // let deadlineTimestamp = deadlineFormatted();
      // let tokenAAddress = currentSellAsset.address;
      // let tokenBaddress = currentBuyAsset.address;
      // debugger;
      // const routeContract = new ethers.Contract(
      //   ROUTER_ADDRESS,
      //   ROUTER_ABI,
      //   signer
      // );

      // const tx3 =
      //   await routeContract.swapExactTokensForTokens.populateTransaction(
      //     amountIn,
      //     minAmountOut, // Min amount out with slippage
      //     [currentSellAsset.address, currentBuyAsset.address],
      //     address,
      //     deadlineTimestamp
      //   );
      // console.log({ tx3 });
      // // estimate the gas
      // const estimateGas = await provider.estimateGas(tx3);

      // const gasPrice = await provider.getFeeData(); // returns BigInt in wei

      // console.log(gasPrice, "gas price");
      // console.log(estimateGas, "estimated gas");

      // // If you want estimated fee in wei:
      // const estimatedFee = gasPrice.gasPrice
      //   ? estimateGas * gasPrice.gasPrice
      //   : 0;

      // console.log("Gas estimate (ETH):", ethers.formatEther(estimatedFee));
    } catch (error) {
      console.error("Error getting quote:", error);
      setQuotedAmount(null);
      setTokenBAmount("");
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
      const maxApproval = ethers.MaxUint256;

      const tx = await tokenContract.approve(ROUTER_ADDRESS, maxApproval);
      await tx.wait();

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
      !TokenAAmount ||
      !currentSellAsset?.address ||
      !currentBuyAsset?.address ||
      !quotedAmount ||
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

      // Execute the swap
      const tx = await routerContract.swapExactTokensForTokens(
        amountIn,
        minAmountOut.raw, // Min amount out with slippage
        [currentSellAsset.address, currentBuyAsset.address],
        signerAddress,
        deadlineTimestamp
      );

      await tx.wait();

      // Reset fields after successful swap
      setTokenBAmount("");
      setTransactionButtonText("Swap");
      updateTokenBalances();
    } catch (error) {
      console.error("Error executing swap:", error);
      setTransactionButtonText("Swap");
    } finally {
      setIsSwapping(false);
    }
  }, [
    signer,
    TokenAAmount,
    currentSellAsset,
    currentBuyAsset,
    quotedAmount,
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
      console.log(TokenAAmount, "inside the useeffect");

      const debounceTimer = setTimeout(() => {
        getQuote();
      }, 500); // Add debounce to avoid too many calls

      return () => clearTimeout(debounceTimer);
    }
  }, [signer, currentSellAsset, currentBuyAsset, TokenAAmount, getQuote]);
  // Check approval when tokens or amounts change
  useEffect(() => {
    console.log({ signer });
    if (signer && currentSellAsset?.address && TokenAAmount) {
      console.log("inside the checkapprove otken");
      if (!needsApproval) {
        checkApproval();
      }
    }
  }, [signer, currentSellAsset, TokenAAmount, checkApproval]);

  return {
    needsApproval,
    isApproving,
    isSwapping,
    quotedAmount,
    handleTransaction,
    checkApproval,
    getQuote,
    approveToken,
    executeSwap,
    quoteLoading: useSwapState().quoteLoading,
  };
}
