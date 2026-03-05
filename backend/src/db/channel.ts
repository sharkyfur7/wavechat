import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { channel, channelMember, user } from "./schema.js";
import { Channel } from "@wavechat/shared";
import { getUser } from "./user.js";
import { getServerUsers } from "./server.js";

export async function getChannel(channelId: string): Promise<Channel | null> {
  return (await db.select().from(channel).where(eq(channel.id, channelId)))[0] ?? null;
}

export async function createChannel(name: string, serverId: string | null): Promise<Channel> {
  let c = (await db.insert(channel).values({ name, serverId }).returning())[0];

  if (serverId) {
    const server_members = await getServerUsers(serverId);
    for (const member of server_members) {
      await addChannelMember(c.id, member.id);
    }
  }

  return c;
}

export async function addChannelMember(channelId: string, userId: string) {
  const channel = await getChannel(channelId);
  const user = await getUser(userId);

  if (!channel) {
    throw new Error(`Channel id ${channelId} does not exist!`);
  }

  if (!user) {
    throw new Error(`User id ${userId} does not exist!`);
  }

  const user_memberships = await db
    .select()
    .from(channelMember)
    .where(eq(channelMember.userId, user.id));

  for (let i = 0; i < user_memberships.length; i++) {
    if (user_memberships[i].channelId === channelId) {
      console.log(`User ${user.name} is already a member of ${channel.name}`);
      return;
    } // user is already a member
  }

  console.log(`Adding ${user.name} to ${channel.name}`);

  const result = (
    await db
      .insert(channelMember)
      .values({
        channelId,
        userId,
      })
      .returning()
  )[0];

  return result;
}
