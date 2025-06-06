import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  isETH,
  isWETHAddress,
  ROUTER_ADDRESS,
  TOKENS_BY_CHAIN_AND_SYMBOL,
  WETH_ADDRESS,
} from "@/lib/constants";
import { useTxToast } from "./useToast";
import { calculateMinimumAmount, safeParseUnits } from "@/lib/utils";
import { universalFormatDisplay, universalParseUnits } from "@/lib/truncate";

function extractAddress(param: string): string {
  const decoded = decodeURIComponent(param); // e.g., "token0=0xABC..."
  return decoded.split("=")[1] ?? "";
}

export function useAddLiquidityLogic(token0: string, token1: string) {
  // if (!token0 || !token1) return;
  const tokenAAddress = useMemo(() => token0, [token0]);
  const tokenBAddress = useMemo(() => token1, [token1]);

  const chainId = useChainId();
  const { withToast } = useTxToast();
  const { updateTokenBalances } = useSwapActions();

  const latestTokenARequest = useRef(0);
  const latestTokenBRequest = useRef(0);
  const prevTokenAddresses = useRef({ token0: "", token1: "" });
  // const [tokenAAddress1, tokenBAddress1] = useMemo(() => {
  //   return [extractAddress(token0), extractAddress(token1)];
  // }, [token0, token1]);
  const [tokenAInputState, setTokenAInputState] = useState({
    isValid: true,
    warning: "",
    error: "",
    wasTruncated: false,
  });

  const [tokenBInputState, setTokenBInputState] = useState({
    isValid: true,
    warning: "",
    error: "",
    wasTruncated: false,
  });
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
    setToken0,
    setToken1,
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
    selectedToken0,
    selectedToken1,
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

  // Set token0 and token1
  const { memoizedTokenA, memoizedTokenB } = useMemo(() => {
    let token0;
    let token1;
    if (isWETHAddress(tokenAAddress, chainId)) {
      token0 = TOKENS_BY_CHAIN_AND_SYMBOL[chainId]["eth"];
      token1 = tokens.find((item) => item.address == tokenBAddress);
    } else if (isWETHAddress(tokenBAddress, chainId)) {
      token0 = tokens.find((item) => item.address == tokenAAddress);
      token1 = TOKENS_BY_CHAIN_AND_SYMBOL[chainId]["eth"];
    } else {
      token0 = tokens.find((item) => item.address == tokenAAddress);
      token1 = tokens.find((item) => item.address == tokenBAddress);
    }
    return { memoizedTokenA: token0, memoizedTokenB: token1 };
  }, [tokens, tokenAAddress, tokenBAddress]);

  useEffect(() => {
    if (!memoizedTokenA || !memoizedTokenB) return;
    setToken0(memoizedTokenA);
    setToken1(memoizedTokenB);
  }, [memoizedTokenA, memoizedTokenB]);

  // Load token pair
  useEffect(() => {
    if (
      initialLoadCompleted.current &&
      prevTokenAddresses.current.token0 === tokenAAddress &&
      prevTokenAddresses.current.token1 === tokenBAddress
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
          token0: tokenAAddress,
          token1: tokenBAddress,
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
    if (!selectedToken0) return;
    const parseResult = universalParseUnits(
      amount,
      selectedToken0.decimals,
      prices[selectedToken0.symbol + "_USD"],
      selectedToken0.symbol
    );

    setTokenAInputState({
      isValid: parseResult.success,
      warning: parseResult.warning || "",
      error: parseResult.error || "",
      wasTruncated: parseResult.success || false,
    });
    const processedAmount = parseResult.displayAmount || amount;
    setTokenAAmount(processedAmount);

    const callId = ++latestTokenARequest.current;

    try {
      // Only proceed with calculations if input is valid
      if (
        parseResult.success &&
        processedAmount &&
        parseFloat(processedAmount) > 0 &&
        selectedPool
      ) {
        const tokenBValue = await calculateTokenBAmount(
          provider!,
          processedAmount
        );
        let calculateAmountB = tokenBValue?.tokenBValue;

        if (callId === latestTokenARequest.current && calculateAmountB) {
          // Also format the calculated Token B amount using our universal formatter
          if (!selectedToken1) return;
          const formattedTokenB = universalFormatDisplay(
            calculateAmountB,
            selectedToken1.decimals,
            prices[selectedToken1.symbol + "_USD"],
            selectedToken1.symbol
          );

          setTokenBAmount(formattedTokenB.fullPrecision);

          // Validate Token B as well (even though it's calculated)
          const tokenBParseResult = universalParseUnits(
            formattedTokenB.formatted,
            selectedToken1.decimals,
            prices[selectedToken1.symbol + "_USD"],
            selectedToken1.symbol
          );

          setTokenBInputState({
            isValid: tokenBParseResult.success,
            warning: tokenBParseResult.warning || "",
            error: tokenBParseResult.error || "",
            wasTruncated: false, // Calculated amounts shouldn't be truncated
          });
        }
      } else if (!parseResult.success) {
        // Clear Token B if Token A is invalid
        setTokenBAmount("");
        setTokenBInputState({
          isValid: true,
          warning: "",
          error: "",
          wasTruncated: false,
        });
      } else {
        // Clear Token B if Token A is empty
        setTokenBAmount("");
        setTokenBInputState({
          isValid: true,
          warning: "",
          error: "",
          wasTruncated: false,
        });
      }
    } catch (error) {
      console.log(error);
      // On calculation error, still keep the validated input but clear Token B
      setTokenBAmount("");
      setTokenBInputState({
        isValid: true,
        warning: "",
        error: "",
        wasTruncated: false,
      });
    }
    // setTokenAAmount(amount);
    // const callId = ++latestTokenARequest.current;

    // try {
    //   if (amount && parseFloat(amount) > 0 && selectedPool) {
    //     const tokenBValue = await calculateTokenBAmount(provider!, amount);
    //     let calculateAmountB = tokenBValue?.tokenBValue;
    //     if (callId === latestTokenARequest.current && calculateAmountB) {
    //       setTokenBAmount(calculateAmountB!?.toString());
    //     }
    //   } else {
    //     setTokenBAmount("");
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const handleTokenBInput = async (amount: string) => {
    // First, validate and potentially truncate the input
    if (!selectedToken1) return;
    const parseResult = universalParseUnits(
      amount,
      selectedToken1.decimals,
      prices[selectedToken1.symbol + "_USD"],
      selectedToken1.symbol
    );

    // Update input validation state
    setTokenBInputState({
      isValid: parseResult.success,
      warning: parseResult.warning || "",
      error: parseResult.error || "",
      wasTruncated: parseResult.success || false,
    });

    // Use the adjusted amount if it was truncated, otherwise use original
    const processedAmount = parseResult.displayAmount || amount;
    setTokenBAmount(processedAmount);

    const callId = ++latestTokenBRequest.current;

    try {
      // Only proceed with calculations if input is valid
      if (
        parseResult.success &&
        processedAmount &&
        parseFloat(processedAmount) > 0 &&
        selectedPool
      ) {
        const tokenAValue = await calculateTokenAAmount(
          provider!,
          processedAmount
        );
        let calculateAmountA = tokenAValue?.tokenAValue;
        if (!selectedToken0) return;

        if (callId === latestTokenBRequest.current && calculateAmountA) {
          // Also format the calculated Token A amount using our universal formatter
          const formattedTokenA = universalFormatDisplay(
            calculateAmountA,
            selectedToken0.decimals,
            prices[selectedToken0.symbol + "_USD"],
            selectedToken0.symbol
          );

          setTokenAAmount(formattedTokenA.fullPrecision);

          // Validate Token A as well (even though it's calculated)
          const tokenAParseResult = universalParseUnits(
            formattedTokenA.formatted,
            selectedToken0.decimals,
            prices[selectedToken0.symbol + "_USD"],
            selectedToken0.symbol
          );

          setTokenAInputState({
            isValid: tokenAParseResult.success,
            warning: tokenAParseResult.warning || "",
            error: tokenAParseResult.error || "",
            wasTruncated: false, // Calculated amounts shouldn't be truncated
          });
        }
      } else if (!parseResult.success) {
        // Clear Token A if Token B is invalid
        setTokenAAmount("");
        setTokenAInputState({
          isValid: true,
          warning: "",
          error: "",
          wasTruncated: false,
        });
      } else {
        // Clear Token A if Token B is empty
        setTokenAAmount("");
        setTokenAInputState({
          isValid: true,
          warning: "",
          error: "",
          wasTruncated: false,
        });
      }
    } catch (error) {
      console.log(error);
      // On calculation error, still keep the validated input but clear Token A
      setTokenAAmount("");
      setTokenAInputState({
        isValid: true,
        warning: "",
        error: "",
        wasTruncated: false,
      });
    }
  };
  // const handleTokenBInput = async (amount: string) => {
  //   setTokenBAmount(amount);
  //   const callId = ++latestTokenBRequest.current;

  //   try {
  //     if (amount && parseFloat(amount) > 0 && selectedPool) {
  //       const tokenAValue = await calculateTokenAAmount(provider!, amount);
  //       let calculateAmountA = tokenAValue?.tokenAValue;
  //       if (callId === latestTokenBRequest.current && calculateAmountA) {
  //         setTokenAAmount(calculateAmountA.toString());
  //       }
  //     } else {
  //       setTokenAAmount("");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // Fixed checkApprovalTokenA function
  const checkApprovalTokenA = useCallback(async () => {
    if (isETH(selectedToken0?.address)) {
      return false;
    }
    if (!signer || !selectedToken0?.address) {
      setNeedsApprovalTokenA(false);
      setTransactionTokenAButtonText("");
      return;
    }

    try {
      const tokenContract = new ethers.Contract(
        selectedToken0.address,
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
        selectedToken0.decimals
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
          `Insufficient Balance ${selectedToken0?.symbol}`
        );
      } else if (!allowanceEnough) {
        setNeedsApprovalTokenA(true);
        setTransactionTokenAButtonText(`Approve ${selectedToken0?.symbol}`);
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
    selectedToken0,
    tokenAAmount,
    selectedTokenABalance,
    chainId,
    setNeedsApprovalTokenA,
    setTransactionTokenAButtonText,
  ]);

  // Fixed checkApprovalTokenB function
  const checkApprovalTokenB = useCallback(async () => {
    if (isETH(selectedToken1?.address)) {
      return;
    }
    if (!signer || !selectedToken1?.address) {
      setNeedsApprovalTokenB(false);
      setTransactionTokenBButtonText("");
      return;
    }

    try {
      const tokenContract = new ethers.Contract(
        selectedToken1.address,
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
        selectedToken1.decimals
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
          `Insufficient Balance ${selectedToken1?.symbol}`
        );
      } else if (!allowanceEnough) {
        setNeedsApprovalTokenB(true);
        setTransactionTokenBButtonText(`Approve ${selectedToken1?.symbol}`);
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
    selectedToken1,
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

      if (!selectedToken0 || !selectedToken1) {
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

      // const amountAResult = safeParseUnits(
      //   tokenAAmount,
      //   selectedToken0.decimals
      // );

      // const amountBResult = safeParseUnits(
      //   tokenBAmount,
      //   selectedToken1.decimals
      // );
      const amountAResult = universalParseUnits(
        tokenAAmount,
        Number(selectedToken0.decimals),
        // selectedToken0.price,
        prices[selectedToken0.symbol + "_USD"],
        selectedToken0.symbol
      );

      const amountBResult = universalParseUnits(
        tokenBAmount,
        Number(selectedToken1.decimals),
        // selectedToken1.price,
        prices[selectedToken1.symbol + "_USD"],
        selectedToken1.symbol
      );

      if (!amountAResult.success || !amountBResult.success) {
        setError(
          `Invalid amount format: ${amountAResult.error || amountBResult.error}`
        );
        setisAddingLiquidity(false);
        setTransactionButtonText("Add Liquidity");
        return;
      }

      const amountA = amountAResult.value!;
      const amountB = amountBResult.value!;

      // Validate minimum amounts
      if (amountA === BigInt(0) || amountB === BigInt(0)) {
        setError("Amounts must be greater than 0");
        setisAddingLiquidity(false);
        setTransactionButtonText("Add Liquidity");
        return;
      }

      // Calculate minimum amounts based on slippage tolerance using safe BigInt operations
      const amountAMin = calculateMinimumAmount(amountA, slippage);
      const amountBMin = calculateMinimumAmount(amountB, slippage);

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
            // Check if one of the tokens is ETH
            const isToken0ETH = isETH(selectedToken0);
            const isToken1ETH = isETH(selectedToken1);
            if (isToken0ETH || isToken1ETH) {
              // ETH + Token liquidity
              const tokenAddress = isToken0ETH
                ? selectedToken1.address
                : selectedToken0.address;
              const tokenAmount = isToken0ETH ? amountB : amountA;
              const tokenAmountMin = isToken0ETH ? amountBMin : amountAMin;
              const ethAmount = isToken0ETH ? amountA : amountB;
              const ethAmountMin = isToken0ETH ? amountAMin : amountBMin;

              return routerContract.addLiquidityETH(
                tokenAddress, // token address
                tokenAmount, // token amount desired
                tokenAmountMin, // token amount min
                ethAmountMin, // ETH amount min
                userAddress, // to
                deadlineTimestamp, // deadline
                {
                  ...txParams,
                  value: ethAmount, // Send ETH as value
                }
              );
            } else {
              // Token + Token liquidity (original logic)
              return routerContract.addLiquidity(
                selectedToken0.address,
                selectedToken1.address,
                amountA,
                amountB,
                amountAMin,
                amountBMin,
                userAddress,
                deadlineTimestamp,
                txParams
              );
            }
          },
          "addLiquidity",
          {
            chainId: chainId,
            meta: {
              tokenAAmount: tokenAAmount,
              token0Symbol: selectedToken0.symbol,
              tokenBAmount: tokenBAmount,
              token1Symbol: selectedToken1.symbol,
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
          `Liquidity ${selectedToken0.symbol} + ${selectedToken1.symbol}`
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
      // try {
      //   await withToast(
      //     async () => {
      //       // Create and send the transaction with optimized parameters
      //       return routerContract.addLiquidity(
      //         selectedToken0.address,
      //         selectedToken1.address,
      //         amountA,
      //         amountB,
      //         amountAMin,
      //         amountBMin,
      //         userAddress,
      //         deadlineTimestamp,
      //         txParams
      //       );
      //     },
      //     "addLiquidity",
      //     {
      //       chainId: chainId,
      //       meta: {
      //         tokenAAmount: tokenAAmount,
      //         token0Symbol: selectedToken0.symbol,
      //         tokenBAmount: tokenBAmount,
      //         token1Symbol: selectedToken1.symbol,
      //         aggregate: "+",
      //       },
      //       onSuccess: async (receipt: any) => {
      //         setTokenBAmount("");
      //         setTransactionButtonText("Add Liquidity");
      //         await updateTokenBalances(address, provider);
      //         // await fetchPools(provider)
      //         await getUserBalances(address);
      //       },
      //       onError: (error) => {
      //         console.error("Transaction error details:", error);
      //         setTransactionButtonText("Add Liquidity");
      //       },
      //     },
      //     `Liquidity ${selectedToken0.symbol} + ${selectedToken1.symbol}`
      //   );
      // } catch (txError: any) {
      //   console.error("Transaction failed:", txError);

      //   // Enhanced error handling with more specific messages
      //   if (txError.message && txError.message.includes("user rejected")) {
      //     setError("Transaction was rejected by user");
      //   } else if (
      //     txError.message &&
      //     txError.message.includes("insufficient funds")
      //   ) {
      //     setError("Insufficient funds for transaction");
      //   } else if (txError.message && txError.message.includes("nonce")) {
      //     setError(
      //       "Transaction nonce issue. Please wait a moment and try again"
      //     );
      //   } else {
      //     setError(`Transaction failed: ${txError.message || "Unknown error"}`);
      //   }

      //   setisAddingLiquidity(false);
      //   setTransactionButtonText("Add Liquidity");
      //   return null;
      // }

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
      if (isETH(selectedToken0?.address)) {
        return false;
      }
      if (!signer || !provider || !selectedToken0?.address) return;

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
          selectedToken0.address,
          ERC20_ABI,
          signer
        );

        // For safety, only approve the exact amount needed (plus a small buffer)
        const amountToApprove = ethers.parseUnits(
          tokenAmountA,
          selectedToken0?.decimals
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
              token0Symbol: selectedToken0?.symbol,
            },
          }
        );

        // Check approval again after transaction completes
        await checkApprovalTokenA();
      } catch (error) {
        console.error("Error approving token:", error);
        setTransactionTokenAButtonText(`Approve ${selectedToken0?.symbol}`);
      } finally {
        setIsApprovingTokenA(false);
      }
    },
    [
      selectedToken0,
      signer,
      chainId,
      setIsApprovingTokenA,
      setTransactionTokenAButtonText,
      checkApprovalTokenA,
    ]
  );

  const approveTokenB = useCallback(
    async (tokenAmountB: string) => {
      if (isETH(selectedToken1?.address)) {
        return false;
      }
      if (!signer || !provider || !selectedToken1?.address) return;

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
          selectedToken1.address,
          ERC20_ABI,
          signer
        );

        // For safety, only approve the exact amount needed (plus a small buffer)
        const amountToApprove = ethers.parseUnits(
          tokenAmountB,
          selectedToken1?.decimals
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
              token0Symbol: selectedToken1?.symbol,
            },
          }
        );

        // Check approval again after transaction completes
        await checkApprovalTokenB();
      } catch (error) {
        console.error("Error approving token:", error);
        setTransactionTokenBButtonText(`Approve ${selectedToken1?.symbol}`);
      } finally {
        setIsApprovingTokenB(false);
      }
    },
    [
      selectedToken1,
      signer,
      chainId,
      setIsApprovingTokenB,
      setTransactionTokenBButtonText,
      checkApprovalTokenB,
    ]
  );

  const tokenAUsdValue = useMemo(() => {
    if (!selectedToken0 || !tokenAAmount || !prices) return null;
    const symbol =
      selectedToken0.symbol === "WETH" ? "ETH" : selectedToken0.symbol;
    const price = prices?.[`${symbol}_USD`];
    return price ? parseFloat(tokenAAmount.toString()) * price : null;
  }, [selectedToken0, tokenAAmount, prices]);

  const tokenBUsdValue = useMemo(() => {
    if (!selectedToken1 || !tokenBAmount || !prices) return null;
    const symbol =
      selectedToken1.symbol === "WETH" ? "ETH" : selectedToken1.symbol;
    const price = prices?.[`${symbol}_USD`];
    return price ? parseFloat(tokenBAmount.toString()) * price : null;
  }, [selectedToken1, tokenBAmount, prices]);

  useEffect(() => {
    const checkApprovals = async () => {
      if (
        signer &&
        selectedToken0?.address &&
        tokenAAmount &&
        parseFloat(tokenAAmount) > 0
      ) {
        await checkApprovalTokenA();
      }

      if (
        signer &&
        selectedToken1?.address &&
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
    selectedToken0?.address,
    selectedToken1?.address,
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
    selectedToken0,
    selectedToken1,
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
