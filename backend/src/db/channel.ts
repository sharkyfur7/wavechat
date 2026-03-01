import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { channel, channelMember, user } from "./schema.js";
import { Channel } from "@wavechat/shared";

export async function getChannel(channelId: number): Promise<Channel | null> {
  return (await db.select().from(channel).where(eq(channel.id, channelId)).limit(1))[0] ?? null;
}

export async function createChannel(name): Promise<Channel> {
  return (await db.insert(channel).values({ name }).returning())[0];
}

export async function addChannelMember(channelId: number, userId: string) {
  const channel_row = await db.select().from(channel).where(eq(channel.id, channelId));
  const user_row = await db.select().from(user).where(eq(user.id, userId));

  if (channel_row.length === 0) {
    throw new Error(`Channel id ${channelId} does not exist!`);
  }

  if (user_row.length === 0) {
    throw new Error(`User id ${userId} does not exist!`);
  }

  const result = await db
    .insert(channelMember)
    .values({
      channelId,
      userId,
    })
    .onConflictDoNothing({ target: [channelMember.channelId, channelMember.userId] })
    .returning()[0];

  return result;
}
