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
  buttonText?: string;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  showConnectionStatus?: boolean;
}

const ACADEMIC_ANGEL_CONTRACT = "0x39f259B58A9aB02d42bC3DF5836bA7fc76a8880F";
const BASE_RPC_URL = "https://mainnet.base.org";

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Popular mobile wallet apps
const mobileWallets = [
  { name: "Coinbase Wallet", url: "https://www.coinbase.com/wallet" },
  { name: "Trust Wallet", url: "https://trustwallet.com" },
  { name: "MetaMask Mobile", url: "https://metamask.io/download/" },
  { name: "Rainbow", url: "https://rainbow.me" }
];

export const FallbackWalletConnect: React.FC<FallbackWalletConnectProps> = ({
  onConnectionChange,
  buttonText = "Connect",
  buttonClassName = "text-white/80 font-sf-pro text-sm font-medium leading-[22px] hover:text-white transition-colors hover:underline disabled:opacity-50",
  buttonStyle = {},
  showConnectionStatus = true,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);

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
      if (isMobile()) {
        setShowMobileOptions(true);
        return;
      } else {
        alert("Please install a Web3 wallet extension like MetaMask for your browser");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
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

  if (showMobileOptions) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-sm w-full">
          <div className="text-center mb-4">
            <h3 className="text-white font-sans text-lg font-bold mb-2">Choose a Wallet</h3>
            <p className="text-white/80 font-sans text-sm">Connect with one of these mobile wallets:</p>
          </div>

          <div className="space-y-3 mb-4">
            {mobileWallets.map((wallet) => (
              <a
                key={wallet.name}
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors duration-300"
              >
                <span className="text-white font-sans font-medium">{wallet.name}</span>
                <span className="text-white/60 font-sans text-sm">Install</span>
              </a>
            ))}
          </div>

          <button
            onClick={() => setShowMobileOptions(false)}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white font-sans font-medium hover:bg-white/10 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (isConnected && showConnectionStatus) {
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
      className={buttonClassName}
      style={buttonStyle}
    >
      {isConnecting
        ? "Connecting..."
        : isConnected && !showConnectionStatus
          ? "Connected"
          : buttonText}
    </button>
  );
};
