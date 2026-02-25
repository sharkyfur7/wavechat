import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { User } from "better-auth";
import { message } from "./db/schema.js";

dotenv.config({ quiet: true });

const sqlite = new Database(process.env.DB_FILE_NAME! ?? "local.sqlite");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export async function insertMessage(user: User, channelId: number, content: string) {
  await db.insert(message).values({ authorId: user.id, content, channelId });
}
