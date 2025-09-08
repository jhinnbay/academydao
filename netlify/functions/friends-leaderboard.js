// Netlify function for friends leaderboard
const TOP_AZURAOS_HOLDERS = [
  { fid: 286924, username: "jamesdesign.eth", tokenBalance: 13500000 },
  { fid: 1077966, username: "jellofish", tokenBalance: 4680000 },
  { fid: 284618, username: "brennuet", tokenBalance: 4680000 },
  { fid: 194372, username: "roadu", tokenBalance: 2340000 },
  { fid: 99, username: "jesse.base.eth", tokenBalance: 1170000 },
];

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const apiKey = process.env.NEYNAR_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 501,
        headers,
        body: JSON.stringify({
          error: "NEYNAR_API_KEY not configured on server",
          hint: "Set NEYNAR_API_KEY in environment variables to enable friends leaderboard",
        }),
      };
    }

    console.log("Fetching hardcoded AzuraOS top holders...");
    
    try {
      // Extract FIDs from hardcoded holders
      const fids = TOP_AZURAOS_HOLDERS.map(holder => holder.fid);
      
      // Fetch user data from Neynar
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
      const users = data.users || [];
      
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
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(responseData),
      };
      
    } catch (error) {
      console.error("Error fetching Neynar user data:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to fetch user data" }),
      };
    }
  } catch (err) {
    console.error("Error in friends leaderboard:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err?.message || "Unknown error" }),
    };
  }
};