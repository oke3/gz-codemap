// Copyright (c) 2026 Ground Zero LLC. All rights reserved.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.test.ts"],
  },
});
