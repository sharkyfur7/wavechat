import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { addChannelMember, createChannel } from "../db/channel.js";
import { getUserChannels } from "../db/user.js";

const apiRoutes = Router();

apiRoutes.get("/", (req, res) => {
  res.status(200).json("I am alive.");
});

apiRoutes.post("/createChannel", requireAuth, async (req, res) => {
  const { channelName } = req.body;
  await createChannel(channelName);

  res.sendStatus(201);
});

apiRoutes.post("/addChannelMember", requireAuth, async (req, res) => {
  const { userId, channelId } = req.body;

  try {
    await addChannelMember(channelId, userId);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

apiRoutes.get("/getUserChannels", requireAuth, async (req, res) => {
  res.status(200).json({ channels: await getUserChannels(req.user.id) });
});

export default apiRoutes;
