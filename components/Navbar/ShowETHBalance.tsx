import { useETHBalance } from "@/hooks/useETHBalance";
import React from "react";
import { useAccount } from "wagmi";

type Props = {};

export const ShowETHBalance = (props: Props) => {
  const { address } = useAccount();
  const ETHBalance = useETHBalance();
  if (!address) return;
  return <div className="text-base font-semibold">{ETHBalance} ETH</div>;
};
