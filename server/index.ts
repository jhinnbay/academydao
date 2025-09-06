import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleFarcasterProfile } from "./routes/neynar-profile";
import { handleFriendsLeaderboard, handleFollowUser } from "./routes/friends-leaderboard";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Farcaster profile fallback via Neynar
  app.get("/api/farcaster/profile", handleFarcasterProfile);

  // Friends leaderboard with token ownership
  app.get("/api/friends-leaderboard", handleFriendsLeaderboard);

  // Follow user endpoint
  app.post("/api/follow-user", handleFollowUser);

  // posting form data to n8n webhook
  app.post("/api/chat", async (req, res) => {
    try {
      const { type, content } = req.body;

      const response = await fetch(
        "https://jogibay.app.n8n.cloud/webhook/10207fda-f103-425e-9ab5-59950b3f5f9d/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, content }),
        },
      );

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to reach n8n webhook" });
    }
  });

  return app;
}
