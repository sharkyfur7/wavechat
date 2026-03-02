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
    res.status(400).json({ error: "channelName is empty" });
    return;
  }

  await createChannel(channelName_str);

  res.status(201).json({ status: "created" });
});

apiRoutes.post("/addChannelMember", requireAuth, async (req, res) => {
  const { userId, channelId } = req.body;

  if (!userId || !channelId) {
    res.status(400).json({ error: "userId/channelId is missing" });
    return;
  }

  const user = await getUser(userId);
  const channel = await getChannel(channelId);

  if (!user || !channel) {
    res.status(400).json({ error: "user/channel does not exist" });
    return;
  }

  try {
    await addChannelMember(channelId, userId);
    res.status(200).json({ status: "OK" });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

apiRoutes.get("/getUserChannels", requireAuth, async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  res.status(200).json({ channels: await getUserChannels(req.user.id) });
});

export default apiRoutes;
