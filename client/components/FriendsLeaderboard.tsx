import React, { useState, useEffect } from "react";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { Trophy, X, RefreshCw } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FriendsLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress?: string;
}

export function FriendsLeaderboard({ 
  isOpen, 
  onClose, 
  contractAddress = "0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07" 
}: FriendsLeaderboardProps) {
  const { isFarcaster, username } = useFarcasterUser();
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchFriendsLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user's FID from Farcaster context with better error handling
      const anySdk: any = sdk as any;
      const context = anySdk?.context || (window as any)?.__FARCASTER_MINIAPP_CONTEXT || null;
      const fcUser = (context as any)?.user ?? (context as any)?.viewer ?? null;
      
      // More robust FID extraction
      let currentUserFid = 1; // fallback to 1
      if (fcUser) {
        try {
          // Handle different possible FID locations and Proxy objects
          const fidCandidates = [fcUser.fid, fcUser.id, fcUser.user?.fid, fcUser.user?.id];
          for (const candidate of fidCandidates) {
            if (candidate !== undefined && candidate !== null) {
              const fidValue = typeof candidate === 'object' && 'valueOf' in candidate 
                ? candidate.valueOf() 
                : candidate;
              const parsedFid = Number(fidValue);
              if (!isNaN(parsedFid) && parsedFid > 0) {
                currentUserFid = parsedFid;
                break;
              }
            }
          }
        } catch (e) {
          console.warn("Could not extract FID from user object, using fallback:", e);
        }
      }

      console.log("Fetching live AzuraOS token balances for contract:", contractAddress, "with viewerFid:", currentUserFid);

      // Call the API to get live AzuraOS token holders
      const response = await fetch(
        `/api/friends-leaderboard?viewerFid=${currentUserFid}&contractAddress=${contractAddress}&t=${Date.now()}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch friends leaderboard: ${response.status} - ${errorText}`);
      }

      const data: FriendsLeaderboardResponse = await response.json();
      console.log("Received live leaderboard data:", data);
      
      // Check if there's an error about missing configuration
      if ((data as any).error) {
        if ((data as any).error.includes("NEYNAR_API_KEY")) {
          setError("Live token balance fetching is not configured. Please set up the NEYNAR_API_KEY environment variable.");
        } else if ((data as any).error.includes("ALCHEMY_RPC_URL")) {
          setError("Live token balance fetching is not configured. Please set up the ALCHEMY_RPC_URL environment variable.");
        } else {
          setError((data as any).error);
        }
      } else {
        setFriends(data.friends);
      }
    } catch (err: any) {
      console.error("Error fetching friends leaderboard:", err);
      setError(err.message || "Failed to load leaderboard data");
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFriendsLeaderboard();
    }
  }, [isOpen, contractAddress]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        <div className="relative bg-black border border-white/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
          <div className="relative flex-shrink-0 p-5 border-b border-white/20 bg-black/80">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-5 h-5 text-white" />
                <h2 className="text-white font-sans font-bold text-xl">
                  Live Leaderboard
                </h2>
                <button
                  onClick={fetchFriendsLeaderboard}
                  disabled={isLoading}
                  className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                  title="Refresh live data"
                >
                  <RefreshCw className={`w-4 h-4 text-white/60 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="w-28 h-0.5 bg-white/50 mx-auto mt-2" />
              <div className="text-xs text-white/40 mt-1">
                Live AzuraOS token balances from Base network
              </div>
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto p-5 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-white/60 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
                  <div>Loading live token balances...</div>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-400 text-center">
                  <div className="mb-2">⚠️ Error loading leaderboard</div>
                  <div className="text-sm text-white/60 mb-4">{error}</div>
                  <button 
                    onClick={fetchFriendsLeaderboard}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : friends.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-white/60 text-center">
                  <div className="mb-2">No token holders found</div>
                  <div className="text-sm">Try refreshing the leaderboard</div>
                </div>
              </div>
            ) : (
              friends.map((friend, index) => (
              <div
                key={friend.fid}
                className="bg-black border border-white/30 rounded-lg p-4 hover:border-white/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {friend.pfpUrl ? (
                      <img 
                        src={friend.pfpUrl} 
                        alt={friend.displayName}
                        className="w-12 h-12 border-2 border-white/30 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 border-2 border-white/30 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold rounded">
                        {friend.displayName?.charAt(0)?.toUpperCase() || friend.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm mb-1 truncate">
                      {friend.displayName}
                    </div>
                    <div className="text-white/60 text-sm mb-1 truncate">
                      @{friend.username}
                    </div>
                    {friend.address && (
                      <div className="text-white/40 text-xs mb-1 truncate font-mono">
                        {friend.address.slice(0, 6)}...{friend.address.slice(-4)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <div className="text-green-400 font-mono font-bold text-sm">
                        {(friend.tokenBalance / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-white/50 text-sm">
                        $AZURA
                      </div>
                    </div>
                  </div>
                  
                  {/* Follow button */}
                  <div className="flex-shrink-0">
                    <button 
                      className="px-3 py-2 bg-white text-black hover:bg-gray-200 font-medium text-sm transition-colors rounded"
                      onClick={async () => {
                        try {
                          // Get current user's FID from Farcaster context
                          const anySdk: any = sdk as any;
                          const context = anySdk?.context || (window as any)?.__FARCASTER_MINIAPP_CONTEXT || null;
                          const fcUser = (context as any)?.user ?? (context as any)?.viewer ?? null;
                          const currentUserFid = fcUser?.fid || fcUser?.id || 1; // fallback to 1 if not found

                          // Call follow API
                          const response = await fetch('/api/follow-user', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              targetFid: friend.fid,
                              viewerFid: currentUserFid
                            })
                          });

                          if (response.ok) {
                            // Also open Farcaster profile in new tab
                            window.open(`https://warpcast.com/${friend.username}`, '_blank');
                          } else {
                            console.error('Follow request failed');
                            // Still open profile as fallback
                            window.open(`https://warpcast.com/${friend.username}`, '_blank');
                          }
                        } catch (error) {
                          console.error('Error following user:', error);
                          // Fallback to opening profile
                          window.open(`https://warpcast.com/${friend.username}`, '_blank');
                        }
                      }}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
          
          {/* Footer with Close Button */}
          <div className="p-5 border-t border-white/20">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium transition-colors rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
