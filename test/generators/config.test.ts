import { resolve } from "node:path";
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
    expect(config!.content).toContain("opencode/gpt-5.1-codex");
    expect(config!.content).toContain("claude-haiku");
    expect(config!.content).toContain('"build"');
    expect(config!.overwrite).toBe(false);
  });
});
