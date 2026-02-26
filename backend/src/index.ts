import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import WebSocket, { WebSocketServer } from "ws";

import { auth } from "./auth.js";
import { insertMessage } from "./db.js";
import { ChatMessage } from "./types.js";

dotenv.config({ quiet: true });
const DEV_ENV = process.env.DEV_ENV;
const BETTER_AUTH_TRUSTED_ORIGIN = process.env.BETTER_AUTH_TRUSTED_ORIGIN;

const app = express();
const port = Number(process.env.PORT) ?? 3000;
app.use(cors({ origin: BETTER_AUTH_TRUSTED_ORIGIN, credentials: true }));
app.set("trust proxy", 1);
app.use(express.json());

const clients = new Map<WebSocket, { userId: string; channelId: number }>();

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

function broadcastMessage(msg: ChatMessage) {
  clients.forEach((meta, client) => {
    if (meta.channelId === msg.channelId && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "message",
          message: msg,
        }),
      );
    }
  });
}

app.get("/", (req, res) => {
  res.status(200).json("I am alive.");
});

app.post("/message", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as Record<string, string> });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  console.log(req.body);
  const { content, channelId } = req.body;
  let msg: ChatMessage = {
    content: content,
    channelId: channelId,
    userId: session.user.id,
    userName: session.user.name,
    createdAt: Date.now(),
  };

  await insertMessage(msg);
  broadcastMessage(msg);

  res.sendStatus(200);
});

app.all("/auth/{*any}", toNodeHandler(auth));

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  const session = await auth.api.getSession({ headers: req.headers as Record<string, string> });

  if (!session) {
    console.log("USER UNAUTHORIZED, CLOSING CONNECTION");
    ws.close();
    return;
  }

  console.log(`Connection with ${session.user.name} open`);

  ws.on("message", (data) => {
    const { type, content, channelId } = JSON.parse(data.toString());
    // valid inbound types:
    // message {content: string, channelId: number}
    // subscribe {channelId: number}

    // valid outbound types:
    // message {content: string, userId: string, userName: string}
    // history {history: [{content, userId, userName}, ...]}

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
      console.log(`${session.user.name} subscribed to channel ${channelId}`);

      ws.onclose = () => {
        clients.delete(ws);
        console.log(`Connection with ${session.user.name} closed`);
      };
    }
  });
});

export default app;
