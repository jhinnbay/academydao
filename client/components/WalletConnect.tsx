import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface WalletConnectProps {
  onConnectionChange?: (isConnected: boolean, address?: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnectionChange,
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Notify parent of connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected, address);
    }
  }, [isConnected, address, onConnectionChange]);

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="text-azura-accent-blue font-sf-pro text-sm font-medium leading-[22px] group-hover:text-white transition-colors duration-300">
        Loading...
      </div>
    );
  }

  // If connected, show disconnect option
  if (isConnected && address) {
    return (
      <div className="flex flex-col items-end">
        <div className="text-green-400 font-sf-pro text-xs font-medium leading-[22px] mb-1">
          Connected
        </div>
        <button
          onClick={() => disconnect()}
          className="text-azura-accent-blue font-sf-pro text-sm font-medium leading-[22px] group-hover:text-white transition-colors duration-300 hover:underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Show connect options
  return (
    <div className="flex flex-col gap-1">
      {connectors.length > 0 ? (
        connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="text-azura-accent-blue font-sf-pro text-sm font-medium leading-[22px] group-hover:text-white transition-colors duration-300 hover:underline disabled:opacity-50"
          >
            {isPending ? "Connecting..." : "Connect"}
          </button>
        ))
      ) : (
        <button
          className="text-azura-accent-blue font-sf-pro text-sm font-medium leading-[22px] group-hover:text-white transition-colors duration-300"
          onClick={() => {
            // Fallback for MiniApp environment
            if (typeof window !== "undefined" && (window as any).ethereum) {
              (window as any).ethereum.request({
                method: "eth_requestAccounts",
              });
            }
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};
