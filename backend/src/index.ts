import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import WebSocket, { WebSocketServer } from "ws";

import { auth } from "./auth.js";
import { insertMessage } from "./db.js";

dotenv.config({ quiet: true });
const DEV_ENV = process.env.DEV_ENV;
const BETTER_AUTH_TRUSTED_ORIGIN = process.env.BETTER_AUTH_TRUSTED_ORIGIN;

const app = express();
const port = Number(process.env.PORT) ?? 3000;
app.use(cors({ origin: BETTER_AUTH_TRUSTED_ORIGIN, credentials: true }));
app.set("trust proxy", 1);
app.use(express.json());

if (!DEV_ENV) {
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
  });

  app.use(limiter);
}

app.get("/", (req, res) => {
  res.status(200).json("I am alive.");
});

app.post("/message", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as Record<string, string> });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  console.log(req.body);
  const { content, channel } = req.body;

  await insertMessage(session.user, channel, content);
});

app.all("/auth/{*any}", toNodeHandler(auth));

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });
const clients = new Map<WebSocket, { userId: string; channelId: number }>();

wss.on("connection", async (ws, req) => {
  const session = await auth.api.getSession({ headers: req.headers as Record<string, string> });

  if (!session) {
    // unauthorized
    ws.close();
    return;
  }

  ws.on("message", (data) => {
    const { type, content, channelId } = JSON.parse(data.toString());

    if (type === "message") {
      console.log(`User ${session.user.name} sent message "${content}" to channelId ${channelId}`);

      clients.forEach((meta, client) => {
        if (meta.channelId === channelId && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "message",
              content,
              userId: session.user.id,
              userName: session.user.name,
            }),
          );
        }
      });
    }

    if (type === "subscribe") {
      clients.set(ws, { userId: session.user.id, channelId: channelId });
    }
  });
});

export default app;
