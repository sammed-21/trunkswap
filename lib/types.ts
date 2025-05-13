import { Address, PublicClient, WalletClient, type Hex } from "viem";

import { UsePublicClientReturnType, UseWalletClientReturnType } from "wagmi";
import { Signer } from "ethers";
import { Provider } from "ethers";

// This interface is subject to change as the API V2 endpoints aren't finalized.
export interface PriceResponse {
  TokenA: string;
  TokenB: string;
  TokenAAmount: string;
  TokenBAmount: string;
  grossTokenAAmount: string;
  grossTokenBAmount: string;
  allowanceTarget: Address;
  route: [];
  fees: {
    integratorFee: {
      amount: string;
      token: string;
      type: "volume" | "gas";
    } | null;
    zeroExFee: {
      billingType: "on-chain" | "off-chain";
      feeAmount: string;
      feeToken: Address;
      feeType: "volume" | "gas";
    };
    gasFee: null;
  } | null;
  gas: string;
  gasPrice: string;
  auxiliaryChainData?: {
    l1GasEstimate?: number;
  };
}

export interface V2QuoteTransaction {
  data: Hex;
  gas: string | null;
  gasPrice: string;
  to: Address;
  value: string;
}
export type Prices = { [symbol: string]: number };

export interface SwapState {
  chartFlag: boolean;
  tokensWithBalances: Token[];
  chartActiveToken: string;
  isWalletConnected: any;
  TokenB: string;
  TokenA: string;
  TokenBAmount: string;
  tradeDirection: "sell" | "buy";
  tokens: Token[];
  TokenAAmount: string;
  currentSellAsset: Token;
  currentBuyAsset: Token;
  selectorOpen: Boolean;
  slippage: number | string | any;
  deadline: number;
  tokenABalance: string;
  tokenBBalance: string;
  loadingBalances: boolean;
  transactionButtonText: string;
  isSwapping: boolean;
  quoteLoading: boolean;
  needsApproval: boolean;
  isApproving: boolean;
  minAmountOut: {
    raw: bigint | null;
    formatted: string | null;
  };
  quoteAmount: bigint | null | string;
  estimatedFees: {
    estimatedFee: any | null;
    formatedEstimatedFee: any | null;
  };
  fee: string | null;
  priceImpact: string | null;
  TokenAUsdValue: number | null;
  TokenBUsdValue: number | null;
  TokenAUsdPrice: null | number;
  TokenBUsdPrice: null | number;
  prices?: Prices;
  exceedsBalanceError: boolean;
}
export interface Token {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
  balance?: string;
  usdValue?: number;
}
export interface SwapActions {
  setChartFlag: (chartFlag: boolean) => void;
  setTokens: (tokens: Token[]) => void;
  setTokenB: (token: string) => void;
  setTokenA: (token: string) => void;
  setTokenBAmount: (amount: string) => void;
  setSelectorOpen: (isOpen: Boolean) => void;
  setTradeDirection: (direction: "sell" | "buy") => void;
  setTokenAAmount: (amount: string) => void;
  setCurrentBuyAsset: (token: Token) => void;
  setCurrentSellAsset: (token: Token) => void;
  setSlippage: (slippage: number) => void;
  setDeadline: (deadline: number) => void;
  setTokenABalance: (tokenBalance: string) => void;
  setTokenBBalance: (tokenBalance: string) => void;
  setLoadingBalances: (isLoading: boolean) => void;
  setIsWalletConnected: (isConnected: boolean) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setQuoteLoading: (quoteLoading: boolean) => void;
  setNeedsApproval: (needsApproval: boolean) => void;
  setIsApproving: (isApproving: boolean) => void;
  setMinAmountOut: (minAmountOut: { raw: bigint; formatted: string }) => void;
  fetchTokenBalances: (walletAddress: string, provider: any) => Promise<void>;
  updateTokenBalances: (address: string, provider: any) => Promise<void>;
  setTransactionButtonText: (transactoinButtonText: string) => void;
  setQuoteAmount: (quoteAmount: string | null) => void;
  setEstimatedFees: (estimatedFees: {
    estimatedFees: any;
    formatedEstimatedFee: any;
  }) => void;
  setFee: (fee: string | null) => void;
  setPriceImpact: (priceImpact: string | null) => void;
  updateUsdValues: () => void;
  resetSwapState: () => void;
  setTokenBUsdValue: (amount: number | null | undefined) => void;
  setTokenAUsdValue: (amount: number | null | undefined) => void;
  setTokenAUsdPrice: (tokenUsdPrice: number | any) => void;
  setTokenBUsdPrice: (tokenUsdPrice: number | any) => void;
  setPrices: (prices: Prices) => void;
  setExceedsBalanceError: (exceedsBalanceError: boolean) => void;
  setChartActiveToken: (chartActiveToken: string) => void;
  fetchTokenBalanceFor: (
    token: Token,
    walletAddress: string,
    provider: Provider
  ) => Promise<Token>;
  fetchAllTokens: (walletAddress: string, provider: Provider) => void;
}

export interface TokenDetail {
  name: string;
  symbol: string;
  address: string;
  logoURI: string;
  decimals: number;
  chainId: number;
  balance?: string;
  usdValue?: number;
}

export interface TokenWithBalance extends TokenDetail {
  balance: string; // or BigNumber if you prefer
}

export interface AccountInfo {
  signer: UseWalletClientReturnType | undefined | null;
  provider: any | undefined;
  setSigner: (signer: any) => void;
  setProvider: (provider: any) => void;
  chainId: number | undefined | null;
  viemClient: any;
  setChainId: (chainId: undefined | number | null) => void;
  setViemClient: (viewClient: any) => void;
  resetAccountStore: () => void;
  // setSignerAndProvider: (signer: string, chainId: string | number) => void;
}
