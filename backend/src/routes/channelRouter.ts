import { Request, Response, Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { getMessages, insertMessage } from "../db/message.js";
import { wsManager } from "../websocket/WebSocketManager.js";
const channelRouter = Router();

channelRouter.get("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.sendStatus(400);

  let channelId = id.toString();
  res.json(await getMessages(channelId));
});

channelRouter.post("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  if (!req.user) return res.sendStatus(401);

  const { id } = req.params;
  const { content } = req.body;
  let channelId = id.toString();

  // some input validation
  let content_str: string = content.toString();
  content_str = content_str.trim();

  if (content_str === "" || !channelId) {
    res.sendStatus(400);
    return;
  }

  let msg = await insertMessage(content_str, channelId, req.user);

  wsManager.broadcastMessage(msg);

  res.sendStatus(201);
});

export default channelRouter;
