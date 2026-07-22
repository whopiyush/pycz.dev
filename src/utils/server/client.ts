import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./router";

export function createClient() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "/trpc",
        headers: {
          "x-dashboard-key": localStorage.getItem("key") || "",
        },
      }),
    ],
  });
}
