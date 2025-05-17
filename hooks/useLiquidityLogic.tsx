import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { usePriceState } from "@/state/priceStore";
import { useAccount, useChainId } from "wagmi";
import { useAccountState } from "@/state/accountStore";
import { useLiqudityState, useLiquidityActions } from "@/state/liquidityStore";
import { getProvider } from "@/services/getProvider";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { ROUTER_ADDRESS } from "@/lib/constants";
import { useTxToast } from "./useToast";

function extractAddress(param: string): string {
  const decoded = decodeURIComponent(param); // e.g., "token0=0xABC..."
  return decoded.split("=")[1] ?? "";
}

export function useAddLiquidityLogic(tokenA: string, tokenB: string) {
  // if (!tokenA || !tokenB) return;
  const tokenAAddress = useMemo(() => tokenA, [tokenA]);
  const tokenBAddress = useMemo(() => tokenB, [tokenB]);

  const chainId = useChainId();
  const { withToast } = useTxToast();
  const { updateTokenBalances } = useSwapActions();

  const latestTokenARequest = useRef(0);
  const latestTokenBRequest = useRef(0);
  const prevTokenAddresses = useRef({ tokenA: "", tokenB: "" });
  // const [tokenAAddress1, tokenBAddress1] = useMemo(() => {
  //   return [extractAddress(tokenA), extractAddress(tokenB)];
  // }, [tokenA, tokenB]);

  const { tokens } = useSwapState();
  const { prices } = usePriceState();
  const { isConnected, address, isDisconnected } = useAccount();
  const { provider, signer } = useAccountState();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expectedLPTokens, setExpectedLPTokens] = useState("0");
  const [poolShare, setPoolShare] = useState(0);

  const initialLoadCompleted = useRef(false);

  const { fetchPools } = useLiquidityActions();

  const {
    setPairFromAddresses,
    setTokenAAmount,
    setTokenBAmount,
    calculateTokenBAmount,
    calculateTokenAAmount,
    calculateExpectedLpTokens,
    // addLiquidity,
    setNeedsApprovalTokenA,
    setIsApprovingTokenA,
    setNeedsApprovalTokenB,
    setIsApprovingTokenB,
    resetForm,
    setTokenA,
    setTokenB,
    getUserBalances,
    setTokenALoading,
    setTransactionButtonText,
    setTransactionTokenAButtonText,
    setTransactionTokenBButtonText,
    setTokenBLoading,
    setisAddingLiquidity,
    setSlippage,
    setDeadline,
  } = useLiquidityActions();

  const {
    selectedTokenA,
    selectedTokenB,
    selectedPool,
    tokenAAmount,
    selectedTokenABalance,
    selectedTokenBBalance,
    isUserTokenbalance,
    tokenBAmount,
    isAddingLiquidity,
    needsApprovalTokenA,
    isApprovingTokenA,
    needsApprovalTokenB,
    isApprovingTokenB,
    slippage,
    deadline,
  } = useLiqudityState();

  // Set tokenA and tokenB
  const { memoizedTokenA, memoizedTokenB } = useMemo(() => {
    const TokenA = tokens.find((item) => item.address == tokenAAddress);
    const TokenB = tokens.find((item) => item.address == tokenBAddress);
    return { memoizedTokenA: TokenA, memoizedTokenB: TokenB };
  }, [tokens, tokenAAddress, tokenBAddress]);

  useEffect(() => {
    if (!memoizedTokenA || !memoizedTokenB) return;
    setTokenA(memoizedTokenA);
    setTokenB(memoizedTokenB);
  }, [memoizedTokenA, memoizedTokenB]);

  // Load token pair
  useEffect(() => {
    if (
      initialLoadCompleted.current &&
      prevTokenAddresses.current.tokenA === tokenAAddress &&
      prevTokenAddresses.current.tokenB === tokenBAddress
    ) {
      return;
    }

    const loadTokenPair = async () => {
      let defaultProvider: ethers.Provider = !provider
        ? getProvider(chainId)
        : provider;

      let defaultProvidder = !provider ? defaultProvider : provider;

      setIsLoading(true);

      try {
        await setPairFromAddresses(
          defaultProvidder,
          tokenAAddress,
          tokenBAddress,
          chainId
        );

        prevTokenAddresses.current = {
          tokenA: tokenAAddress,
          tokenB: tokenBAddress,
        };
        initialLoadCompleted.current = true;
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load token pair:", err);
        setError("Failed to load token pair. Please try again.");
        setIsLoading(false);
      }
    };

    loadTokenPair();
  }, [provider, memoizedTokenA, memoizedTokenB, , chainId]);

  useEffect(() => {
    if (isDisconnected) {
      resetForm();
      initialLoadCompleted.current = false;
    }
  }, [isDisconnected, resetForm]);

  // Fetch balances
  useEffect(() => {
    async function init() {
      if (!address || !provider) return;
      await getUserBalances(address);
    }
    init();
  }, [address, signer, getUserBalances, provider]);

  // LP info
  const updateLpInfo = useCallback(async () => {
    if (
      !selectedPool ||
      !tokenAAmount ||
      !tokenBAmount ||
      !provider ||
      !address
    )
      return;

    try {
      const lpTokens = await calculateExpectedLpTokens(provider);
      setExpectedLPTokens(lpTokens);

      if (selectedPool.totalSupply && ethers.parseEther(lpTokens) > 0) {
        const lpTokensBigInt = ethers.parseEther(lpTokens);
        const totalSupplyBigInt = selectedPool.totalSupply;

        const newShareBigInt =
          (Number(lpTokensBigInt) * 10000) /
          Number(totalSupplyBigInt + lpTokensBigInt);

        const newShare = Number(newShareBigInt) / 100;
        setPoolShare(newShare);
      } else {
        setPoolShare(100);
      }
    } catch (err) {
      console.error("Error calculating LP tokens:", err);
    }
  }, [
    tokenAAmount,
    tokenBAmount,
    selectedPool,
    address,
    provider,
    calculateExpectedLpTokens,
  ]);
  useEffect(() => {
    updateLpInfo();
  }, [updateLpInfo]);

  const handleTokenAInput = async (amount: string) => {
    setTokenAAmount(amount);
    const callId = ++latestTokenARequest.current;

    try {
      if (amount && parseFloat(amount) > 0 && selectedPool) {
        const tokenBValue = await calculateTokenBAmount(provider!, amount);
        let calculateAmountB = tokenBValue?.tokenBValue;
        if (callId === latestTokenARequest.current && calculateAmountB) {
          setTokenBAmount(calculateAmountB!?.toString());
        }
      } else {
        setTokenBAmount("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleTokenBInput = async (amount: string) => {
    setTokenBAmount(amount);
    const callId = ++latestTokenBRequest.current;

    try {
      if (amount && parseFloat(amount) > 0 && selectedPool) {
        const tokenAValue = await calculateTokenAAmount(provider!, amount);
        let calculateAmountA = tokenAValue?.tokenAValue;
        if (callId === latestTokenBRequest.current && calculateAmountA) {
          setTokenAAmount(calculateAmountA.toString());
        }
      } else {
        setTokenAAmount("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fixed checkApprovalTokenA function
  const checkApprovalTokenA = useCallback(async () => {
    if (!signer || !selectedTokenA?.address) {
      setNeedsApprovalTokenA(false);
      setTransactionTokenAButtonText("");
      return;
    }

    try {
      const tokenContract = new ethers.Contract(
        selectedTokenA.address,
        ERC20_ABI,
        signer
      );

      const signerAddress = await signer.getAddress();

      // Get actual balance from contract
      const balance = await tokenContract.balanceOf(signerAddress);

      const allowance = await tokenContract.allowance(
        signerAddress,
        ROUTER_ADDRESS(chainId)
      );

      const amountWei = ethers.parseUnits(
        tokenAAmount || "0",
        selectedTokenA.decimals
      );

      // Handle 100% balance case - check if user is using near max balance
      const isFullBalance =
        tokenAAmount === selectedTokenABalance ||
        parseFloat(tokenAAmount) > parseFloat(selectedTokenABalance) * 0.99;

      // Check if balance is sufficient
      const balanceEnough = isFullBalance || balance > amountWei;
      const allowanceEnough = allowance > amountWei;

      if (!balanceEnough) {
        setNeedsApprovalTokenA(false);
        setTransactionTokenAButtonText(
          `Insufficient Balance ${selectedTokenA?.symbol}`
        );
      } else if (!allowanceEnough) {
        setNeedsApprovalTokenA(true);
        setTransactionTokenAButtonText(`Approve ${selectedTokenA?.symbol}`);
      } else {
        setNeedsApprovalTokenA(false);
        setTransactionTokenAButtonText("");
      }
    } catch (error) {
      console.error("Error checking approval:", error);
      setNeedsApprovalTokenA(false);
      setTransactionTokenAButtonText("");
    }
  }, [
    signer,
    selectedTokenA,
    tokenAAmount,
    selectedTokenABalance,
    chainId,
    setNeedsApprovalTokenA,
    setTransactionTokenAButtonText,
  ]);

  // Fixed checkApprovalTokenB function
  const checkApprovalTokenB = useCallback(async () => {
    if (!signer || !selectedTokenB?.address) {
      setNeedsApprovalTokenB(false);
      setTransactionTokenBButtonText("");
      return;
    }

    try {
      const tokenContract = new ethers.Contract(
        selectedTokenB.address,
        ERC20_ABI,
        signer
      );

      const signerAddress = await signer.getAddress();

      // Get actual balance from contract
      const balance = await tokenContract.balanceOf(signerAddress);

      const allowance = await tokenContract.allowance(
        signerAddress,
        ROUTER_ADDRESS(chainId)
      );

      const amountWei = ethers.parseUnits(
        tokenBAmount || "0",
        selectedTokenB.decimals
      );

      // Handle 100% balance case - check if user is using near max balance
      const isFullBalance =
        tokenBAmount === selectedTokenBBalance ||
        parseFloat(tokenBAmount) > parseFloat(selectedTokenBBalance) * 0.99;

      // Check if balance is sufficient
      const balanceEnough = isFullBalance || balance > amountWei;
      const allowanceEnough = allowance > amountWei;

      if (!balanceEnough) {
        setNeedsApprovalTokenB(false);
        setTransactionTokenBButtonText(
          `Insufficient Balance ${selectedTokenB?.symbol}`
        );
      } else if (!allowanceEnough) {
        setNeedsApprovalTokenB(true);
        setTransactionTokenBButtonText(`Approve ${selectedTokenB?.symbol}`);
      } else {
        setNeedsApprovalTokenB(false);
        setTransactionTokenBButtonText("");
      }
    } catch (error) {
      console.error("Error checking approval:", error);
      setNeedsApprovalTokenB(false);
      setTransactionTokenBButtonText("");
    }
  }, [
    signer,
    selectedTokenB,
    tokenBAmount,
    selectedTokenBBalance,
    chainId,
    setNeedsApprovalTokenB,
    setTransactionTokenBButtonText,
  ]);

  const handleAddLiquidity = async () => {
    if (!provider) {
      setError("No Provider");
      return;
    }
    if (!signer) {
      setError("No Signer");
      return;
    }

    if (!isConnected || !address) {
      setError("Please connect your wallet");
      return;
    }

    if (
      !tokenAAmount ||
      !tokenBAmount ||
      parseFloat(tokenAAmount) <= 0 ||
      parseFloat(tokenBAmount) <= 0
    ) {
      setError("Please enter valid amounts");
      return;
    }

    try {
      setisAddingLiquidity(true);
      setTransactionButtonText("Adding Liquidity...");

      // Check RPC node health first
      try {
        const blockNumber = await provider.getBlockNumber();
      } catch (rpcError) {
        setError("RPC endpoint may be unstable. Please try again later.");
        setisAddingLiquidity(false);
        setTransactionButtonText("Add Liquidity");
        return null;
      }

      const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60;

      if (!selectedTokenA || !selectedTokenB) {
        setError("Select tokens first");
        setisAddingLiquidity(false);
        return null;
      }

      const routerContract = new ethers.Contract(
        ROUTER_ADDRESS(chainId),
        ROUTER_ABI,
        signer
      );

      const userAddress = await signer.getAddress();

      const amountA = BigInt(
        ethers.parseUnits(tokenAAmount, selectedTokenA.decimals)
      );
      const amountB = BigInt(
        ethers.parseUnits(tokenBAmount, selectedTokenB.decimals)
      );

      // Calculate minimum amounts based on slippage tolerance
      const slippageFactor = (100 - slippage) / 100;
      const amountAMin = BigInt(Math.floor(Number(amountA) * slippageFactor));
      const amountBMin = BigInt(Math.floor(Number(amountB) * slippageFactor));

      // Get latest nonce, block and gas prices for optimal transaction settings
      const [currentNonce, block, feeData] = await Promise.all([
        provider.getTransactionCount(userAddress, "latest"),
        provider.getBlock("latest"),
        provider.getFeeData(),
      ]);

      // Set a higher gas limit
      const gasLimit = BigInt(500000); // Set a high fixed value instead of estimation

      // Create transaction with optimal parameters
      const txParams = {
        nonce: currentNonce,
        gasLimit: gasLimit,
        // Set gas price slightly higher than current to ensure faster processing
        gasPrice: feeData.gasPrice
          ? (feeData.gasPrice * BigInt(11)) / BigInt(10)
          : undefined,
      };

      // Add a small delay before sending transaction to ensure blockchain state is updated
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        await withToast(
          async () => {
            // Create and send the transaction with optimized parameters
            return routerContract.addLiquidity(
              selectedTokenA.address,
              selectedTokenB.address,
              amountA,
              amountB,
              amountAMin,
              amountBMin,
              userAddress,
              deadlineTimestamp,
              txParams
            );
          },
          "addLiquidity",
          {
            chainId: chainId,
            meta: {
              tokenAAmount: tokenAAmount,
              tokenASymbol: selectedTokenA.symbol,
              tokenBAmount: tokenBAmount,
              tokenBSymbol: selectedTokenB.symbol,
              aggregate: "+",
            },
            onSuccess: async (receipt: any) => {
              setTokenBAmount("");
              setTransactionButtonText("Add Liquidity");
              await updateTokenBalances(address, provider);
              // await fetchPools(provider)
              await getUserBalances(address);
            },
            onError: (error) => {
              console.error("Transaction error details:", error);
              setTransactionButtonText("Add Liquidity");
            },
          },
          `Liquidity ${selectedTokenA.symbol} + ${selectedTokenB.symbol}`
        );
      } catch (txError: any) {
        console.error("Transaction failed:", txError);

        // Enhanced error handling with more specific messages
        if (txError.message && txError.message.includes("user rejected")) {
          setError("Transaction was rejected by user");
        } else if (
          txError.message &&
          txError.message.includes("insufficient funds")
        ) {
          setError("Insufficient funds for transaction");
        } else if (txError.message && txError.message.includes("nonce")) {
          setError(
            "Transaction nonce issue. Please wait a moment and try again"
          );
        } else {
          setError(`Transaction failed: ${txError.message || "Unknown error"}`);
        }

        setisAddingLiquidity(false);
        setTransactionButtonText("Add Liquidity");
        return null;
      }

      resetForm();
      await getUserBalances(address);
      await fetchPools(provider);
      setisAddingLiquidity(false);
    } catch (err: any) {
      console.error("Failed to add liquidity:", err);

      // Try to extract more meaningful error information
      let errorMessage = "Failed to add liquidity. Please try again.";
      if (err.error && err.error.message) {
        errorMessage = err.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setisAddingLiquidity(false);
      setTransactionButtonText("Add Liquidity");
      return null;
    }
  };
  //new
  const approveTokenA = useCallback(
    async (tokenAmountA: string) => {
      if (!signer || !provider || !selectedTokenA?.address) return;

      try {
        setIsApprovingTokenA(true);
        setTransactionTokenAButtonText("Approving...");
        const userAddress = await signer.getAddress();
        try {
          const blockNumber = await provider.getBlockNumber();
        } catch (rpcError) {
          return null;
        }

        const tokenContract = new ethers.Contract(
          selectedTokenA.address,
          ERC20_ABI,
          signer
        );

        // For safety, only approve the exact amount needed (plus a small buffer)
        const amountToApprove = ethers.parseUnits(
          tokenAmountA,
          selectedTokenA?.decimals
        );
        const [currentNonce, block, feeData] = await Promise.all([
          provider.getTransactionCount(userAddress, "latest"),
          provider.getBlock("latest"),
          provider.getFeeData(),
        ]);

        // Set a higher gas limit
        const gasLimit = BigInt(500000); // Set a high fixed value instead of estimation

        // Create transaction with optimal parameters
        const txParams = {
          nonce: currentNonce,
          gasLimit: gasLimit,
          // Set gas price slightly higher than current to ensure faster processing
          gasPrice: feeData.gasPrice
            ? (feeData.gasPrice * BigInt(11)) / BigInt(10)
            : undefined,
        };

        // Add a small delay before sending transaction to ensure blockchain state is updated
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // For better UX, we could approve a large amount (MAX_UINT256)
        // const amountToApprove = ethers.MaxUint256;

        await withToast(
          async () => {
            return tokenContract.approve(
              ROUTER_ADDRESS(chainId),
              amountToApprove,
              txParams
            );
          },
          "approve",
          {
            chainId: chainId,
            meta: {
              tokenAAmount: tokenAmountA,
              tokenASymbol: selectedTokenA?.symbol,
            },
          }
        );

        // Check approval again after transaction completes
        await checkApprovalTokenA();
      } catch (error) {
        console.error("Error approving token:", error);
        setTransactionTokenAButtonText(`Approve ${selectedTokenA?.symbol}`);
      } finally {
        setIsApprovingTokenA(false);
      }
    },
    [
      selectedTokenA,
      signer,
      chainId,
      setIsApprovingTokenA,
      setTransactionTokenAButtonText,
      checkApprovalTokenA,
    ]
  );

  const approveTokenB = useCallback(
    async (tokenAmountB: string) => {
      if (!signer || !provider || !selectedTokenB?.address) return;

      try {
        setIsApprovingTokenB(true);
        setTransactionTokenBButtonText("Approving...");
        const userAddress = await signer.getAddress();
        try {
          const blockNumber = await provider.getBlockNumber();
        } catch (rpcError) {
          return null;
        }
        const tokenContract = new ethers.Contract(
          selectedTokenB.address,
          ERC20_ABI,
          signer
        );

        // For safety, only approve the exact amount needed (plus a small buffer)
        const amountToApprove = ethers.parseUnits(
          tokenAmountB,
          selectedTokenB?.decimals
        );

        // For better UX, we could approve a large amount (MAX_UINT256)
        // const amountToApprove = ethers.MaxUint256;
        const [currentNonce, block, feeData] = await Promise.all([
          provider.getTransactionCount(userAddress, "latest"),
          provider.getBlock("latest"),
          provider.getFeeData(),
        ]);

        // Set a higher gas limit
        const gasLimit = BigInt(500000); // Set a high fixed value instead of estimation

        // Create transaction with optimal parameters
        const txParams = {
          nonce: currentNonce,
          gasLimit: gasLimit,
          // Set gas price slightly higher than current to ensure faster processing
          gasPrice: feeData.gasPrice
            ? (feeData.gasPrice * BigInt(11)) / BigInt(10)
            : undefined,
        };

        // Add a small delay before sending transaction to ensure blockchain state is updated
        await new Promise((resolve) => setTimeout(resolve, 2000));

        await withToast(
          async () => {
            return tokenContract.approve(
              ROUTER_ADDRESS(chainId),
              amountToApprove
            );
          },
          "approve",
          {
            chainId: chainId,
            meta: {
              tokenAAmount: tokenAmountB,
              tokenASymbol: selectedTokenB?.symbol,
            },
          }
        );

        // Check approval again after transaction completes
        await checkApprovalTokenB();
      } catch (error) {
        console.error("Error approving token:", error);
        setTransactionTokenBButtonText(`Approve ${selectedTokenB?.symbol}`);
      } finally {
        setIsApprovingTokenB(false);
      }
    },
    [
      selectedTokenB,
      signer,
      chainId,
      setIsApprovingTokenB,
      setTransactionTokenBButtonText,
      checkApprovalTokenB,
    ]
  );

  const tokenAUsdValue = useMemo(() => {
    if (!selectedTokenA || !tokenAAmount || !prices) return null;
    const symbol =
      selectedTokenA.symbol === "WETH" ? "ETH" : selectedTokenA.symbol;
    const price = prices?.[`${symbol}_USD`];
    return price ? parseFloat(tokenAAmount.toString()) * price : null;
  }, [selectedTokenA, tokenAAmount, prices]);

  const tokenBUsdValue = useMemo(() => {
    if (!selectedTokenB || !tokenBAmount || !prices) return null;
    const symbol =
      selectedTokenB.symbol === "WETH" ? "ETH" : selectedTokenB.symbol;
    const price = prices?.[`${symbol}_USD`];
    return price ? parseFloat(tokenBAmount.toString()) * price : null;
  }, [selectedTokenB, tokenBAmount, prices]);

  useEffect(() => {
    const checkApprovals = async () => {
      if (
        signer &&
        selectedTokenA?.address &&
        tokenAAmount &&
        parseFloat(tokenAAmount) > 0
      ) {
        await checkApprovalTokenA();
      }

      if (
        signer &&
        selectedTokenB?.address &&
        tokenBAmount &&
        parseFloat(tokenBAmount) > 0
      ) {
        await checkApprovalTokenB();
      }
    };

    checkApprovals();
  }, [
    signer,
    tokenAAmount,
    tokenBAmount,
    selectedTokenA?.address,
    selectedTokenB?.address,
    checkApprovalTokenA,
    checkApprovalTokenB,
  ]);

  const handleApproveTokenA = useCallback(async () => {
    if (needsApprovalTokenA) {
      await approveTokenA(tokenAAmount);
    }
  }, [needsApprovalTokenA, approveTokenA, tokenAAmount]);

  const handleApproveTokenB = useCallback(async () => {
    if (needsApprovalTokenB) {
      await approveTokenB(tokenBAmount);
    }
  }, [needsApprovalTokenB, approveTokenB, tokenBAmount]);

  const handleTransaction = useCallback(async () => {
    if (!needsApprovalTokenA && !needsApprovalTokenB) {
      await handleAddLiquidity();
    }
  }, [
    isConnected,
    tokenAAmount,
    tokenBAmount,
    needsApprovalTokenA,
    needsApprovalTokenB,
    handleAddLiquidity,
  ]);

  return {
    isLoading,
    error,
    tokenAUsdValue,
    tokenBUsdValue,
    selectedTokenA,
    selectedTokenB,
    tokenAAmount,
    tokenBAmount,
    handleTokenAInput,
    handleTokenBInput,
    handleAddLiquidity,
    handleApproveTokenA,
    handleApproveTokenB,
    poolShare,
    expectedLPTokens,
    slippage,
    setSlippage,
    deadline,
    setDeadline,
    selectedTokenABalance,
    selectedTokenBBalance,
    isUserTokenbalance,
    isAddingLiquidity,
    handleTransaction,
  };
}
