import React, { useEffect, useState } from "react";
import { Token } from "@/lib/types";
import { useSwapState } from "@/state/swapStore";
import { useAccountState } from "@/state/accountStore";
import Image from "next/image";

interface TokenSelectorProps {
  onSelect: (token: Token) => void;
  closeModal: () => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  onSelect,
  closeModal,
}) => {
  const { chainId } = useAccountState();
  const { tokens, currentSellAsset, currentBuyAsset } = useSwapState();
  console.log({ tokens });
  const [searchQuery, setSearchQuery] = useState<string>("");
  console.log(tokens[0].chainId, chainId, "this tow chdinaid");
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
  const filteredTokens = tokens.filter(
    (token) =>
      token.chainId === chainId &&
      (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
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
        className="absolute right-0 top-0 bg-primary max-w-[448px] w-full h-full shadow-lg p-4"
        onClick={(e) => e.stopPropagation()} // Prevent click propagation to the overlay
      >
        <div className="border-b-[1px] mb-5 -mx-3 py-3 px-3 border-secondary flex justify-between items-center">
          <span>Select a Token</span>
          <button
            onClick={closeModal}
            className="text-white bg-border  rounded-none p-2"
          >
            ESC
          </button>
        </div>
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens..."
            className="w-full p-2 bg-secondary text-white rounded-none"
          />
        </div>
        <div className="space-y-4">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const disabled = isTokenDisabled(token);

              return (
                <div
                  key={token.address}
                  className={`flex justify-between items-center p-4 border-none rounded-none ${
                    disabled
                      ? "bg-secondary cursor-not-allowed"
                      : "cursor-pointer hover:bg-primary"
                  }`}
                  onClick={() => !disabled && onSelect(token)} // Allow selection only if not disabled
                >
                  <div className="flex items-center">
                    <Image
                      src={token.logoURI}
                      alt={token.name}
                      className="w-6 h-6 mr-2"
                    />
                    <span>
                      {token.name} ({token.symbol})
                    </span>
                  </div>
                  {disabled && <span className="text-gray-500">Selected</span>}
                </div>
              );
            })
          ) : (
            <div className="text-gray-500">No tokens found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenSelector;
