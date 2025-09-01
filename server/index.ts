import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

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

  // Farcaster Mini App manifest: temporary redirect (307) to hosted manifest
  app.get("/.well-known/farcaster.json", (_req, res) => {
    res.set("Cache-Control", "no-store");
    res.redirect(
      307,
      "https://api.farcaster.xyz/miniapps/hosted-manifest/0198f949-5639-ef75-2699-e9c5cbeffb47",
    );
  });

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
