import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

dotenv.config({ quiet: true });

const sqlite = new Database(process.env.DB_FILE_NAME! ?? "local.sqlite");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite);
