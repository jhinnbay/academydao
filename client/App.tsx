import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { NeynarProvider } from "@neynar/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import React from "react";

const queryClient = new QueryClient();

// Suppress Privy fetch errors globally
const originalFetch = window.fetch;
window.fetch = function (...args) {
  return originalFetch.apply(this, args).catch((error) => {
    // Only suppress known Privy analytics errors
    if (
      error.message === "Failed to fetch" &&
      (args[0]?.toString().includes("privy") ||
        args[0]?.toString().includes("analytics"))
    ) {
      console.warn("Suppressed Privy network error:", error);
      return Promise.resolve(new Response("{}", { status: 200 }));
    }
    throw error;
  });
};

// Error boundary for Privy
class PrivyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.warn("Privy error caught:", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn("Privy component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback without Privy
      return (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <PrivyErrorBoundary>
      <PrivyProvider
        appId="cmex4tmt200k5ju0aorv4f5od"
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#06b6d4",
            logo: "https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F907173652fac434888a7b68f5b83718e?format=webp&width=800",
          },
          loginMethods: ["wallet", "email", "sms", "farcaster"],
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          farcaster: {
            enabled: true,
          },
          // Disable all analytics and external calls
          clientAnalyticsEnabled: false,
          serverAnalyticsEnabled: false,
          mfaEnabled: false,
          experimental: {
            noConnectionModal: true,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </PrivyErrorBoundary>
  );
}

// Ensure root is only created once
const container = document.getElementById("root")!;
let root = (container as any).__reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any).__reactRoot = root;
}

root.render(<App />);
