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
          <div className="relative flex-shrink-0 p-6 text-center">
            <h2 className="text-white font-sans font-bold text-2xl mb-2">
              AzuraOS holders
            </h2>
            <p className="text-white text-sm mb-2">
              $AZURAOS LEADERBOARD
            </p>
            <p className="text-white/80 text-xs mb-4">
              Follow the top Daemon Model Supporters to get rewarded.
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
                <div className="text-white/60 mb-2">No holders found</div>
                <div className="text-sm text-white/40">
                  Top $AZURAOS holders will appear here
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {friends.slice(0, 4).map((friend, index) => (
                  <div
                    key={friend.fid}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium text-lg">
                        @{friend.username}
                      </div>
                      <div className="text-white/60 text-sm">
                        {friend.tokenBalance} $AZURAOS
                      </div>
                    </div>
                    
                    <button className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded font-medium transition-colors">
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
