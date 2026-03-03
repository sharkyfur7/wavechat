import { Channel, Server } from "@wavechat/shared";
import { db } from "../db.js";
import { channel, server, serverMember } from "./schema.js";
import { and, eq, getTableColumns } from "drizzle-orm";
import { getUser } from "./user.js";

export async function createServer(name: string): Promise<Server> {
  return (await db.insert(server).values({ name }).returning())[0];
}

export async function getServer(serverId: number): Promise<Server | null> {
  return (await db.select().from(server).where(eq(server.id, serverId)))[0] ?? null;
}

export async function addUserToServer(userId: string, serverId: number): Promise<void> {
  if (!(await getServer(serverId))) throw new Error(`Server with id ${serverId} does not exist`); // server does not exist
  if (!(await getUser(userId))) throw new Error(`User with id ${userId} does not exist`); // user does not exist
  if (await isUserServerMember(userId, serverId)) return; // user is already a member

  await db.insert(serverMember).values({ userId, serverId });
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

export async function isUserServerMember(userId: string, serverId: number): Promise<boolean> {
  const user_row = (
    await db
      .select()
      .from(serverMember)
      .where(and(eq(serverMember.userId, userId), eq(serverMember.serverId, serverId)))
  )[0];

  if (user_row) return true;
  return false;
}
