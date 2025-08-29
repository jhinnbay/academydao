import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthKitProvider } from "@farcaster/auth-kit";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Farcaster configuration
const farcasterConfig = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: "mental-wealth-academy.app", // Replace with your actual domain
  siweUri: "https://mental-wealth-academy.app/login",
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "cmex4tmt200k5ju0aorv4f5od"}
      config={{
        loginMethods: ["wallet", "email", "google", "twitter", "farcaster"],
        appearance: {
          theme: "dark",
          accentColor: "#06b6d4", // Cyan color to match the app theme
          logo: "https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F907173652fac434888a7b68f5b83718e?format=webp&width=800",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          noPromptOnSignature: false,
        },
        farcaster: {
          enabled: true,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthKitProvider config={farcasterConfig}>{children}</AuthKitProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
