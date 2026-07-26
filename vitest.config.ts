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
    // Task 15: Node 22+ ships its own experimental global `localStorage`
    // (flag `--experimental-webstorage`, on by default on this machine's
    // Node 25). jsdom's Window also defines its own per-window
    // `localStorage`, and the two collide: under Vitest's worker process,
    // `window.localStorage` resolved to Node's native implementation
    // instead of jsdom's, which silently no-ops without a
    // `--localstorage-file` path configured (observed:
    // `window.localStorage.clear` -- and every other Storage method --
    // missing at runtime, no error surfaced, and a
    // "`--localstorage-file` was provided without a valid path" warning on
    // stderr). `--no-experimental-webstorage` on the test worker's own
    // process removes Node's native global so jsdom's own
    // `window.localStorage` (which the consent store and analytics'
    // first-touch UTM capture both depend on) wins instead. `poolOptions`
    // was removed in Vitest 4 (its `execArgv` is now this top-level
    // option -- Vitest prints a deprecation warning and ignores the old
    // nested shape if used instead, which silently drops this flag).
    execArgv: ["--no-experimental-webstorage"],
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
