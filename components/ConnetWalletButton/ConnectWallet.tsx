"use client";
import React, { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient } from "wagmi";
import { config } from "@/wagmi/config";

type Props = {};

export const ConnectWallet = (props: Props) => {
  return (
    <div>
      <ConnectButton />
    </div>
  );
};
