import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useSwapState } from "@/state/swapStore";
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
  const router = useRouter();
  const chainId = useChainId();
  const { withToast } = useTxToast();

  const latestTokenARequest = useRef(0);
  const latestTokenBRequest = useRef(0);

  const [tokenAAddress, tokenBAddress] = useMemo(() => {
    return [extractAddress(tokenA), extractAddress(tokenB)];
  }, [tokenA, tokenB]);

  const { tokens } = useSwapState();
  const { prices } = usePriceState();
  const { isConnected, address, isDisconnected } = useAccount();
  const { provider, signer } = useAccountState();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expectedLPTokens, setExpectedLPTokens] = useState("0");
  const [poolShare, setPoolShare] = useState(0);

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
  useEffect(() => {
    let TokenA = tokens.find((item) => item.address == tokenAAddress);
    let TokenB = tokens.find((item) => item.address == tokenBAddress);
    if (!TokenA || !TokenB) return;
    setTokenA(TokenA);
    setTokenB(TokenB);
  }, [tokenAAddress, tokenBAddress]);

  // Load token pair
  useEffect(() => {
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

        let TokenA = tokens.find((item) => item.address == tokenAAddress);
        let TokenB = tokens.find((item) => item.address == tokenBAddress);
        if (!TokenA || !TokenB) return;

        setTokenA(TokenA);
        setTokenB(TokenB);

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load token pair:", err);
        setError("Failed to load token pair. Please try again.");
        setIsLoading(false);
      }
    };

    loadTokenPair();

    return () => {
      resetForm();
    };
  }, [provider, tokenAAddress, tokenBAddress]);
  useEffect(() => {
    resetForm();
  }, [isDisconnected]);
  // Fetch balances
  useEffect(() => {
    async function init() {
      if (!address || !provider) return;
      await getUserBalances(address);
    }
    init();
  }, [address, signer, selectedTokenABalance, selectedTokenBBalance]);

  // LP info
  useEffect(() => {
    const updateLpInfo = async () => {
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
    };

    updateLpInfo();
  }, [
    tokenAAmount,
    tokenBAmount,
    selectedPool,
    address,
    provider,
    calculateExpectedLpTokens,
  ]);

  //   const handleTokenAInput = async (amount: string) => {
  //     setTokenAAmount(amount);

  //     try {
  //       if (amount && parseFloat(amount) > 0 && selectedPool) {
  //         const tokenBValue = await calculateTokenBAmount(provider!, amount);
  //         setTokenBAmount(tokenBValue!);
  //       } else {
  //         setTokenBAmount("");
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

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
  //   const checkApprovalTokenA = useCallback(async () => {
  //     if (!signer || !selectedTokenA?.address) {
  //       setNeedsApprovalTokenA(false);
  //       setTransactionTokenAButtonText("");
  //       return;
  //     }

  //     try {
  //       const tokenContract = new ethers.Contract(
  //         selectedTokenA.address,
  //         ERC20_ABI,
  //         signer
  //       );

  //       const signerAddress = await signer.getAddress();

  //       const allowance = await tokenContract.allowance(
  //         signerAddress,
  //         ROUTER_ADDRESS(chainId)
  //       );

  //       const amountWei = ethers.parseUnits(
  //         tokenAAmount || "0",
  //         selectedTokenA.decimals
  //       );

  //       const balanceEnough = selectedTokenABalance >= tokenAAmount;
  //       const allowanceEnough = allowance >= amountWei;

  //       if (!balanceEnough) {
  //         setNeedsApprovalTokenA(false);
  //         setTransactionTokenAButtonText(
  //           `Insufficient Balance ${selectedTokenA?.symbol}`
  //         );
  //       } else if (!allowanceEnough) {
  //         setNeedsApprovalTokenA(true);
  //         setTransactionTokenAButtonText(`Approve ${selectedTokenA?.symbol}`);
  //       } else {
  //         setNeedsApprovalTokenA(false);
  //         setTransactionTokenAButtonText("");
  //       }
  //     } catch (error) {
  //       console.error("Error checking approval:", error);
  //       setNeedsApprovalTokenA(false);
  //       setTransactionTokenAButtonText("");
  //     }
  //   }, [
  //     selectedTokenA,
  //     tokenAAmount,
  //     selectedTokenABalance,
  //     signer,
  //     chainId,
  //     setNeedsApprovalTokenA,
  //     setTransactionTokenAButtonText,
  //   ]);

  //   //check token B approval

  //   const checkApprovalTokenB = useCallback(async () => {
  //     if (!signer || !selectedTokenB?.address) {
  //       setNeedsApprovalTokenB(false);
  //       setTransactionTokenBButtonText("");
  //       return;
  //     }

  //     try {
  //       const tokenContract = new ethers.Contract(
  //         selectedTokenB.address,
  //         ERC20_ABI,
  //         signer
  //       );

  //       const signerAddress = await signer.getAddress();

  //       const allowance = await tokenContract.allowance(
  //         signerAddress,
  //         ROUTER_ADDRESS(chainId)
  //       );

  //       const amountWei = ethers.parseUnits(
  //         tokenBAmount || "0",
  //         selectedTokenB.decimals
  //       );

  //       const balanceEnough =
  //         Number(selectedTokenBBalance) >= Number(tokenBAmount);
  //       const allowanceEnough = allowance >= amountWei;

  //       if (!balanceEnough) {
  //         setNeedsApprovalTokenB(false);
  //         setTransactionTokenBButtonText(
  //           `Insufficient Balance ${selectedTokenB?.symbol}`
  //         );
  //       } else if (!allowanceEnough) {
  //         setNeedsApprovalTokenB(true);
  //         setTransactionTokenBButtonText(`Approve ${selectedTokenB?.symbol}`);
  //       } else {
  //         setNeedsApprovalTokenB(false);
  //         setTransactionTokenBButtonText("");
  //       }
  //     } catch (error) {
  //       console.error("Error checking approval:", error);
  //       setNeedsApprovalTokenB(false);
  //       setTransactionTokenBButtonText("");
  //     }
  //   }, [
  //     selectedTokenB,
  //     tokenBAmount,
  //     selectedTokenBBalance,
  //     signer,
  //     chainId,
  //     setNeedsApprovalTokenB,
  //     setTransactionTokenBButtonText,
  //   ]);

  //   const handleAddLiquidity = async () => {
  //     if (!provider) {
  //       setError("No Provider");
  //       return;
  //     }
  //     if (!isConnected || !address) {
  //     }

  //     if (
  //       !tokenAAmount ||
  //       !tokenBAmount ||
  //       parseFloat(tokenAAmount) <= 0 ||
  //       parseFloat(tokenBAmount) <= 0
  //     ) {
  //       setError("Please enter valid amounts");
  //       return;
  //     }

  //     try {
  //       const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60;

  //       if (!provider) return null;
  //       if (
  //         !selectedTokenA ||
  //         !selectedTokenB ||
  //         !tokenAAmount ||
  //         !tokenBAmount
  //       ) {
  //         console.log({ error: "Please enter valid token amounts" });
  //         return null;
  //       }

  //       try {
  //         setisAddingLiquidity(true);

  //         const routerContract = new ethers.Contract(
  //           ROUTER_ADDRESS(chainId),
  //           ROUTER_ABI,
  //           signer
  //         );

  //         // Approve tokens if needed
  //         const tokenAContract = new ethers.Contract(
  //           selectedTokenA.address,
  //           ERC20_ABI,
  //           signer
  //         );
  //         const tokenBContract = new ethers.Contract(
  //           selectedTokenB.address,
  //           ERC20_ABI,
  //           signer
  //         );

  //         const userAddress = await signer.getAddress();

  //         const amountA = ethers.parseUnits(
  //           tokenAAmount,
  //           selectedTokenA.decimals
  //         );
  //         const amountB = ethers.parseUnits(
  //           tokenBAmount,
  //           selectedTokenB.decimals
  //         );

  //         // Calculate minimum amounts (with 0.5% slippage)
  //         const amountAMin = (Number(amountA) * 995) / 1000;
  //         const amountBMin = (Number(amountB) * 995) / 1000;

  //         // Deadline 20 minutes from now
  //         // const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  //         // Add liquidity
  //         const tx = await routerContract.addLiquidity.staticCall(
  //           selectedTokenA.address,
  //           selectedTokenB.address,
  //           amountA,
  //           amountB,
  //           amountAMin,
  //           amountBMin,
  //           userAddress,
  //           deadlineTimestamp,
  //           { gasLimit: 3000000 }
  //         );
  //         const receipt = await tx.wait();

  //         // Reset form after successful transaction
  //         resetForm();

  //         // Refresh pools
  //         await fetchPools(provider);

  //         setisAddingLiquidity(false);
  //         return receipt.transactionHash;
  //       } catch (error) {
  //         console.error("Error adding liquidity:", error);
  //         setisAddingLiquidity(false);
  //         return null;
  //       }

  //       resetForm();
  //       router.push(`/pool/${selectedPool?.pairAddress}`);
  //     } catch (err: any) {
  //       console.error("Failed to add liquidity:", err);
  //       setError(err.message || "Failed to add liquidity. Please try again.");
  //     }
  //   };

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

  // Fixed handleAddLiquidity function
  const handleAddLiquidity = async () => {
    if (!provider) {
      setError("No Provider");
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

      const amountA = ethers.parseUnits(tokenAAmount, selectedTokenA.decimals);
      const amountB = ethers.parseUnits(tokenBAmount, selectedTokenB.decimals);

      // Calculate minimum amounts based on slippage tolerance
      const slippageFactor = (100 - slippage) / 100;
      const amountAMin = BigInt(Math.floor(Number(amountA) * slippageFactor));
      const amountBMin = BigInt(Math.floor(Number(amountB) * slippageFactor));

      // FIXED: Removed staticCall to actually execute the transaction
      // const tx = await routerContract.addLiquidity(
      //   selectedTokenA.address,
      //   selectedTokenB.address,
      //   amountA,
      //   amountB,
      //   amountAMin,
      //   amountBMin,
      //   userAddress,
      //   deadlineTimestamp,
      //   { gasLimit: 3000000 }
      // );
      await withToast(
        async () => {
          // This function returns the transaction promise
          return routerContract.addLiquidity(
            selectedTokenA.address,
            selectedTokenB.address,
            amountA,
            amountB,
            amountAMin,
            amountBMin,
            userAddress,
            deadlineTimestamp,
            { gasLimit: 3000000 }
          );
        },
        "addLiquidity", // Transaction type
        {
          // actionLabel:"Swap",
          chainId: chainId, // Replace with your network's chain ID
          meta: {
            tokenAAmount: tokenAAmount,
            tokenASymbol: `${selectedTokenA.symbol}`,
            tokenBAmount: tokenBAmount,
            tokenBSymbol: `${selectedTokenB.symbol}`,
            aggregate: "+",
          },
          // Optional callbacks
          onSuccess: async (receipt) => {
            // Clear form or update UI after successful swap
            // You could update balances here
            setTokenBAmount("");
            setTransactionButtonText("Add Liquidity");
            await getUserBalances(address);
          },
          onError: (error) => {
            setTransactionButtonText("Swap");
            // Any additional error handling specific to your app
          },
        },
        // Optional custom title
        `Liquidity ${selectedTokenA.symbol} +  ${selectedTokenB.symbol}`
      );
      // const receipt = await tx.wait();

      // Reset form after successful transaction
      resetForm();

      // Refresh pools
      await getUserBalances(address);
      await fetchPools(provider);

      setisAddingLiquidity(false);
      setTransactionButtonText("");

      //   router.push(`/pool/${selectedPool?.pairAddress}`);

      // return receipt.transactionHash;
    } catch (err: any) {
      console.error("Failed to add liquidity:", err);
      setError(err.message || "Failed to add liquidity. Please try again.");
      setisAddingLiquidity(false);
      setTransactionButtonText("Add Liquidity");
      return null;
    }
  };
  //new
  const approveTokenA = useCallback(
    async (tokenAmountA: string) => {
      if (!signer || !selectedTokenA?.address) return;

      try {
        setIsApprovingTokenA(true);
        setTransactionTokenAButtonText("Approving...");

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

        // For better UX, we could approve a large amount (MAX_UINT256)
        // const amountToApprove = ethers.MaxUint256;

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
      if (!signer || !selectedTokenB?.address) return;

      try {
        setIsApprovingTokenB(true);
        setTransactionTokenBButtonText("Approving...");

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

  //old
  //   const approveTokenB = useCallback(
  //     async (tokenAmountB: any) => {
  //

  //       if (!signer || !selectedTokenB?.address) return;

  //       try {
  //         setIsApprovingTokenB(true);
  //         setTransactionTokenBButtonText("Approving...");

  //         const tokenContract = new ethers.Contract(
  //           selectedTokenB.address,
  //           ERC20_ABI,
  //           signer
  //         );

  //         // Max approval
  //         const amountToApprove = ethers.parseUnits(
  //           tokenAmountB,
  //           selectedTokenB?.decimals
  //         );

  //         const tx = await tokenContract.approve(
  //           ROUTER_ADDRESS(chainId),
  //           amountToApprove
  //         );
  //         await tx.wait();

  //         // Check approval again
  //         await checkApprovalTokenB();
  //       } catch (error) {
  //         console.error("Error approving token:", error);
  //         setTransactionTokenBButtonText("Approve");
  //       } finally {
  //         setIsApprovingTokenB(false);
  //       }
  //     },
  //     [
  //       selectedTokenB,
  //       signer,
  //       setIsApprovingTokenB,
  //       setTransactionTokenBButtonText,
  //       checkApprovalTokenB,
  //     ]
  //   );

  //   const approveTokenA = useCallback(
  //     async (tokenAmountA: any) => {
  //       if (!signer || !selectedTokenA?.address) return;

  //       try {
  //         setIsApprovingTokenA(true);
  //         setTransactionTokenAButtonText("Approving...");

  //         const tokenContract = new ethers.Contract(
  //           selectedTokenA.address,
  //           ERC20_ABI,
  //           signer
  //         );

  //         // Max approval

  //         const amountToApprove = ethers.parseUnits(
  //           tokenAmountA,
  //           selectedTokenA?.decimals
  //         );

  //         const tx = await tokenContract.approve(
  //           ROUTER_ADDRESS(chainId),
  //           amountToApprove
  //         );
  //         await tx.wait();

  //         // Check approval again
  //         await checkApprovalTokenA();
  //       } catch (error) {
  //         console.error("Error approving token:", error);
  //         setTransactionTokenAButtonText("Approve");
  //       } finally {
  //         setIsApprovingTokenA(false);
  //       }
  //     },
  //     [
  //       selectedTokenB,
  //       signer,
  //       setIsApprovingTokenA,
  //       setTransactionTokenAButtonText,
  //       checkApprovalTokenA,
  //     ]
  //   );

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
