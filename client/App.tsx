import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { FarcasterCompat } from "@/components/FarcasterCompat";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import React, { useEffect } from "react";
import { WagmiProvider, useAccount, useConnect } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

const queryClient = new QueryClient();

// Suppress noisy analytics fetch errors safely (do not interfere with core APIs)
(() => {
  if ((window as any).__fetchPatched) return;
  (window as any).__fetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args: any[]) => {
    try {
      return await originalFetch(...(args as any));
    } catch (error: any) {
      // Best-effort URL extraction (handles Request objects)
      let url = "";
      try {
        const input = args[0] as any;
        url = typeof input === "string" ? input : (input?.url ?? String(input));
      } catch {}

      const isAnalytics =
        /analytics|plausible|segment|sentry/i.test(url) ||
        /events\.privy\.io/i.test(url);
      if (
        isAnalytics &&
        (error?.message === "Failed to fetch" || error?.name === "TypeError")
      ) {
        console.warn("Suppressed analytics network error:", url);
        return new Response("", { status: 204 });
      }
      throw error;
    }
  };
})();

// Check if running in Farcaster environment
const isFarcasterEnvironment = () => {
  if (typeof window === "undefined") return false;

  // Check for Farcaster user agent or parent frame
  const userAgent = window.navigator.userAgent;
  const isFarcasterApp =
    userAgent.includes("farcaster") || userAgent.includes("Farcaster");
  const isFramed = window.self !== window.top;

  return (
    isFarcasterApp || (isFramed && window.location !== window.parent.location)
  );
};

// Error boundary for the app
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.warn("App error caught:", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn("App component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Minimal fallback for Farcaster environment
      if (isFarcasterEnvironment()) {
        return (
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl mb-4">Trials of Azura</h1>
              <p className="text-gray-400">Loading application...</p>
            </div>
          </div>
        );
      }

      // Fallback without providers
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
    <AppErrorBoundary>
      <FarcasterCompat>
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
      </FarcasterCompat>
    </AppErrorBoundary>
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
