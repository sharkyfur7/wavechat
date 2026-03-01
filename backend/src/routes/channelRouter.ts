import { Request, Response, Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { getMessages, insertMessage } from "../db/message.js";
import { wsManager } from "../websocket/WebSocketManager.js";
const channelRouter = Router();

channelRouter.get("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  let channelId = Number(id);

  if (!channelId) {
    res.sendStatus(400);
    return;
  }

  res.json(await getMessages(channelId));
});

channelRouter.post("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  let { content } = req.body;

  // some input validation
  let content_str: string = content.toString();
  content_str = content_str.trim();

  let channelId = Number(id);

  if (content_str === "" || !channelId) {
    res.sendStatus(400);
    return;
  }

  let msg = await insertMessage(content_str, channelId, req.user);

  wsManager.broadcastMessage(msg);

  res.sendStatus(201);
});

export default channelRouter;
