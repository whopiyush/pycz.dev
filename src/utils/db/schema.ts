import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    key: text("key", { length: 200 }).notNull(),
    url: text("url").notNull(),
    description: text("description"),
    enabled: integer("enabled", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(strftime('%s', 'now'))`,
    ),
  },
  (table) => ({
    keyIndex: uniqueIndex("key_idx").on(table.key),
  }),
);

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
