import React, { useState } from "react";
import TokenSelector from "./TokenSelector"; // Import the TokenSelector component
import dropdown from "@/public/dropdown.svg";
import Image from "next/image";
import { Token, TokenDetail } from "@/lib/types";
import { useAccount } from "wagmi";
import { Skeleton } from "../ui/skeleton";
import { formatUSD } from "@/services/priceFeed";
import { FormatUsd } from "../Common/FormatUsd";
import { useAccountState } from "@/state/accountStore";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
interface AmountInputProps {
  title: string;
  token: string;
  Amount: string | number;
  walletBalanceAsset: string;
  currentTokenAsset: Token;
  setAmount: (amount: string) => void;
  setToken: (token: string) => void;
  loadingBalances: boolean;
  setCurrentTokenDetal: (token: Token) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  tokenUsdValue: any;
  exceedsBalanceError?: boolean;
  isConnected?: boolean;
  setTokenBalance: (balance: string) => void;
  className: string;
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
  tokenUsdValue,
  readOnly = false,
  isLoading = false,
  exceedsBalanceError,
  setTokenBalance,
  isConnected,
  className,
}) => {
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  //   const { setSelectorOpen } = useSwapActions();
  const { address } = useAccount();
  const { provider } = useAccountState();

  //   const { selectorOpen } = useSwapState()
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty, numbers, or float values (e.g. "123", "123.45")

    setAmount(value);
  };

  const handleTokenSelect = (selectedToken: any) => {
    setToken(selectedToken.symbol);
    setSelectorOpen(false);
    setTokenBalance(selectedToken.balance);
    setCurrentTokenDetal(selectedToken);
  };

  return (
    <div
      className={cn(
        `p-4 ${
          exceedsBalanceError && isConnected
            ? "bg-error-secondary border-error-primary"
            : "border-primary bg-forground hover:border-accent"
        }  border-[1px]  hover:bg-background hover:border-accent shadow-md  w-full rounded-lg max-w-md relative`,
        className
      )}
    >
      <div className="mb-4   ">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-subtitle">
            {title}
          </label>

          {address && (
            <>
              {loadingBalances ? (
                <div className="">
                  <Skeleton className="w-[100px] h-[23px] rounded-lg" />{" "}
                </div>
              ) : (
                <span
                  onClick={() => setAmount(walletBalanceAsset)}
                  className="balance-display h-[23px]  cursor-pointer"
                >
                  {" "}
                  {walletBalanceAsset == "0"
                    ? currentTokenAsset.balance
                    : walletBalanceAsset}{" "}
                  {currentTokenAsset?.symbol}
                </span>
              )}
            </>
          )}
        </div>
        <div className="relative   w-full justify-between flex items-center gap-3">
          <div className="w-ful  max-w-[70%]">
            {isLoading ? (
              <Skeleton className="w-[100px] h-10 bg-primary" />
            ) : (
              <input
                type="text"
                className={`truncate appearance-none dark:text-slate-50 text-gray-900 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 w-full !ring-0 !outline-none min-h-[40px] h-[40px] py-2 border-0 bg-transparent p-0 py-1 !text-3xl font-medium flex-grow flex-1 !outline-none !ring-0`}
                // className={`w-full placeholder:text-textprimary   py-2 bg-transparent text-title focus:none border-none text-2xl rounded-lg`}
                placeholder="0.00"
                value={Amount}
                pattern="\d*\.?\d*"
                inputMode="decimal"
                readOnly={readOnly}
                onChange={handleAmountChange}
              />
            )}
            <span className="text-xl text-textpriamry font-medium">
              {exceedsBalanceError && isConnected ? (
                <h1 className="text-error-primary">Exceeds Balance</h1>
              ) : (
                <>{FormatUsd(tokenUsdValue)}</>
              )}
            </span>
          </div>
          <div className="w-full max-w-[30%] pr-2 pl-2 flex justify-end">
            <Button
              variant={"transparent"}
              className=" justify-between gap-1 px-2   w-full relative flex py-2 bg-background dark:text-title text-title items-center "
              onClick={() => setSelectorOpen(true)}
            >
              <Image
                src={
                  currentTokenAsset?.logoURI
                    ? currentTokenAsset?.logoURI
                    : `/tokens/${currentTokenAsset.symbol.toLowerCase()}.svg`
                }
                width={20}
                height={20}
                alt={"image"}
              />{" "}
              {currentTokenAsset?.symbol || "Select Token"}
              <Image
                src={dropdown}
                className="light:invert-1 dark:invert  object-contain"
                width={10}
                height={20}
                alt={"image"}
              />{" "}
            </Button>
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
