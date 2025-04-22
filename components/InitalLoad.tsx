// components/InitialLoad.tsx
"use client";

import { WalletInit } from "@/services/walletEvents";
import { useState, useEffect } from "react";
// import { WalletInit } from "@/services/WalletInit"; // changed from useWalletInit

const InitialLoad = ({ children }: { children: React.ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      <WalletInit />
      {children}
    </>
  );
};

export default InitialLoad;
