import React, { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function isFarcasterEnvironment() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isFramed = window.self !== window.top;
  return /farcaster/i.test(ua) || isFramed;
}

export const SyncAccount: React.FC = () => {
  const { address, isConnected, status } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Auto-connect on mount if not already connected and connector is available
  useEffect(() => {
    if (!isConnected && connectors.length > 0 && isFarcasterEnvironment()) {
      connectAsync({ connector: connectors[0] }).catch(() => {});
    }
  }, [isConnected, connectors, connectAsync]);

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-red-400/10 to-red-400/10 bg-black hover:bg-gray-900 transition-colors duration-300"
        style={{
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingLeft: "12px",
          paddingRight: "12px",
          fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
          lineHeight: "1.6",
          fontWeight: "500",
          color: "#ffffff",
        }}
      >
        Disconnect {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </button>
    );
  }

  return (
    <button
      onClick={() => connectAsync({ connector: connectors[0] }).catch(() => {})}
      disabled={
        status === "reconnecting" || isPending || connectors.length === 0
      }
      className="flex justify-center items-center gap-2 border border-white/20 bg-gradient-to-b from-white/10 to-white/10 bg-black hover:bg-gray-900 transition-colors duration-300 disabled:opacity-50"
      style={{
        paddingTop: "8px",
        paddingBottom: "8px",
        paddingLeft: "12px",
        paddingRight: "12px",
        fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
        lineHeight: "1.6",
        fontWeight: "500",
        color: "#ffffff",
      }}
    >
      Sync Account
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12a9 9 0 019-9 9 9 0 018.94 8H19l3 3-3 3h1.94A9 9 0 113 12z"
        />
      </svg>
    </button>
  );
};
