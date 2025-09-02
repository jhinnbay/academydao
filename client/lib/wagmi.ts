import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { injected, coinbaseWallet } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector(),
    injected(),
    coinbaseWallet({
      appName: "Trials of Azura",
      preference: "smartWalletOnly",
    }),
  ],
  ssr: true,
});
