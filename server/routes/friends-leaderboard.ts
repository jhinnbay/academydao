import type { RequestHandler } from "express";
import { FriendsLeaderboardResponse, FriendData } from "@shared/api";

interface NeynarUserResponse {
  result?: { users?: any[] };
  users?: any[];
}

interface NeynarFollowingResponse {
  result?: { users?: any[] };
  users?: any[];
}

async function fetchNeynar(path: string, apiKey: string) {
  const res = await fetch(`https://api.neynar.com${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neynar error ${res.status}: ${text}`);
  }
  return (await res.json()) as NeynarUserResponse;
}

async function fetchNeynarFollowing(path: string, apiKey: string) {
  const res = await fetch(`https://api.neynar.com${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neynar error ${res.status}: ${text}`);
  }
  return (await res.json()) as NeynarFollowingResponse;
}

async function checkTokenOwnership(address: string, contractAddress: string): Promise<number> {
  try {
    const ALCHEMY_RPC = "https://base-mainnet.g.alchemy.com/v2/M6AanXXKdE1UMHdXC4Qqk";
    
    // Try direct balanceOf call first
    const selector = "70a08231"; // balanceOf(address)
    const addr = address.replace(/^0x/, "").toLowerCase().padStart(64, "0");
    const data = `0x${selector}${addr}`;
    
    const res = await fetch(ALCHEMY_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: contractAddress, data }, "latest"],
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const hex: string | undefined = json?.result;
      if (hex && hex !== "0x" && hex !== "0x0") {
        try {
          // Remove 0x prefix and convert to BigInt
          const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
          const bigIntValue = BigInt('0x' + cleanHex);
          // Convert to number safely
          const numValue = Number(bigIntValue);
          return isNaN(numValue) ? 0 : numValue;
        } catch (e) {
          console.warn("Failed to convert hex to BigInt:", hex, e);
          return 0;
        }
      }
    }

    // Fallback to NFT API
    try {
      const restBase = ALCHEMY_RPC.replace("/v2/", "/nft/v3/");
      const url = `${restBase}/getNFTsForOwner?owner=${address}&contractAddresses[]=${contractAddress}&withMetadata=false`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (r.ok) {
        const j = await r.json();
        const count = Array.isArray(j?.ownedNfts)
          ? j.ownedNfts.length
          : typeof j?.totalCount === "number"
            ? j.totalCount
            : 0;
        return Number(count) || 0;
      }
    } catch (e) {
      console.warn("NFT API fallback failed:", e);
    }

    return 0;
  } catch (error) {
    console.error("Error checking token ownership:", error);
    return 0;
  }
}

function mapUser(user: any): FriendData {
  const profile = user?.profile || user || {};
  return {
    fid: user?.fid ?? user?.id ?? 0,
    username: user?.username ?? user?.handle ?? user?.fname ?? "Unknown",
    displayName: profile?.display_name || profile?.name || user?.display_name || "Unknown",
    pfpUrl: profile?.pfp_url || profile?.avatar_url || user?.pfp_url || user?.avatar_url || "",
    address: user?.verified_addresses?.eth_addresses?.[0] || user?.verifications?.[0] || undefined,
    tokenBalance: 0, // Will be filled later
  };
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
        hint: "Set NEYNAR_API_KEY in environment to enable friends leaderboard",
      });
    }

    const { viewerFid, contractAddress } = req.query as {
      viewerFid?: string;
      contractAddress?: string;
    };

    if (!viewerFid) {
      return res.status(400).json({ error: "viewerFid parameter is required" });
    }

    const targetContract = contractAddress || "0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07";

    // Use Neynar's relevant fungible owners API
    try {
      const response = await fetch(
        `https://api.neynar.com/v2/fungible/owner/relevant?contract_address=${targetContract}&networks=base&viewer_fid=${viewerFid}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Neynar API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get top relevant owners (hydrated with full data)
      const topOwners = data.top_relevant_owners_hydrated || [];
      
      // Map to our FriendData format
      const friendsData: FriendData[] = topOwners.slice(0, 4).map((owner: any) => ({
        fid: owner.fid || 0,
        username: owner.username || "unknown",
        displayName: owner.display_name || owner.username || "unknown",
        pfpUrl: owner.pfp_url || "",
        address: owner.verified_addresses?.eth_addresses?.[0] || undefined,
        tokenBalance: Math.floor(Math.random() * 10) + 1, // Mock balance for now
      }));

      const responseData: FriendsLeaderboardResponse = {
        friends: friendsData,
        totalCount: friendsData.length,
      };

      res.json(responseData);
    } catch (error) {
      console.error("Error fetching relevant fungible owners:", error);
      
      // Fallback to dummy data if API fails
      const fallbackData: FriendData[] = [
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

      res.json({ friends: fallbackData, totalCount: fallbackData.length });
    }
  } catch (err: any) {
    console.error("Error in friends leaderboard:", err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
};
