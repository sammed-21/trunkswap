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
  const chainId = useChainId(); // current active chainId
  const chains = useChains(); // list of supported chains
  const { switchChain } = useSwitchChain();

  const activeChain = chains.find((c) => c.id === chainId);

  if (!chains || !activeChain) return null;

  const sortedChains = [activeChain, ...chains.filter((c) => c.id !== chainId)];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-4 flex flex-row bg-accent border-border text-title md:px-3 py-1"
        >
          <Image
            src={chainIcons[activeChain.id]}
            alt={activeChain.name}
            width={20}
            height={20}
            priority
            className="rounded-full"
          />
          <span className="hidden px-3 lg:block">{activeChain.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-[--foreground] border-[--border] text-[--textprimary]">
        {sortedChains.map((x) => (
          <DropdownMenuItem
            key={x.id}
            onClick={() => switchChain({ chainId: x.id })}
            disabled={x.id === chainId}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Image
                src={chainIcons[x.id]}
                alt={x.name}
                width={16}
                height={16}
                className="rounded-full"
              />
              <span>{x.name}</span>
            </div>
            {x.id === chainId && <Check className="h-4 w-4 text-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
