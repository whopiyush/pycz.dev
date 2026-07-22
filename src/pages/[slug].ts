import type { APIRoute } from "astro";
import { resolveLink } from "../utils/db";

export const GET: APIRoute = async ({ params, redirect }) => {
  const url = await resolveLink(params.slug!);
  if (!url) return redirect("/", 307);
  return redirect(new URL(url).toString(), 307);
};
