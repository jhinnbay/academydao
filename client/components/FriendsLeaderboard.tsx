import React, { useState, useEffect } from "react";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { Loader2, Trophy } from "lucide-react";

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
      // Mock data for demonstration - replace with actual API call when ready
      const mockFriends: FriendData[] = [
        {
          fid: 1,
          username: "vitalik",
          displayName: "Vitalik Buterin",
          pfpUrl: "https://i.imgur.com/ip6OGzW.png",
          address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          tokenBalance: 15000
        },
        {
          fid: 2,
          username: "dankrad",
          displayName: "Dankrad Feist",
          pfpUrl: "https://i.imgur.com/ip6OGzW.png",
          address: "0x8EB8a3b3C6C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0",
          tokenBalance: 12000
        },
        {
          fid: 3,
          username: "dankrad",
          displayName: "Dankrad Feist",
          pfpUrl: "https://i.imgur.com/ip6OGzW.png",
          address: "0x8EB8a3b3C6C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0",
          tokenBalance: 8500
        },
        {
          fid: 4,
          username: "dankrad",
          displayName: "Dankrad Feist",
          pfpUrl: "https://i.imgur.com/ip6OGzW.png",
          address: "0x8EB8a3b3C6C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0",
          tokenBalance: 6200
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFriends(mockFriends);
    } catch (err: any) {
      console.error("Error fetching friends leaderboard:", err);
      // Don't set error, just show empty state
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
