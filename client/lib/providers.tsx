import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
// Removed AuthKitProvider to avoid conflicts with Privy's built-in Farcaster support

// Create a QueryClient instance
const queryClient = new QueryClient();

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
        {children}
      </QueryClientProvider>
    </PrivyProvider>
  );
}
