// Netlify function for friends leaderboard
const TOP_AZURAOS_HOLDERS = [
  { fid: 286924, username: "jamesdesign.eth", tokenBalance: 13500000 }, // 13.5M tokens
  { fid: 1077966, username: "jellofish", tokenBalance: 4680000 },      // 4.68M tokens
  { fid: 284618, username: "brennuet", tokenBalance: 4680000 },        // 4.68M tokens
  { fid: 194372, username: "roadu", tokenBalance: 2340000 },           // 2.34M tokens
  { fid: 99, username: "jesse.base.eth", tokenBalance: 1170000 },      // 1.17M tokens
];

async function fetchNeynarUserData(fids, apiKey) {
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

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error("Error fetching Neynar user data:", error);
    return [];
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
      const friendsData = TOP_AZURAOS_HOLDERS.map(holder => {
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

      const responseData = {
        friends: friendsData,
        totalCount: friendsData.length,
      };

      console.log("Successfully fetched leaderboard data:", friendsData.length, "users");
      res.status(200).json(responseData);
      
    } catch (error) {
      console.error("Error fetching Neynar user data:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  } catch (err) {
    console.error("Error in friends leaderboard:", err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
};

module.exports = { handler };
