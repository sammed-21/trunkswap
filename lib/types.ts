import { Address, PublicClient, WalletClient, type Hex } from "viem";
import { EIP712TypedData } from "./signature";
import { UsePublicClientReturnType, UseWalletClientReturnType } from "wagmi";
import { Signer } from "ethers";

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

// This interface is subject to change as the API V2 endpoints aren't finalized.
export interface QuoteResponse {
  TokenA: Address;
  TokenB: Address;
  TokenAAmount: string;
  TokenBAmount: string;
  grossTokenAAmount: string;
  grossTokenBAmount: string;
  gasPrice: string;
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
  auxiliaryChainData: {};
  to: Address;
  data: Hex;
  value: string;
  gas: string;
  permit2: {
    type: "Permit2";
    hash: Hex;
    eip712: EIP712TypedData;
  };
  transaction: V2QuoteTransaction;
  tokenMetadata: {
    TokenB: {
      buyTaxBps: string | null;
      sellTaxBps: string | null;
    };
    TokenA: {
      buyTaxBps: string | null;
      sellTaxBps: string | null;
    };
  };
}

export interface V2QuoteTransaction {
  data: Hex;
  gas: string | null;
  gasPrice: string;
  to: Address;
  value: string;
}

export interface SwapState {
  isWalletConnected: any;
  TokenB: string;
  TokenA: string;
  TokenBAmount: string;
  tradeDirection: "sell" | "buy";
  tokens: Token[];
  TokenAAmount: string;
  currentSellAsset: TokenDetail;
  currentBuyAsset: TokenDetail;
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
}
export interface Token {
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
}
export interface SwapActions {
  setTokens: (tokens: Token[]) => void;
  setTokenB: (token: string) => void;
  setTokenA: (token: string) => void;
  setTokenBAmount: (amount: string) => void;
  setSelectorOpen: (isOpen: Boolean) => void;
  setTradeDirection: (direction: "sell" | "buy") => void;
  setTokenAAmount: (amount: string) => void;
  setCurrentBuyAsset: (token: TokenDetail) => void;
  setCurrentSellAsset: (token: TokenDetail) => void;
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
}

export interface TokenDetail {
  name: string;
  symbol: string;
  address: string;
  logoURI: string;
  decimals: number;
  chainId: number;
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
