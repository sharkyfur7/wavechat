import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { addChannelMember, createChannel, getChannel } from "../db/channel.js";
import { getUser, getUserChannels } from "../db/user.js";
import { addUserToServer, createServer, getUserServers } from "../db/server.js";

const apiRoutes = Router();

apiRoutes.get("/", (req, res) => {
  res.status(200).json("I am alive.");
});

apiRoutes.post("/createChannel", requireAuth, async (req, res) => {
  const { channelName } = req.body;

  let channelName_str: string = channelName.toString();
  channelName_str = channelName_str.trim();

  if (channelName_str === "") return res.status(400).json({ error: "channelName is empty" });

  await createChannel(channelName_str);

  res.status(201).json({ status: "created" });
});

apiRoutes.post("/createServer", requireAuth, async (req, res) => {
  const { name } = req.body;

  let server_name: string = name.toString();
  server_name = server_name.trim();

  if (server_name === "") return res.status(400).json({ error: "name is empty" });

  await createServer(server_name);

  res.sendStatus(200);
});

apiRoutes.post("/addServerMember", requireAuth, async (req, res) => {
  const { userId, serverId } = req.body;

  let userId_str: string = userId.toString();
  let serverId_num: number = Number(serverId);
  userId_str = userId_str.trim();

  if (userId_str === "" || !serverId_num)
    return res.status(400).json({ error: "empty userId or serverId" });

  try {
    await addUserToServer(userId_str, serverId_num);
  } catch (e) {
    res.status(400).json({ error: e });
    return;
  }

  res.sendStatus(200);
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

apiRoutes.get("/getUserServers", requireAuth, async (req, res) => {
  if (!req.user) return res.sendStatus(401);

  try {
    res.status(200).json({ servers: await getUserServers(req.user.id) });
  } catch (e) {
    res.status(500).json(e);
  }
});

export default apiRoutes;
