import React, { useState, useEffect } from "react";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { Loader2, Trophy } from "lucide-react";
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

  const fetchFriendsLeaderboard = async () => {
    setIsLoading(true);

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
      
      // Fallback to dummy data if API fails
      const fallbackFriends: FriendData[] = [
        {
          fid: 286924,
          username: "jhinnbay.eth",
          displayName: "jhinnbay.eth",
          pfpUrl: "",
          address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          tokenBalance: 10
        },
        {
          fid: 284618,
          username: "brennuet",
          displayName: "brennuet",
          pfpUrl: "",
          address: "0x8EB8a3b3C6C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0",
          tokenBalance: 5
        },
        {
          fid: 194372,
          username: "roadu",
          displayName: "roadu",
          pfpUrl: "",
          address: "0x8EB8a3b3C6C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0",
          tokenBalance: 2.35
        }
      ];
      
      setFriends(fallbackFriends);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFriendsLeaderboard();
    }
  }, [isOpen, contractAddress, isFarcaster, username]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        <div className="relative bg-black border-2 border-white shadow-2xl overflow-hidden flex flex-col max-h-full">
          {/* Header */}
          <div className="relative flex-shrink-0 p-6 text-center">
            <h2 className="text-white font-sans font-bold text-2xl mb-2">
              AzuraOS holders
            </h2>
            <p className="text-white text-sm mb-2">
              $AzuraOS LEADERBOARD
            </p>
            <p className="text-white/80 text-xs mb-4">
              Follow top holders to get rewarded.
            </p>
            <div className="w-full h-px bg-white/20" />
          </div>
          
          {/* Content */}
          <div className="relative flex-1 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                <span className="ml-2 text-white/60">Loading top holders...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {friends.map((friend, index) => (
                  <div
                    key={friend.fid}
                    className="flex items-center justify-between p-4 bg-white/5 border-2 border-white/20"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Rank indicator */}
                      <div className="flex-shrink-0 w-8 h-8 bg-white text-black font-bold text-sm flex items-center justify-center">
                        {index + 1}
                      </div>
                      
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {friend.pfpUrl ? (
                          <img 
                            src={friend.pfpUrl} 
                            alt={friend.displayName}
                            className="w-12 h-12 border-2 border-white object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 border-2 border-white bg-white/10 flex items-center justify-center text-white text-sm font-bold">
                            {friend.displayName?.charAt(0)?.toUpperCase() || friend.username?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      
                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-lg truncate">
                          @{friend.username}
                        </div>
                        <div className="text-white/60 text-sm truncate">
                          {friend.displayName}
                        </div>
                        <div className="text-green-400 text-sm font-mono">
                          {friend.tokenBalance?.toLocaleString()} $AZURA
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="px-6 py-2 bg-white text-black hover:bg-gray-200 font-medium transition-colors border-2 border-white"
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
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
