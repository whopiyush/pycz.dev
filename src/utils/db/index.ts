import { and, eq, like, or } from "drizzle-orm";
import db from "./connection";
import { links, type Link, type NewLink } from "./schema";

// Resolve a redirect: return URL for a given key, bump clicks
export async function resolveLink(key: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(links)
    .where(and(eq(links.key, key), eq(links.enabled, true)))
    .limit(1);

  const link = rows[0];
  if (!link) return null;

  db.update(links).set({ clicks: link.clicks + 1 }).where(eq(links.id, link.id));
  return link.url;
}

// List all links (optionally filter by search term)
export async function listLinks(search?: string): Promise<Link[]> {
  return db
    .select()
    .from(links)
    .where(
      search ? or(like(links.key, `%${search}%`), like(links.url, `%${search}%`)) : undefined,
    )
    .orderBy(links.createdAt);
}

// Create a new link
export async function createLink(data: NewLink): Promise<Link> {
  const result = await db.insert(links).values(data).returning();
  if (!result[0]) throw new Error("Failed to create link");
  return result[0];
}

// Update a link by id
export type UpdateLinkData = Partial<Pick<NewLink, "key" | "url" | "description" | "enabled">>;
export async function updateLink(id: string, data: UpdateLinkData): Promise<Link> {
  const result = await db
    .update(links)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(links.id, id))
    .returning();
  if (!result[0]) throw new Error("Link not found");
  return result[0];
}

// Delete a link by id
export async function deleteLink(id: string): Promise<void> {
  await db.delete(links).where(eq(links.id, id));
}
