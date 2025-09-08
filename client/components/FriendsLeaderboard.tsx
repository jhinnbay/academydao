import React, { useState, useEffect } from "react";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { Trophy } from "lucide-react";
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
      <div className="bg-black backdrop-blur-2xl border-2 border-cyan-400 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-400/20">
        {/* Modal Header */}
        <div className="flex items-center justify-center p-6 border-b-2 border-cyan-400 bg-black backdrop-blur-lg relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 border-2 border-cyan-400 flex-shrink-0 bg-black flex items-center justify-center relative">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400/10"></div>
            </div>
            <h2 className="text-cyan-400 font-mono text-xl font-bold tracking-wider">
              $AZURA TOP HOLDERS
            </h2>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 bg-black backdrop-blur-sm">
          <div className="space-y-3">
            {friends.map((friend, index) => (
                <div
                  key={friend.fid}
                  className="bg-black border-2 border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-400/5 transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center p-4 gap-4 relative z-10">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {friend.pfpUrl ? (
                        <img 
                          src={friend.pfpUrl} 
                          alt={friend.displayName}
                          className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-cyan-400/50 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-cyan-400/50 bg-cyan-400/10 flex items-center justify-center text-cyan-400 text-sm font-bold font-mono">
                          {friend.displayName?.charAt(0)?.toUpperCase() || friend.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    
                    {/* User info - mobile optimized */}
                    <div className="flex-1 min-w-0">
                      <div className="text-cyan-400 font-mono font-bold text-sm sm:text-base mb-1 truncate tracking-wide">
                        {friend.displayName}
                      </div>
                      <div className="text-cyan-400/60 text-xs sm:text-sm mb-1 truncate font-mono">
                        @{friend.username}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-green-400 font-mono font-bold text-sm bg-green-400/10 px-2 py-1 border border-green-400/30">
                          {(friend.tokenBalance / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-cyan-400/50 text-xs font-mono">
                          $AZURA
                        </div>
                      </div>
                    </div>
                    
                    {/* Follow button - mobile optimized */}
                    <div className="flex-shrink-0">
                      <button 
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-cyan-400 text-black hover:bg-cyan-300 font-mono font-bold text-sm transition-all duration-300 border-2 border-cyan-400 hover:border-cyan-300"
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
                        FOLLOW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Footer with Close Button */}
        <div className="p-6 border-t-2 border-cyan-400">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-cyan-400/10 hover:bg-cyan-400/20 border-2 border-cyan-400 text-cyan-400 font-mono font-bold transition-all duration-300 hover:border-cyan-300 hover:text-cyan-300"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
