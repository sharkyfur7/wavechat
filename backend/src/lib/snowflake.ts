import { Snowflake } from "@sapphire/snowflake";

// initial commit date of wavechat
const epoch = new Date("2026-02-24T15:56:16+01:00");
export const snowflake = new Snowflake(epoch);

export function generateSnowflake(): string {
  return snowflake.generate().toString();
}
