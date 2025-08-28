import React, { useState, useEffect } from "react";

// Type declaration for ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface FallbackWalletConnectProps {
  onConnectionChange?: (
    isConnected: boolean,
    address?: string,
    hasToken?: boolean,
  ) => void;
}

const ACADEMIC_ANGEL_CONTRACT = "0x39f259B58A9aB02d42bC3DF5836bA7fc76a8880F";
const BASE_RPC_URL = "https://mainnet.base.org";

export const FallbackWalletConnect: React.FC<FallbackWalletConnectProps> = ({
  onConnectionChange,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

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

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install a Web3 wallet like MetaMask");
      return;
    }

    try {
      setIsConnecting(true);

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        setIsConnected(true);
        setAddress(account);

        // Check token ownership
        const hasToken = await checkTokenOwnership(account);

        if (onConnectionChange) {
          onConnectionChange(true, account, hasToken);
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress("");
    if (onConnectionChange) {
      onConnectionChange(false);
    }
  };

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const account = accounts[0];
            setIsConnected(true);
            setAddress(account);

            const hasToken = await checkTokenOwnership(account);

            if (onConnectionChange) {
              onConnectionChange(true, account, hasToken);
            }
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkConnection();
  }, [onConnectionChange]);

  if (isConnected) {
    return (
      <div className="flex flex-col items-end">
        <div className="text-green-300 font-sf-pro text-xs font-medium leading-[22px] mb-1">
          Connected
        </div>
        <button
          onClick={disconnectWallet}
          className="text-white/80 font-sf-pro text-sm font-medium leading-[22px] hover:text-white transition-colors hover:underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="text-white/80 font-sf-pro text-sm font-medium leading-[22px] hover:text-white transition-colors hover:underline disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect"}
    </button>
  );
};
