import { db } from "../db.js";
import { channel, channelMember } from "./schema.js";
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
