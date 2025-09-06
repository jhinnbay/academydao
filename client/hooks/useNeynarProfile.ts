import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { NeynarUser, NeynarProfileResponse } from '@shared/api';

export const useNeynarProfile = () => {
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<NeynarUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isConnected || !address) {
        setProfile(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/neynar/profile?address=${address}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data: NeynarProfileResponse = await response.json();
        setProfile(data.user);
      } catch (err) {
        console.error('Error fetching Neynar profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [address, isConnected]);

  return {
    profile,
    isLoading,
    error,
    hasProfile: !!profile
  };
};
