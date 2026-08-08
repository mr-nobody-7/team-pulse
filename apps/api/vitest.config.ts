import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Unit tests only — these must run without a database.
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts", "node_modules/**"],
    testTimeout: 10_000,
  },
});
