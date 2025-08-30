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

        setIsFarcaster(isFarcasterApp || isFramed || hasFarcasterSDK);
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
