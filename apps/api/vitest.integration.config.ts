import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    // Integration tests share one database; run them serially.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
