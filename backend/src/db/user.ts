import { User } from "better-auth";
import { db } from "../db.js";
import { channel, channelMember, user } from "./schema.js";
import { eq, getTableColumns } from "drizzle-orm";

export async function getUserChannels(userId: string) {
  const result = await db
    .select({
      ...getTableColumns(channel),
    })
    .from(channelMember)
    .innerJoin(channel, eq(channel.id, channelMember.channelId))
    .where(eq(channelMember.userId, userId));

  return result;
}

export async function getUser(userId: string): Promise<User | null> {
  return (await db.select().from(user).where(eq(user.id, userId)).limit(1))[0] ?? null;
}
