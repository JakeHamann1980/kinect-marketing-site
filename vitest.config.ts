import { defineConfig } from "vitest/config";
import path from "node:path";

// Task 9 (FAQ accordion) needs jsdom + Testing Library for component tests.
// Vitest 4 removed the old `environmentMatchGlobs` shortcut in favor of
// `test.projects`, so the existing plain .ts unit tests (content, personas)
// keep running under the fast default "node" environment via one project,
// while .tsx component tests get their own "jsdom" project. The `@/*` alias
// mirrors tsconfig's `paths` mapping to `./src/*` so component imports
// resolve the same way they do for Next.js and TypeScript.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // The Task 9 test file (and Testing Library convention generally) uses
    // the bare `it`/`expect` globals rather than importing them from
    // "vitest". Existing .ts tests already import these explicitly, so
    // turning on globals is additive and doesn't change their behavior.
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
