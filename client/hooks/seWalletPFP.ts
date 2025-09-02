// Create a new hook: hooks/useWalletPFP.ts
import { useState, useEffect } from 'react';

export const useWalletPFP = (address: string | null) => {
  const [pfp, setPfp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPFP = async () => {
      if (!address) {
        setPfp(null);
        return;
      }

      setLoading(true);
      try {
        // Try to get ENS avatar first
        const ensResponse = await fetch(
          `https://api.ensideas.com/ens/resolve/${address}`
        );
        
        if (ensResponse.ok) {
          const ensData = await ensResponse.json();
          if (ensData.avatar) {
            setPfp(ensData.avatar);
            return;
          }
        }

        // Fallback: try to get from other services
        const ethLeaderboardResponse = await fetch(
          `https://ethleaderboard.xyz/api/users/${address}`
        );
        
        if (ethLeaderboardResponse.ok) {
          const ethData = await ethLeaderboardResponse.json();
          if (ethData.image_url) {
            setPfp(ethData.image_url);
            return;
          }
        }

        // Final fallback: use placeholder
        setPfp(null);
      } catch (error) {
        console.error('Error fetching PFP:', error);
        setPfp(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPFP();
  }, [address]);

  return { pfp, loading };
};