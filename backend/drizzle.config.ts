import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
