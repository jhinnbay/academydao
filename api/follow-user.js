export default async function handler(req, res) {
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
        hint: "Set NEYNAR_API_KEY in environment to enable follow functionality",
      });
    }

    const { targetFid, viewerFid } = req.body;

    if (!targetFid || !viewerFid) {
      return res.status(400).json({ error: "targetFid and viewerFid are required" });
    }

    // For now, we'll just return success since we don't have a signer
    // In a real implementation, you'd need to use the Neynar SDK with a signer
    res.status(200).json({ 
      success: true, 
      message: `Follow request for FID ${targetFid} by viewer ${viewerFid}` 
    });
  } catch (err) {
    console.error("Error in follow user:", err);
    res.status(500).json({ error: err?.message || "Unknown error" });
  }
}
