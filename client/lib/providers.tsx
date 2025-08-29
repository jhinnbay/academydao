import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "viem";
import { injected, metaMask, coinbaseWallet, walletConnect } from "@wagmi/connectors";

// Create Wagmi config with proper connectors
const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected({ shimDisconnect: true }),
    metaMask(),
    coinbaseWallet({
      appName: "Mental Wealth Academy",
      appLogoUrl: "https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F907173652fac434888a7b68f5b83718e?format=webp&width=800",
    }),
    walletConnect({
      projectId: "your-project-id", // Replace with actual WalletConnect project ID
      metadata: {
        name: "Mental Wealth Academy",
        description: "Academic funding and collaboration platform",
        url: "https://mentalwealthacademy.com",
        icons: ["https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F907173652fac434888a7b68f5b83718e?format=webp&width=800"],
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Create a QueryClient instance
const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
