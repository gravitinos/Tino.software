import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: process.env.VERCEL ? "vercel" : undefined,
  compatibilityDate: "2025-07-15",
  serverDir: "./server",
  vercel: {
    functions: {
      "/**": { runtime: "bun" },
    },
  },
});
