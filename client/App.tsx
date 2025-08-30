import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import React from "react";

const queryClient = new QueryClient();

// Error boundary for Privy provider
class PrivyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.warn("Privy provider error:", error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI without Privy
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
  // Check if Privy should be disabled due to network issues
  const disablePrivy = import.meta.env.VITE_DISABLE_PRIVY === "true";

  const AppContent = (
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

  if (disablePrivy) {
    console.log("Privy disabled via environment variable");
    return AppContent;
  }

  return (
    <PrivyErrorBoundary>
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID || "cmex4tmt200k5ju0aorv4f5od"}
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
          // Add config to prevent analytics/server calls that might fail
          clientAnalyticsEnabled: false,
          mfaEnabled: false,
        }}
      >
        {AppContent}
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
