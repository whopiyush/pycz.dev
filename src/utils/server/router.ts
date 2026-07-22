import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createLink, deleteLink, listLinks, resolveLink, updateLink } from "../db";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.isAuthenticated) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});

export const protectedProcedure = t.procedure.use(isAuthenticated);

export const appRouter = t.router({
  // Public: resolves a key for redirect
  resolve: t.procedure.input(z.string()).query(async ({ input }) => {
    return resolveLink(input);
  }),

  // List all links
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      return listLinks(input.search);
    }),

  // Create a link
  create: protectedProcedure
    .input(
      z.object({
        key: z.string().min(1).max(200),
        url: z.string().url(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return createLink({
        id: nanoid(12),
        key: input.key,
        url: input.url,
        description: input.description ?? null,
        enabled: true,
      });
    }),

  // Update a link
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        key: z.string().min(1).max(200).optional(),
        url: z.string().url().optional(),
        description: z.string().optional(),
        enabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateLink(id, data);
    }),

  // Delete a link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await deleteLink(input.id);
    }),
});

export type AppRouter = typeof appRouter;
