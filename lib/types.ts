import { Address, type Hex } from "viem";
import { EIP712TypedData } from "./signature";

// This interface is subject to change as the API V2 endpoints aren't finalized.
export interface PriceResponse {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  grossSellAmount: string;
  grossBuyAmount: string;
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
  sellToken: Address;
  buyToken: Address;
  sellAmount: string;
  buyAmount: string;
  grossSellAmount: string;
  grossBuyAmount: string;
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
    buyToken: {
      buyTaxBps: string | null;
      sellTaxBps: string | null;
    };
    sellToken: {
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
  buyToken: string;
  sellToken: string;
  buyAmount: string;
  tradeDirection: "sell" | "buy";
  tokens: Token[];
  sellAmount: string;
  currentSellAsset: TokenDetail;
  currentBuyAsset: TokenDetail;
  selectorOpen: Boolean;
  slippage: number;
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
  setBuyToken: (token: string) => void;
  setSellToken: (token: string) => void;
  setBuyAmount: (amount: string) => void;
  setSelectorOpen: (isOpen: Boolean) => void;
  setTradeDirection: (direction: "sell" | "buy") => void;
  setSellAmount: (amount: string) => void;
  setCurrentBuyAsset: (token: TokenDetail) => void;
  setCurrentSellAsset: (token: TokenDetail) => void;
  setSlippage: (slippage: number) => void;
}

export interface TokenDetail {
  name: string;
  symbol: string;
  address: string;
  logoURI: string;
  decimals: number;
  chainId: number;
}
