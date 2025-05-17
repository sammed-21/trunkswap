import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react"; // assuming you're using lucide-react icons
import { shortenAddress } from "@/lib/utils";

type Props = {
  address?: string;
};

export const CopyAddress = ({ address }: Props) => {
  const [copied, setCopied] = useState(false);

  //   const copyAddress = () => {
  //     if (!address) return;
  //     navigator.clipboard.writeText(address);
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000); // Show tick for 4 seconds
  //   };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // toast("Copied!", "Address copied to clipboard.", "default");
  };

  return (
    <div
      onClick={() => copyAddress()}
      className="flex items-center cursor-pointer"
    >
      {copied ? (
        <Check className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      {shortenAddress(address!)}
    </div>
  );
};
