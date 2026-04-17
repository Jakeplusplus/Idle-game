import { defineConfig } from "vite-plus";
import devtoolsJson from "vite-plugin-devtools-json";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["context/**"],
  },
  fmt: {
    ignorePatterns: ["context/**"],
  },
  staged: {
    "*": "vp check --fix",
  },
  plugins: [sveltekit(), devtoolsJson()],
  test: {
    expect: { requireAssertions: true },
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
