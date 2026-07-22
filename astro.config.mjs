import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";
import UnoCSS from "unocss/astro";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  integrations: [UnoCSS(), preact()],
  adapter: vercel(),
});
