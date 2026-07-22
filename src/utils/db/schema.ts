import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    key: text("key", { length: 200 }).notNull(),
    parent: text("parent").default("none").notNull(),
    description: text("description"),
    url: text("url").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(strftime('%s', 'now'))`
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(strftime('%s', 'now'))`
    ),
  },
  (links) => ({
    keyIndex: uniqueIndex("key_idx").on(links.key),
  })
);

export type LinksSchema = typeof links.$inferInsert;
