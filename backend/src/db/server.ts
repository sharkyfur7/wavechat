import { Channel, Server } from "@wavechat/shared";
import { db } from "../db.js";
import { channel, server, serverMember, user } from "./schema.js";
import { and, eq, getTableColumns } from "drizzle-orm";
import { getUser } from "./user.js";
import { addChannelMember } from "./channel.js";
import { User } from "better-auth";

export async function createServer(name: string): Promise<Server> {
  return (await db.insert(server).values({ name }).returning())[0];
}

export async function getServer(serverId: string): Promise<Server | null> {
  return (await db.select().from(server).where(eq(server.id, serverId)))[0] ?? null;
}

export async function getServerUsers(serverId: string): Promise<User[]> {
  return await db
    .select({
      ...getTableColumns(user),
    })
    .from(serverMember)
    .where(eq(serverMember.serverId, serverId))
    .innerJoin(user, eq(user.id, serverMember.userId));
}

export async function addUserToServer(userId: string, serverId: string): Promise<void> {
  if (!(await getServer(serverId))) throw new Error(`Server with id ${serverId} does not exist`); // server does not exist
  if (!(await getUser(userId))) throw new Error(`User with id ${userId} does not exist`); // user does not exist
  if (await isUserServerMember(userId, serverId)) return; // user is already a member

  await db.insert(serverMember).values({ userId, serverId });

  // server members should be members of all server channels for now
  let server_channels = await db.select().from(channel).where(eq(channel.serverId, serverId));
  for (const serverChannel of server_channels) {
    await addChannelMember(serverChannel.id, userId);
  }

  return;
}

export async function getUserServers(userId: string): Promise<Server[]> {
  if (!(await getUser(userId))) throw new Error(`User with id ${userId} does not exist`);

  return await db
    .select({
      ...getTableColumns(server),
    })
    .from(serverMember)
    .innerJoin(server, eq(server.id, serverMember.serverId))
    .where(eq(serverMember.userId, userId));
}

export async function isUserServerMember(userId: string, serverId: string): Promise<boolean> {
  const user_row = (
    await db
      .select()
      .from(serverMember)
      .where(and(eq(serverMember.userId, userId), eq(serverMember.serverId, serverId)))
  )[0];

  if (user_row) return true;
  return false;
}
