import React, { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

interface PrivyWalletConnectProps {
  onConnectionChange?: (isConnected: boolean, address?: string, hasToken?: boolean) => void;
}

const ACADEMIC_ANGEL_CONTRACT = '0x39f259B58A9aB02d42bC3DF5836bA7fc76a8880F';
const BASE_RPC_URL = 'https://mainnet.base.org';

export const PrivyWalletConnect: React.FC<PrivyWalletConnectProps> = ({ onConnectionChange }) => {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  const checkTokenOwnership = async (address: string): Promise<boolean> => {
    try {
      setIsCheckingToken(true);
      
      // Create a simple RPC request to check token balance
      const response = await fetch(BASE_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: ACADEMIC_ANGEL_CONTRACT,
              data: `0x70a08231000000000000000000000000${address.slice(2)}` // balanceOf(address)
            },
            'latest'
          ]
        })
      });

      const data = await response.json();
      
      if (data.result) {
        // Convert hex to number and check if balance > 0
        const balance = parseInt(data.result, 16);
        return balance > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking token ownership:', error);
      return false;
    } finally {
      setIsCheckingToken(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (authenticated && user && wallets.length > 0) {
        const wallet = wallets[0];
        const address = wallet.address;
        
        if (address) {
          const tokenOwnership = await checkTokenOwnership(address);
          setHasToken(tokenOwnership);
          
          if (onConnectionChange) {
            onConnectionChange(true, address, tokenOwnership);
          }
        }
      } else {
        setHasToken(null);
        if (onConnectionChange) {
          onConnectionChange(false);
        }
      }
    };

    if (ready) {
      checkConnection();
    }
  }, [authenticated, user, wallets, ready, onConnectionChange]);

  if (!ready) {
    return (
      <div className="text-white/70 font-sf-pro text-sm font-medium leading-[22px]">
        Loading...
      </div>
    );
  }

  if (authenticated && user) {
    const wallet = wallets[0];
    const address = wallet?.address;
    
    return (
      <div className="flex flex-col items-end">
        <div className="text-green-300 font-sf-pro text-xs font-medium leading-[22px] mb-1">
          Connected
        </div>
        {isCheckingToken ? (
          <div className="text-white/70 font-sf-pro text-xs">
            Checking token...
          </div>
        ) : (
          <button
            onClick={logout}
            className="text-white/80 font-sf-pro text-sm font-medium leading-[22px] hover:text-white transition-colors hover:underline"
          >
            Disconnect
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="text-white/80 font-sf-pro text-sm font-medium leading-[22px] hover:text-white transition-colors hover:underline"
    >
      Connect
    </button>
  );
};
