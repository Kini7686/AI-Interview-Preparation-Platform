import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // next-auth imports `next/server` without the .js extension (Node ESM)
      "next/server": path.resolve(__dirname, "./node_modules/next/server.js"),
      "next/navigation": path.resolve(
        __dirname,
        "./node_modules/next/navigation.js",
      ),
    },
  },
});
