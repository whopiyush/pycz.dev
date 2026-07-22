import db from "./connection";
import { links, type LinksSchema } from "./schema";
import { and, eq } from "drizzle-orm";

export async function getLink(key: string) {
  const databaseQueryLinks = await db
    .select()
    .from(links)
    .where(and(eq(links.key, key), eq(links.enabled, true)));

  if (!databaseQueryLinks || !databaseQueryLinks.length) {
    return null;
  }

  return databaseQueryLinks[0].url;
}

export type CreateLinkParams = Omit<LinksSchema, "createdAt" | "updatedAt">;

export async function createLink(data: CreateLinkParams) {
  try {
    const databaseQueryLinks = await db.insert(links).values(data);

    return databaseQueryLinks;
  } catch (error) {
    console.error(`Failed to create link: ${error}`);
    return null;
  }
}
