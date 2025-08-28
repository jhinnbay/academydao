import React, { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { FallbackWalletConnect } from './FallbackWalletConnect';

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
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const checkTokenOwnership = async (address: string): Promise<boolean> => {
    try {
      setIsCheckingToken(true);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('RPC error:', data.error);
        return false;
      }

      if (data.result) {
        // Convert hex to number and check if balance > 0
        const balance = parseInt(data.result, 16);
        console.log(`Token balance for ${address}: ${balance}`);
        return balance > 0;
      }

      return false;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Token check timed out');
      } else {
        console.error('Error checking token ownership:', error);
      }
      return false;
    } finally {
      setIsCheckingToken(false);
    }
  };

  // Set a timeout for Privy loading
  useEffect(() => {
    console.log('Privy ready state:', ready);

    const timeout = setTimeout(() => {
      if (!ready) {
        console.warn('Privy taking too long to initialize, showing fallback');
        setLoadingTimeout(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [ready]);

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

  if (!ready && !loadingTimeout) {
    return (
      <div className="text-white/70 font-sf-pro text-sm font-medium leading-[22px]">
        Loading...
      </div>
    );
  }

  // Fallback when Privy fails to load
  if (!ready && loadingTimeout) {
    console.log('Using fallback wallet connector');
    return <FallbackWalletConnect onConnectionChange={onConnectionChange} />;
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
