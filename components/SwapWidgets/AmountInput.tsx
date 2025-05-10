import React, { useState } from "react";
import TokenSelector from "./TokenSelector"; // Import the TokenSelector component
import dropdown from "@/public/dropdown.svg";
import Image from "next/image";
import { TokenDetail } from "@/lib/types";
import { useAccount } from "wagmi";
import { Skeleton } from "../ui/skeleton";
import { formatUSD } from "@/services/priceFeed";
import { FormatUsd } from "../Common/FormatUsd";
import { useAccountState } from "@/state/accountStore";
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
  tokenUsdValue: any;
  exceedsBalanceError?: boolean;
  isConnected?: boolean;
  setTokenBalance: (balance: string) => void;
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
}) => {
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  //   const { setSelectorOpen } = useSwapActions();
  const { address } = useAccount();
  const { provider } = useAccountState();

  //   const { selectorOpen } = useSwapState()
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleTokenSelect = (selectedToken: any) => {
    setToken(selectedToken.symbol);

    setSelectorOpen(false);
    setTokenBalance(selectedToken.balance);
    setCurrentTokenDetal(selectedToken);
  };

  return (
    <div
      className={`p-4 ${
        exceedsBalanceError && isConnected
          ? "bg-error-secondary border-error-primary"
          : "border-primary bg-forground "
      }  border-[1px]  shadow-md w-full max-w-md relative`}
    >
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-subtitle">
            {title}
          </label>

          {address && (
            <>
              {loadingBalances ? (
                <div className="">
                  <Skeleton className="w-[100px] h-[23px] rounded-none" />{" "}
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
        <div className="relative  w-full justify-between flex items-center gap-3">
          <div className="w-full max-w-[70%]">
            {isLoading ? (
              <Skeleton className="w-[100px] h-10 bg-primary" />
            ) : (
              <input
                type="text"
                className={`truncate appearance-none dark:text-slate-50 text-gray-900 w-full !ring-0 !outline-none min-h-[40px] h-[40px] py-2 border-0 bg-transparent p-0 py-1 !text-3xl font-medium flex-grow flex-1 !outline-none !ring-0`}
                // className={`w-full placeholder:text-textprimary   py-2 bg-transparent text-title focus:none border-none text-2xl rounded-none`}
                placeholder="0.00"
                value={Amount}
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
            <button
              className=" justify-between gap-1 px-2   w-full relative flex py-2 bg-background dark:text-title text-title items-center "
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
                className="light:invert-1 dark:invert  object-contain"
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
