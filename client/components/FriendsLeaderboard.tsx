import React, { useState, useEffect } from "react";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Trophy, X } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] bg-black border-white/20 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-xl font-bold">Friends Leaderboard</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              <span className="ml-2 text-white/60">Loading friends...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 mb-2">{error}</div>
              <Button 
                onClick={fetchFriendsLeaderboard}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Try Again
              </Button>
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
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={friend.pfpUrl} 
                        alt={friend.displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-white/10 text-white">
                        {friend.displayName?.charAt(0) || friend.username?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
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
                    <Badge 
                      variant="secondary" 
                      className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
                    >
                      {friend.tokenBalance} token{friend.tokenBalance !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-4 border-t border-white/10">
            <div className="text-xs text-white/40 text-center">
              Showing friends who own tokens from contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
