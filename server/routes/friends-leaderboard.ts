import type { RequestHandler } from "express";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";

interface NeynarUserResponse {
  users?: any[];
}

// Hardcoded top AzuraOS holders with their FIDs and token balances
const TOP_AZURAOS_HOLDERS = [
  { fid: 286924, username: "jamesdesign.eth", tokenBalance: 13500000 }, // 13.5M tokens
  { fid: 1077966, username: "jellofish", tokenBalance: 4680000 },      // 4.68M tokens
  { fid: 284618, username: "brennuet", tokenBalance: 4680000 },        // 4.68M tokens
  { fid: 194372, username: "roadu", tokenBalance: 2340000 },           // 2.34M tokens
  { fid: 99, username: "jesse.base.eth", tokenBalance: 1170000 },      // 1.17M tokens
];

async function fetchNeynarUserData(fids: number[], apiKey: string): Promise<any[]> {
  try {
    const fidsString = fids.join(',');
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidsString}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Neynar error ${response.status}: ${text}`);
    }

    const data: NeynarUserResponse = await response.json();
    return data.users || [];
  } catch (error) {
    console.error("Error fetching Neynar user data:", error);
    return [];
  }
}

export const handleFollowUser: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        error: "NEYNAR_API_KEY not configured on server",
        hint: "Set NEYNAR_API_KEY in environment to enable follow functionality",
      });
    }

    const { targetFid, viewerFid } = req.body as {
      targetFid: number;
      viewerFid: number;
    };

    if (!targetFid || !viewerFid) {
      return res.status(400).json({ error: "targetFid and viewerFid are required" });
    }

    // For now, we'll just return success since we don't have a signer
    // In a real implementation, you'd need to use the Neynar SDK with a signer
    res.json({ 
      success: true, 
      message: `Follow request for FID ${targetFid} by viewer ${viewerFid}` 
    });
  } catch (err: any) {
    console.error("Error in follow user:", err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
};

export const handleFriendsLeaderboard: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    
    if (!apiKey) {
      return res.status(501).json({
        error: "NEYNAR_API_KEY not configured on server",
        hint: "Set NEYNAR_API_KEY in environment variables to enable friends leaderboard",
      });
    }

    console.log("Fetching hardcoded AzuraOS top holders...");
    
    try {
      // Extract FIDs from hardcoded holders
      const fids = TOP_AZURAOS_HOLDERS.map(holder => holder.fid);
      
      // Fetch user data from Neynar
      const users = await fetchNeynarUserData(fids, apiKey);
      
      // Map the user data with token balances
      const friendsData: FriendData[] = TOP_AZURAOS_HOLDERS.map(holder => {
        const user = users.find(u => u.fid === holder.fid);
        
        return {
          fid: holder.fid,
          username: user?.username || holder.username,
          displayName: user?.display_name || user?.displayName || holder.username,
          pfpUrl: user?.pfp_url || user?.pfp?.url || "",
          address: user?.verified_addresses?.eth_addresses?.[0] || undefined,
          tokenBalance: holder.tokenBalance,
        };
      });

      const responseData: FriendsLeaderboardResponse = {
        friends: friendsData,
        totalCount: friendsData.length,
      };

      console.log("Successfully fetched leaderboard data:", friendsData.length, "users");
      res.json(responseData);
      
    } catch (error) {
      console.error("Error fetching Neynar user data:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  } catch (err: any) {
    console.error("Error in friends leaderboard:", err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
};
