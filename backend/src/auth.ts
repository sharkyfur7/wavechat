import { betterAuth } from "better-auth";
import dotenv from "dotenv";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import * as schema from "./db/schema.js";

dotenv.config({ quiet: true });

if (!process.env.BETTER_AUTH_TRUSTED_ORIGIN)
  throw new Error("env var BETTER_AUTH_TRUSTED_ORIGIN not set!");

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  basePath: "/auth",
  trustedOrigins: [process.env.BETTER_AUTH_TRUSTED_ORIGIN],
  emailAndPassword: { enabled: true },
});
