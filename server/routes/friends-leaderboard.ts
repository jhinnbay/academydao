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
      if (hex) {
        return Number(BigInt(hex));
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

export const handleFriendsLeaderboard: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        error: "NEYNAR_API_KEY not configured on server",
        hint: "Set NEYNAR_API_KEY in environment to enable friends leaderboard",
      });
    }

    const { fid, contractAddress } = req.query as {
      fid?: string;
      contractAddress?: string;
    };

    if (!fid) {
      return res.status(400).json({ error: "fid parameter is required" });
    }

    const targetContract = contractAddress || "0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07";

    // Fetch user's following list
    let followingUsers: any[] = [];
    try {
      const followingData = await fetchNeynarFollowing(
        `/v2/farcaster/user/following?fid=${encodeURIComponent(fid)}&limit=100`,
        apiKey,
      );
      followingUsers = (followingData as any).result?.users || (followingData as any).users || [];
    } catch (error) {
      console.error("Error fetching following list:", error);
      return res.status(500).json({ error: "Failed to fetch following list" });
    }

    if (followingUsers.length === 0) {
      return res.json({ friends: [], totalCount: 0 } as FriendsLeaderboardResponse);
    }

    // Map users to friend data
    const friendsData = followingUsers.map(mapUser);

    // Check token ownership for each friend in parallel
    const friendsWithTokens = await Promise.all(
      friendsData.map(async (friend) => {
        if (!friend.address) {
          return { ...friend, tokenBalance: 0 };
        }

        const tokenBalance = await checkTokenOwnership(friend.address, targetContract);
        return { ...friend, tokenBalance };
      })
    );

    // Filter friends who own tokens and sort by token balance
    const friendsWithTokenOwnership = friendsWithTokens
      .filter(friend => friend.tokenBalance > 0)
      .sort((a, b) => b.tokenBalance - a.tokenBalance);

    const response: FriendsLeaderboardResponse = {
      friends: friendsWithTokenOwnership,
      totalCount: friendsWithTokenOwnership.length,
    };

    res.json(response);
  } catch (err: any) {
    console.error("Error in friends leaderboard:", err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
};
