import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { channel, channelMember, user } from "./schema.js";

export async function createChannel(name) {
  return await db.insert(channel).values({ name }).returning();
}

export async function addChannelMember(channelId: number, userId: string) {
  const channel_row = await db.select().from(channel).where(eq(channel.id, channelId));
  const user_row = await db.select().from(user).where(eq(user.id, userId));

  if (!channel_row) {
    throw new Error(`Channel id ${channelId} does not exist!`);
  }

  if (!user_row) {
    throw new Error(`User id ${userId} does not exist!`);
  }

  const result = await db
    .insert(channelMember)
    .values({
      channelId,
      userId,
    })
    .returning();

  return result;
}
