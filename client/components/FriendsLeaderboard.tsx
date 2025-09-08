import React, { useState, useEffect } from "react";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { Trophy, X } from "lucide-react";
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
  const fetchFriendsLeaderboard = async () => {
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

      console.log("Fetching AzuraOS token holders for contract:", contractAddress, "with viewerFid:", currentUserFid);

      // Call the API to get top AzuraOS token holders
      const response = await fetch(
        `/api/friends-leaderboard?viewerFid=${currentUserFid}&contractAddress=${contractAddress}&t=${Date.now()}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch friends leaderboard: ${response.status} - ${errorText}`);
      }

      const data: FriendsLeaderboardResponse = await response.json();
      console.log("Received leaderboard data:", data);
      setFriends(data.friends);
    } catch (err: any) {
      console.error("Error fetching friends leaderboard:", err);
      setFriends([]);
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-black backdrop-blur-2xl border border-white/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-black backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
              <Trophy className="w-full h-full text-yellow-400 p-1" />
            </div>
            <h2 className="text-white font-sans text-xl font-bold">
              $AZURA TOP HOLDERS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 bg-black backdrop-blur-sm">
          <div className="space-y-4">
            {friends.map((friend, index) => (
                <div
                  key={friend.fid}
                  className="bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {friend.pfpUrl ? (
                        <img 
                          src={friend.pfpUrl} 
                          alt={friend.displayName}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-white/30 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-white/30 bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                          {friend.displayName?.charAt(0)?.toUpperCase() || friend.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    
                    {/* User info - mobile optimized */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm sm:text-base mb-1 truncate">
                        {friend.displayName}
                      </div>
                      <div className="text-white/60 text-xs sm:text-sm mb-1 truncate">
                        @{friend.username}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-green-400 font-mono font-bold text-sm">
                          {(friend.tokenBalance / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-white/50 text-xs">
                          $AZURA
                        </div>
                      </div>
                    </div>
                    
                    {/* Follow button - mobile optimized */}
                    <div className="flex-shrink-0">
                      <button 
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-black hover:bg-gray-200 font-medium text-sm transition-colors rounded border border-white"
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
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
