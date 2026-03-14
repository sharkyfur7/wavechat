import { db } from "../db.js";
import { message, user } from "./schema.js";
import { eq } from "drizzle-orm";
import { User } from "better-auth";
import { ChatMessage } from "@wavechat/shared";

export async function insertMessage(
  content: string,
  channelId: string,
  user: User,
): Promise<ChatMessage> {
  let result = (
    await db
      .insert(message)
      .values({
        userId: user.id,
        content,
        channelId,
      })
      .returning()
  )[0];

  let msg: ChatMessage = {
    id: result.id,
    content: result.content,
    channelId: result.channelId,
    user: { id: user.id, name: user.name },
    createdAt: result.createdAt,
  };

  return msg;
}

export async function getMessages(channelId: string, limit = 50): Promise<ChatMessage[]> {
  const result = await db
    .select({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      channelId: message.channelId,
      user: {
        id: user.id,
        name: user.name,
      },
    })
    .from(message)
    .innerJoin(user, eq(message.userId, user.id))
    .where(eq(message.channelId, channelId))
    .orderBy(message.createdAt)
    .limit(limit);

  return result;
}
