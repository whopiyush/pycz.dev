import type { Config } from "drizzle-kit";

export default {
  out: "./src/utils/db/migrations",
  schema: "./src/utils/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config;
