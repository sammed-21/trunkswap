import { chainMap, rpcMap } from "@/wagmi/config";
import { JsonRpcProvider } from "ethers";
import { createPublicClient, http } from "viem";

export const InitWallet = async (
  address: `0x${string}` | undefined,
  chainId: number,
  walletClient: any
) => {
  if (!address || !walletClient || !chainId) return;

  const chain = chainMap[chainId];
  const rpcUrl = rpcMap[chainId];

  if (!chain || !rpcUrl) {
    console.error("Unsupported network or missing RPC");
    return;
  }

  // ✅ Create ethers provider (Ethers v6)
  const provider = new JsonRpcProvider(rpcUrl);
  const signer = provider.getSigner();

  // ✅ Viem client for multicall
  const viemClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
    batch: { multicall: true },
  });

  return { provider, signer, viemClient };

  // Setting everything up in the state
};
