import React from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";

interface PrivyAuthProps {
  onConnectionChange?: (
    isConnected: boolean,
    address?: string,
    hasToken?: boolean,
  ) => void;
}

export const PrivyAuth: React.FC<PrivyAuthProps> = ({
  onConnectionChange,
}) => {
  const { ready, authenticated, user, logout, login } = usePrivy();

  // Handle connection changes
  React.useEffect(() => {
    if (ready && onConnectionChange) {
      const address = user?.wallet?.address;
      
      if (authenticated && address) {
        // For now, we'll assume users have Academic Angel tokens
        // In a real implementation, you'd check token ownership here
        onConnectionChange(true, address, true);
      } else {
        onConnectionChange(false);
      }
    }
  }, [ready, authenticated, user, onConnectionChange]);

  if (!ready) {
    return (
      <button 
        className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-cyan-400/10 to-cyan-400/10 bg-black transition-colors duration-300 px-3 py-2 text-white font-medium text-sm rounded"
        style={{
          fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
          lineHeight: "1.6",
          fontWeight: "500",
        }}
        disabled
      >
        Loading...
      </button>
    );
  }

  if (authenticated && user) {
    return null; // Connection status is handled in Index.tsx
  }

  return (
    <button
      onClick={login}
      className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-cyan-400/10 to-cyan-400/10 bg-black hover:bg-gray-900 transition-colors duration-300 px-3 py-2 text-white font-medium text-sm rounded"
      style={{
        fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
        lineHeight: "1.6",
        fontWeight: "500",
      }}
    >
      Get Started
    </button>
  );
};
