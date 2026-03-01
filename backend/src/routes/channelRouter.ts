import { Request, Response, Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";

import { getMessages, insertMessage } from "../db/message.js";
import { wsManager } from "../websocket/WebSocketManager.js";
const channelRouter = Router();

channelRouter.get("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  res.json(await getMessages(Number(id)));
});

channelRouter.post("/:id/messages", requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  let msg = await insertMessage(content, Number(id), req.user);

  wsManager.broadcastMessage(msg);

  res.sendStatus(201);
});

export default channelRouter;
