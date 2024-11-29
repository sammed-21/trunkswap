import React, { useState } from "react";
import TokenSelector from "./TokenSelector"; // Import the TokenSelector component
import walletBalance from "@/public/walletBalance.svg";
import dropdown from "@/public/dropdown.svg";
import Image from "next/image";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { TokenDetail } from "@/lib/types";
interface AmountInputProps {
  title: string;
  token: string;
  Amount: string | number;
  walletBalanceAsset: number | string;
  currentTokenAsset: TokenDetail;
  setAmount: (amount: string) => void;
  setToken: (token: string) => void;
  setCurrentTokenDetal: (token: TokenDetail) => void;
}

const AmountInput: React.FC<AmountInputProps> = ({
  title,
  token,
  Amount,
  setAmount,
  setToken,
  walletBalanceAsset,
  currentTokenAsset,
  setCurrentTokenDetal,
}) => {
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  //   const { setSelectorOpen } = useSwapActions();
  //   const { selectorOpen } = useSwapState();
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleTokenSelect = (selectedToken: any) => {
    setToken(selectedToken.symbol);
    setSelectorOpen(false);
    setCurrentTokenDetal(selectedToken);
  };

  return (
    <div className="p-4 bg-[#0F1D1A] border-secondary border-[1px] rounded-xl shadow-md w-full max-w-md relative">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-textpriamry">
            {title}
          </label>
          <div className="flex gap-1 items-center">
            <Image src={walletBalance} width={20} height={20} alt={"image"} />{" "}
            {walletBalanceAsset || 0}
          </div>
        </div>
        <div className="relative  w-full justify-between flex items-center gap-3">
          <input
            type="text"
            className="w-full placeholder:text-textprimary px-4 py-2 bg-transparent focus:none border-none text-2xl rounded-md"
            placeholder="0.00"
            value={Amount}
            onChange={handleAmountChange}
          />
          <div className="w-full flex justify-end">
            <button
              className="px-3 justify-between gap-1  w-fit relative flex py-2 bg-[#202C2A] text-white items-center rounded"
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
