import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    sdk?: {
      actions?: {
        ready: () => void;
      };
    };
  }
}

interface FarcasterCompatProps {
  children: React.ReactNode;
}

export const FarcasterCompat: React.FC<FarcasterCompatProps> = ({
  children,
}) => {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect if we're running in a Farcaster environment
    const detectFarcaster = () => {
      try {
        const userAgent = window.navigator.userAgent;
        const isFarcasterApp =
          userAgent.includes("farcaster") || userAgent.includes("Farcaster");
        const isFramed = window.self !== window.top;

        // Check for Farcaster-specific window properties
        const hasFarcasterSDK = (window as any).parent?.postMessage;

        const isFarcasterEnv = isFarcasterApp || isFramed || hasFarcasterSDK;
        setIsFarcaster(isFarcasterEnv);

        // Call ready() if we're in a Farcaster environment
        if (isFarcasterEnv && window.sdk?.actions?.ready) {
          console.log("Calling sdk.actions.ready() for Farcaster MiniKit");
          window.sdk.actions.ready();
        }
      } catch (error) {
        console.warn("Error detecting Farcaster environment:", error);
        setIsFarcaster(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to allow Farcaster SDK to initialize
    const timer = setTimeout(detectFarcaster, 100);

    return () => clearTimeout(timer);
  }, []);

  // Additional effect to ensure ready() is called and debug domain issues
  useEffect(() => {
    const checkDomainAndReady = () => {
      // Debug current domain
      console.log("Current domain:", window.location.hostname);
      console.log("Current URL:", window.location.href);

      // Check if accessing wrong domain (.dao instead of .app)
      if (window.location.hostname.includes('.dao')) {
        console.warn("⚠️  Domain issue detected: accessing .dao instead of .app");
        console.warn("Correct URL should be: https://academydao.vercel.app");
      }

      // Check for Farcaster SDK
      console.log("Window.sdk available:", !!window.sdk);
      console.log("Window.sdk.actions available:", !!window.sdk?.actions);
      console.log("Window.sdk.actions.ready available:", !!window.sdk?.actions?.ready);

      if (window.sdk?.actions?.ready) {
        console.log("✅ Calling sdk.actions.ready()");
        try {
          window.sdk.actions.ready();
        } catch (error) {
          console.error("❌ Error calling sdk.actions.ready():", error);
        }
      } else {
        console.log("⏳ SDK not ready yet, will retry...");
        // Retry after a short delay if SDK isn't available yet
        setTimeout(() => {
          if (window.sdk?.actions?.ready) {
            console.log("✅ Calling sdk.actions.ready() after retry");
            try {
              window.sdk.actions.ready();
            } catch (error) {
              console.error("❌ Error calling sdk.actions.ready() (retry):", error);
            }
          } else {
            console.warn("❌ Farcaster SDK still not available after retry");
          }
        }, 500);
      }
    };

    // Call immediately and also after delays
    checkDomainAndReady();
    const timer1 = setTimeout(checkDomainAndReady, 200);
    const timer2 = setTimeout(checkDomainAndReady, 1000);
    const timer3 = setTimeout(checkDomainAndReady, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4 font-sans">Academy Event Planner</h1>
          <div className="text-gray-400 animate-pulse">Initializing...</div>
        </div>
      </div>
    );
  }

  // For Farcaster environment, add some specific styling
  if (isFarcaster) {
    return (
      <div className="farcaster-miniapp" style={{ minHeight: "100vh" }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};
