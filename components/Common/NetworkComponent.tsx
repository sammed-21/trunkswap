"use client";

import { useChainId, useChains, useSwitchChain } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Check } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/Button";
import { chainIcons } from "@/wagmi/config";

export const NetworkComponent = () => {
  const { chains, switchChain } = useSwitchChain();
  const chainId = useChainId();

  if (!chains) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-4 flex flex-row  bg-accent border-border text-title px-3 py-1 "
        >
          {chains && (
            <Image
              //   src={"https://cryptologos.cc/logos/arbitrum-arb-logo.svg"}
              src={chainIcons[chains[0].id]}
              alt={chains[0].name}
              width={20}
              height={20}
              priority
              className="rounded-full"
            />
          )}
          {chains[0].name}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-[--foreground] border-[--border] text-[--textprimary]">
        {chains.map((x) => (
          <DropdownMenuItem
            key={x.id}
            onClick={() => switchChain}
            disabled={x.id == chainId}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {x && (
                <Image
                  src={chainIcons[x.id]}
                  alt={x.name}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              )}
              <span>{x.name}</span>
            </div>
            {x.id === chainId && <Check className="h-4 w-4 text-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
