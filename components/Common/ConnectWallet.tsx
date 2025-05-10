import React from "react";
import { Button } from "../ui/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { shortenAddress } from "@/lib/utils";
import { useAccount } from "wagmi";
import { WalletDropdown } from "./WalletDropdown";

type Props = {};

const ConnectWallet = (props: Props) => {
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  return (
    <div>
      {address ? (
        <div className="bg-forground text-title font-medium text-base">
          <WalletDropdown />
        </div>
      ) : (
        <Button
          variant={"primary"}
          className="w-full  font-semibold  "
          onClick={openConnectModal}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
