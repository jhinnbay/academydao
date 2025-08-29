import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const ACADEMIC_ANGEL_CONTRACT = "0x39f259B58A9aB02d42bC3DF5836bA7fc76a8880F";
const BASE_RPC_URL = "https://mainnet.base.org";

interface WalletConnectProps {
  onConnectionChange?: (
    isConnected: boolean,
    address?: string,
    hasToken?: boolean,
  ) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnectionChange,
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  const checkTokenOwnership = async (
    walletAddress: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(BASE_RPC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "eth_call",
          params: [
            {
              to: ACADEMIC_ANGEL_CONTRACT,
              data: `0x70a08231000000000000000000000000${walletAddress.slice(2)}`, // balanceOf(address)
            },
            "latest",
          ],
        }),
      });

      const data = await response.json();

      if (data.result) {
        const balance = parseInt(data.result, 16);
        return balance > 0;
      }

      return false;
    } catch (error) {
      console.error("Error checking token ownership:", error);
      return false;
    }
  };

  // Notify parent of connection changes and check token ownership
  useEffect(() => {
    const handleConnectionChange = async () => {
      if (isConnected && address && onConnectionChange) {
        const hasToken = await checkTokenOwnership(address);
        onConnectionChange(isConnected, address, hasToken);
      } else if (!isConnected && onConnectionChange) {
        onConnectionChange(false);
      }
    };

    handleConnectionChange();
  }, [isConnected, address, onConnectionChange]);

  // Don't render until client-side
  if (!isClient) {
    return (
      <button className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-cyan-400/10 to-cyan-400/10 bg-black transition-colors duration-300 px-3 py-2 text-white font-medium text-sm rounded">
        Loading...
      </button>
    );
  }

  // If connected, show connected status in Index.tsx (handled separately)
  if (isConnected && address) {
    return null;
  }

  // Show connect modal when showConnectors is true
  if (showConnectors) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm w-full">
          <div className="text-center mb-4">
            <h3 className="text-white font-sans text-lg font-bold mb-2">
              Connect Wallet
            </h3>
            <p className="text-white/80 font-sans text-sm">
              Choose how you'd like to connect:
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setShowConnectors(false);
                }}
                disabled={isPending}
                className="flex items-center justify-between w-full p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors duration-300 disabled:opacity-50"
              >
                <span className="text-white font-sans font-medium">
                  {connector.name}
                </span>
                {isPending && <span className="text-white/60 font-sans text-sm">Connecting...</span>}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowConnectors(false)}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white font-sans font-medium hover:bg-white/10 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show the Get Started button
  return (
    <button
      onClick={() => setShowConnectors(true)}
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
