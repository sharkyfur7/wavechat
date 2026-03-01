import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { addChannelMember, createChannel, getChannel } from "../db/channel.js";
import { getUser, getUserChannels } from "../db/user.js";

const apiRoutes = Router();

apiRoutes.get("/", (req, res) => {
  res.status(200).json("I am alive.");
});

apiRoutes.post("/createChannel", requireAuth, async (req, res) => {
  const { channelName } = req.body;

  let channelName_str: string = channelName.toString();
  channelName_str = channelName_str.trim();

  if (channelName_str === "") {
    res.sendStatus(400);
    return;
  }

  await createChannel(channelName_str);

  res.sendStatus(201);
});

apiRoutes.post("/addChannelMember", requireAuth, async (req, res) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId) {
    res.sendStatus(400);
    return;
  }

  const user = await getUser(userId);
  const channel = await getChannel(channelId);

  if (!user || !channel) {
    res.sendStatus(400);
    return;
  }

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
