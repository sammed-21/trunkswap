"use client";

import { useDisconnect, useAccount } from "wagmi";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, LogOut } from "lucide-react";

import { shortenAddress } from "@/lib/utils";
import { Button } from "../ui/Button";
import toast from "react-hot-toast";

export function WalletDropdown() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("wallet Address copied");
  };

  if (!isConnected) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={""}>{shortenAddress(address!)}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
