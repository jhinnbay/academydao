import React, { useState, useEffect } from "react";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { Loader2, Users, Trophy } from "lucide-react";

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
    if (!isFarcaster || !username) {
      setError("Farcaster connection required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First get the user's FID from their username
      const profileResponse = await fetch(`/api/farcaster/profile?username=${encodeURIComponent(username)}`);
      if (!profileResponse.ok) {
        throw new Error("Failed to get user profile");
      }
      const profile = await profileResponse.json();
      
      if (!profile.fid) {
        throw new Error("User FID not found");
      }

      // Then fetch friends leaderboard
      const response = await fetch(
        `/api/friends-leaderboard?fid=${profile.fid}&contractAddress=${contractAddress}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch friends leaderboard");
      }

      const data: FriendsLeaderboardResponse = await response.json();
      setFriends(data.friends);
    } catch (err: any) {
      console.error("Error fetching friends leaderboard:", err);
      setError(err.message || "Failed to load friends leaderboard");
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
        <div className="relative bg-black border border-white/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
          {/* Header */}
          <div className="relative flex-shrink-0 p-5 border-b border-white/20 bg-black/80">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 px-3 py-1 text-white/80 border border-white/30 rounded hover:bg-white/10 transition-colors"
            >
              Close
            </button>
            <div className="text-left">
              <h2 className="text-white font-sans font-bold text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Friends Leaderboard
              </h2>
              <div className="w-24 h-0.5 bg-white/50 mt-2" />
            </div>
          </div>
          
          {/* Content */}
          <div className="relative flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                <span className="ml-2 text-white/60">Loading friends...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-400 mb-2">{error}</div>
                <button 
                  onClick={fetchFriendsLeaderboard}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <div className="text-white/60 mb-2">No friends found</div>
                <div className="text-sm text-white/40">
                  Friends who own tokens from this contract will appear here
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {friends.map((friend, index) => (
                  <div
                    key={friend.fid}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white/60 w-6">
                        #{index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                        <img
                          src={friend.pfpUrl || "https://via.placeholder.com/40x40/333/fff?text=?"}
                          alt={friend.displayName || friend.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {friend.displayName || friend.username}
                      </div>
                      <div className="text-sm text-white/60 truncate">
                        @{friend.username}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded text-xs">
                        {friend.tokenBalance} token{friend.tokenBalance !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-black/70">
            <div className="text-xs text-white/40 text-center">
              Showing friends who own tokens from contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
