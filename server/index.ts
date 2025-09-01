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

  // Farcaster manifest: serve provided JSON
  app.get("/.well-known/farcaster.json", (_req, res) => {
    res.set("Cache-Control", "public, max-age=600, s-maxage=600");
    res.type("application/json").send(
      JSON.stringify(
        {
          frame: {
            name: "AcademyOS",
            version: "1",
            iconUrl: "https://imgur.com/a/o2JtKzI",
            homeUrl: "https://academydao.vercel.app",
            imageUrl: "https://i.imgur.com/Ovxlwna.png",
            buttonTitle: "Church Of Azura",
            splashImageUrl: "https://i.imgur.com/907bTSF.png",
            splashBackgroundColor: "#000000",
            webhookUrl: "https://academydao.vercel.app/api/webhook",
            subtitle: "Fight A Daemon Model AI",
            description:
              "Azura AI works with the Daemon Model, a new way of sharing governance where agents like her, work side by side with the people.",
            primaryCategory: "entertainment",
            heroImageUrl: "https://i.imgur.com/Ovxlwna.png",
            ogTitle: "Take The Test",
            ogImageUrl: "https://i.imgur.com/Ovxlwna.png",
          },
          accountAssociation: {
            header:
              "eyJmaWQiOjI4NjkyNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDU4RjBlMzlkOTI4MTgxNTk1ZTc4OTQ1MTdmQjI0MDUyMjA0RWIxM0MifQ",
            payload: "eyJkb21haW4iOiJhY2FkZW15ZGFvLnZlcmNlbC5hcHAifQ",
            signature:
              "MHg3ODE5ZDRhNzJiNGMwMzM4MTYwZTg4NjhjMTYwN2FkZDE3ZDQ1NGUwN2NjYjRiMTE5MjNiMzJlNTk5N2VjNTA2MWZjY2IzMWE0N2MwYzIwODAzMjgxZWE4YTE0MTdiZTRjNTZjY2M2N2IxMDJjYTIzMGIyOWU1OTJmMjQ0ZmFhMTFi",
          },
        },
        null,
        2,
      ),
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
