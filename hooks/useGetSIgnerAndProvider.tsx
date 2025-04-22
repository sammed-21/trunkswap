import { usePublicClient, useWalletClient } from "wagmi";
import { createWalletClient, custom } from "viem";

export function useGetSignerAndProvider() {
  // Get the public provider
  const provider = usePublicClient();

  // Get the wallet client (signer)
  const { data: walletClient } = useWalletClient();

  // Create the signer from walletClient
  const signer = walletClient
    ? createWalletClient({
        account: walletClient.account,
        chain: walletClient.chain,
        transport: custom(walletClient.transport),
      })
    : null;

  return { signer, provider };
}
