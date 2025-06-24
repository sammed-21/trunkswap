import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useSwapState } from "@/state/swapStore";
import { useAccountState } from "@/state/accountStore";
import Image from "next/image";
import { Token } from "@/lib/types";
import { formatDigits } from "@/lib/utils";
import { Button } from "../ui/Button";

interface TokenSelectorProps {
  onSelect: (token: Token) => void | Dispatch<SetStateAction<string>>;
  closeModal: () => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  onSelect,
  closeModal,
}) => {
  const { chainId, address } = useAccountState();
  const { tokens, currentSellAsset, currentBuyAsset } = useSwapState();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const isTokenDisabled = (token: Token) => {
    return (
      (currentSellAsset && token.symbol === currentSellAsset.symbol) ||
      (currentBuyAsset && token.symbol === currentBuyAsset.symbol)
    );
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Filter tokens based on the search query (case-insensitive match)
  const filteredTokens = tokens
    .filter(
      (token) =>
        token.chainId === chainId &&
        (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort(
      (a, b) => parseFloat(b.balance || "0") - parseFloat(a.balance || "0")
    );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal(); // Close modal when ESC key is pressed
      }
    };

    // Attach event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  return (
    <div
      className="fixed inset-0  bg-opacity-50 z-10"
      onClick={handleOverlayClick} // Handle click on the overlay
    >
      <div
        className="absolute right-0 top-0 bg-forground max-w-[448px] w-full h-full shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b-[1px] mb-5 -mx-3 py-3 px-3 border-secondary flex justify-between items-center">
          <span className="text-title font-medium text-xl">Select Token</span>
          <Button
            variant={"transparent"}
            onClick={closeModal}
            className="text-title bg-accent  rounded-lg p-2"
          >
            ESC
          </Button>
        </div>
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens..."
            className="w-full p-2 bg-accent text-title rounded-lg"
          />
        </div>
        <div className="space-y-4 z-50">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const disabled = isTokenDisabled(token);

              return (
                <div
                  key={token.address}
                  className={`flex justify-between items-center p-4 border-none rounded-lg ${
                    disabled
                      ? "bg-primary text-white cursor-not-allowed"
                      : "cursor-pointer hover:bg-accent"
                  }`}
                  onClick={() => !disabled && onSelect(token)} // Allow selection only if not disabled
                >
                  <div className="flex  items-center">
                    <Image
                      src={
                        token.logoURI
                          ? token.logoURI
                          : `/tokens/${token.symbol.toLowerCase()}.svg`
                      }
                      alt={token.name}
                      width={20}
                      height={20}
                      className="w-6 h-6 mr-2"
                    />
                    <div className="flex flex-col text-start items-start gap-1">
                      <span>
                        {token.name} ({token.symbol})
                      </span>
                      {address && (
                        <div className="flex flex-col items-end text-xs ">
                          <span>
                            {token.balance
                              ? `${formatDigits(
                                  parseFloat(token.balance).toFixed(4)
                                )} ${token.symbol}`
                              : "--"}{" "}
                            {/* {token.usdValue ? `${token.usdValue}` : "--"}{" "} */}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {disabled && <span className="">Selected</span>}
                </div>
              );
            })
          ) : (
            <div className="text-subtitle">No tokens found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenSelector;
