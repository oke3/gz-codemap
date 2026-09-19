// Copyright (c) 2026 Ground Zero LLC. All rights reserved.

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { scan, generate } from "../../src/index.js";

const fixtures = resolve(fileURLToPath(new URL(".", import.meta.url)), "../fixtures/react-app");

describe("config generator", () => {
  it("generates opencode.json with model and permissions", async () => {
    const model = await scan(fixtures);
    const files = await generate(model);
    const config = files.find((f) => f.path === "opencode.json");
    expect(config).toBeDefined();
    expect(config!.content).toContain("opencode.ai/config.json");
    expect(config!.content).toContain("anthropic/claude-sonnet-4-5"); // react-app fixture classifies as heavy → sonnet
    expect(config!.content).toContain("claude-haiku");
    expect(config!.content).toContain('"build"');
    expect(config!.overwrite).toBe(false);
  });
});
