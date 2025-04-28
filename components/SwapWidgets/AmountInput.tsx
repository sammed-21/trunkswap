import React, { useState } from "react";
import TokenSelector from "./TokenSelector"; // Import the TokenSelector component
import walletBalance from "@/public/walletBalance.svg";
import dropdown from "@/public/dropdown.svg";
import Image from "next/image";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { TokenDetail } from "@/lib/types";
import { useAccount } from "wagmi";
import { Skeleton } from "../ui/skeleton";
interface AmountInputProps {
  title: string;
  token: string;
  Amount: string | number;
  walletBalanceAsset: string;
  currentTokenAsset: TokenDetail;
  setAmount: (amount: string) => void;
  setToken: (token: string) => void;
  loadingBalances: boolean;
  setCurrentTokenDetal: (token: TokenDetail) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  title,
  token,
  Amount,
  setAmount,
  setToken,
  loadingBalances,
  walletBalanceAsset,
  currentTokenAsset,
  setCurrentTokenDetal,
  readOnly = false,
  isLoading = false,
}) => {
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  //   const { setSelectorOpen } = useSwapActions();

  const { address } = useAccount();
  //   const { selectorOpen } = useSwapState()
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleTokenSelect = (selectedToken: any) => {
    setToken(selectedToken.symbol);
    setSelectorOpen(false);
    setCurrentTokenDetal(selectedToken);
  };

  return (
    <div className="p-4 bg-secondary border-primary border-[1px]  shadow-md w-full max-w-md relative">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-textpriamry">
            {title}
          </label>

          {address && (
            <>
              {loadingBalances ? (
                <>
                  <Skeleton className="w-[100px] h-[20px] rounded-none" />{" "}
                </>
              ) : (
                <span
                  onClick={() => setAmount(walletBalanceAsset)}
                  className="balance-display cursor-pointer"
                >
                  {" "}
                  {walletBalanceAsset} {currentTokenAsset?.symbol}
                </span>
              )}
            </>
          )}
        </div>
        <div className="relative  w-full justify-between flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="w-[100px] h-12 bg-primary" />
          ) : (
            <input
              type="text"
              className="w-full placeholder:text-textprimary pl-3  py-2 bg-transparent focus:none border-none text-2xl rounded-none"
              placeholder="0.00"
              value={Amount}
              readOnly={readOnly}
              onChange={handleAmountChange}
            />
          )}
          <div className="w-full flex justify-end">
            <button
              className="px-3 justify-between gap-1  w-fit relative flex py-2 bg-primary text-white items-center rounded"
              onClick={() => setSelectorOpen(true)}
            >
              <Image
                src={currentTokenAsset?.logoURI}
                width={20}
                height={20}
                alt={"image"}
              />{" "}
              {currentTokenAsset?.symbol || "Select Token"}
              <Image
                src={dropdown}
                className="invert object-contain"
                width={10}
                height={20}
                alt={"image"}
              />{" "}
            </button>
          </div>
        </div>
      </div>

      {selectorOpen && (
        <TokenSelector
          onSelect={handleTokenSelect}
          closeModal={() => setSelectorOpen(false)}
        />
      )}
    </div>
  );
};

export default AmountInput;
