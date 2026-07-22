import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { APIRoute } from "astro";
import { createContext } from "../../utils/server/context";
import { appRouter } from "../../utils/server/router";

export const ALL: APIRoute = ({ params, request }) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: request,
    router: appRouter,
    createContext,
  });
};
