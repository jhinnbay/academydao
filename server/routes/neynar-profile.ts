import type { RequestHandler } from "express";

interface NeynarUserResponse {
  result?: { user?: any };
  user?: any;
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

function mapUser(user: any) {
  const profile = user?.profile || user || {};
  return {
    fid: user?.fid ?? user?.id ?? null,
    username: user?.username ?? user?.handle ?? user?.fname ?? null,
    displayName: profile?.display_name || profile?.name || user?.display_name || null,
    pfpUrl:
      profile?.pfp_url ||
      profile?.avatar_url ||
      user?.pfp_url ||
      user?.avatar_url ||
      null,
    bio: profile?.bio?.text || profile?.bio || null,
    followerCount: user?.follower_count ?? null,
    followingCount: user?.following_count ?? null,
    raw: user || null,
  };
}

export const handleFarcasterProfile: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        error: "NEYNAR_API_KEY not configured on server",
        hint: "Set NEYNAR_API_KEY in environment to enable Farcaster profile fallback",
      });
    }

    const { fid, username, address } = req.query as {
      fid?: string;
      username?: string;
      address?: string;
    };

    let user: any = null;

    // Try by fid
    if (fid) {
      try {
        const data = await fetchNeynar(`/v2/farcaster/user?fid=${encodeURIComponent(fid)}`, apiKey);
        user = (data as any).result?.user || (data as any).user || null;
      } catch (e) {}
    }

    // Try by username
    if (!user && username) {
      try {
        const data = await fetchNeynar(
          `/v2/farcaster/user-by-username?username=${encodeURIComponent(username)}`,
          apiKey,
        );
        user = (data as any).result?.user || (data as any).user || null;
      } catch (e) {}
    }

    // Try by verified address
    if (!user && address) {
      try {
        const data = await fetchNeynar(
          `/v2/farcaster/user-by-verification?address=${encodeURIComponent(address)}`,
          apiKey,
        );
        user = (data as any).result?.user || (data as any).user || null;
      } catch (e) {}
    }

    if (!user) {
      return res.status(404).json({ error: "Farcaster user not found" });
    }

    const mapped = mapUser(user);
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
};
