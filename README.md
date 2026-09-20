# gz-codemap

> Scan any codebase, auto-generate OpenCode/Cursor/Copilot config files. Go from blank to productive in one command.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Ground Zero LLC](https://img.shields.io/badge/Built%20by-Ground%20Zero%20LLC-purple)](https://github.com/oke3)
[![npm](https://img.shields.io/npm/v/@ground-zero-llc/gz-codemap)](https://www.npmjs.com/package/@ground-zero-llc/gz-codemap)
[![CI](https://github.com/oke3/gz-codemap/actions/workflows/ci.yml/badge.svg)](https://github.com/oke3/gz-codemap/actions)

---

## Why

Every new AI-assisted project starts with a blank config directory. You need:

- An `AGENTS.md` that describes your stack, conventions, and how to build/test
- A working `opencode.json` with permissions, model config, formatters
- Custom agent personas for your React/API/Astro developers
- `.cursorrules` and Copilot instructions so every IDE gets the same context
- Convenience commands wired from your `package.json` scripts

Writing all this by hand every time is tedious, inconsistent, and easy to get wrong. You end up copy-pasting from old projects, missing framework-specific conventions, or forgetting that your Python project uses `ruff` not `flake8`.

**codemap** reads your project, figures out what you're using, and generates everything in seconds. One command. Zero config files to write yourself.

## Quick Start

```bash
# One-shot: scan + generate in your current directory
npx @ground-zero-llc/gz-codemap

# Scan a specific project
npx @ground-zero-llc/gz-codemap ./path/to/project

# Preview without writing files
npx @ground-zero-llc/gz-codemap --dry-run ./path

# Overwrite existing config files
npx @ground-zero-llc/gz-codemap --force ./path
```

## What It Detects

codemap scans your project for language-specific config files, framework dependencies, tooling, and structural patterns.

| Project Type | Detection Method | Example Output |
|---|---|---|
| **Web frameworks** | `package.json` dependencies | Next.js, React, Astro, Solid, Qwik, Lit, Hono, Angular, NestJS |
| **Mobile frameworks** | `package.json` dependencies | React Native, Expo |
| **CLI tools** | `package.json` `bin` field | CLI tool config, entry point routing |
| **Libraries** | `package.json` `main` / `exports` | Library conventions, build commands |
| **Python** | `pyproject.toml`, `setup.py`, `Pipfile` | Ruff, pytest, black, hatch/poetry/uv |
| **Go** | `go.mod` | `go test`, `gofmt`, golangci-lint |
| **Rust** | `Cargo.toml` | `cargo test`, `rustfmt`, clippy |
| **Docker** | `Dockerfile`, `docker-compose.yml` | Container build, compose commands |
| **Environment** | `.env.example`, `.env.sample` | Env var reference |
| **Config files** | Project-root config files | Tailwind CSS, PostCSS, Prisma, Turbo, Nx, Lerna, Flutter |
| **Tooling** | Config files + deps | vitest, jest, eslint, prettier, biome, tsc |

## What It Generates

| File | Content |
|------|---------|
| **`AGENTS.md`** | Project identity, stack, build/test/lint/format commands, directory structure, conventions |
| **`opencode.json`** | Runtime config: model selection, permissions, formatters, LSP, instructions reference |
| **`.cursorrules`** | Cursor AI project rules (framework conventions, lint/test commands) |
| **`.github/copilot-instructions.md`** | GitHub Copilot project context |
| **`.opencode/agents/*.md`** | Custom agent personas (react-dev, api-dev, astro-dev, type-dev) |
| **`.opencode/commands/*.md`** | One command file per `package.json` script — dev, build, test, lint, commit, and any custom scripts |

### Example: Next.js Project

```
# my-project
## Stack
- Language: TypeScript
- Framework: Next.js
## Build & Test
- Lint: npm run lint (eslint)
- Test: npm test (vitest)
- Build: npm run build
- Type check: npx tsc --noEmit
## Project Structure
- Primary framework: Next.js
- Entry points: src/app/page.tsx
## Conventions
- TypeScript (strict mode)
- ES modules, async/await
```

### Example: Python Project

```
# my-python-app
## Stack
- Language: Python
## Build & Test
- Lint: pipx run ruff check . (ruff)
- Format: ruff format . (ruff)
- Test: pytest
- Install: pip install -e .
## Framework Notes
- Python project — follow PEP 8 conventions.
```

### Example: Go Project

```
# my-service
## Stack
- Language: Go
## Build & Test
- Test: go test ./...
- Build: go build ./...
- Format: gofmt -s -w . (gofmt)
## Framework Notes
- Go project — follow standard Go layout conventions.
```

## Architecture

Plugin-based. **Scanners** analyze the project, **generators** produce config files. Both are extensible — add your own scanners for company-internal tooling or generators for custom config formats.

```
┌──────────────┐
│  File        │  Files, directories, entry points, language extensions
│  Scanner     │  (gitignore-aware tree walk)
└──────┬───────┘
┌──────────────┐
│  Frameworks  │  Web/mobile frameworks from deps, test runners, linters,
│  Scanner     │  formatters, CLI/lib detection, tsc detection, config files
│              │  (Tailwind, PostCSS, Prisma, Turbo, Nx, Lerna, Flutter)
└──────┬───────┘
┌──────────────┐
│  Languages   │  Python (pyproject.toml), Go (go.mod), Rust (Cargo.toml)
│  Scanner     │  Language-specific tooling detection, Docker, env files
└──────┬───────┘
┌──────────────┐
│  Monorepo    │  Workspace detection (npm/yarn/pnpm workspaces, lerna, nx)
│  Scanner     │  Per-workspace config generation
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│   ProjectModel   │  Aggregated data consumed by generators
└────────┬─────────┘
         │
         ▼
┌──────────────┬──────────────┬─────────────────┬──────────────┬─────────────────┐
│  AGENTS.md   │ opencode.json│ Custom Agents   │  Commands    │  Multi-Tool     │
│  Generator   │  Generator   │  Generator      │  Generator   │  Generator      │
└──────────────┴──────────────┴─────────────────┴──────────────┴─────────────────┘
```

### Plugin Interfaces

Both scanners and generators follow simple plugin contracts:

```ts
// Copyright (c) 2026 Ground Zero LLC.
import type { ScannerPlugin } from "@ground-zero-llc/gz-codemap";

export const myScanner: ScannerPlugin = {
  name: "my-scanner",
  async scan(ctx) {
    // analyze ctx.projectRoot
    return { type: "my-scanner", data: { /* ... */ } };
  },
};
```

```ts
// Copyright (c) 2026 Ground Zero LLC.
import type { GeneratorPlugin } from "@ground-zero-llc/gz-codemap";

export const myGenerator: GeneratorPlugin = {
  name: "my-generator",
  async generate(project) {
    return [{
      path: "MY_FILE.md",
      content: "# generated for " + project.name,
      overwrite: true,
    }];
  },
};
```

### Using Custom Plugins

```ts
// Copyright (c) 2026 Ground Zero LLC.
import { scan, generate } from "@ground-zero-llc/gz-codemap";
import { myScanner } from "./my-scanner.js";
import { myGenerator } from "./my-generator.js";

// Scan with custom scanner (merged with defaults)
const model = await scan("/path/to/project", {
  scanners: [myScanner],
});

// Generate with custom generator (merged with defaults)
const files = await generate(model, {
  generators: [myGenerator],
});
```

## CLI Reference

```
gz-codemap [command] [path] [options]

Commands:
  (default)     Scan + generate in one shot
  scan          Scan only — saves .scan.json for inspection
  generate      Generate from previously saved .scan.json
  update        Re-scan and only overwrite files that changed

Options:
  --dry-run     Preview output without writing files
  --force       Overwrite existing config files
  --quiet       Minimal output (useful in CI)
  --output DIR  Generate to a different output directory
```

### Examples

```bash
# One-shot scan + generate
npx @ground-zero-llc/gz-codemap

# Scan a specific project
npx @ground-zero-llc/gz-codemap ./path/to/project

# Preview without writing files
npx @ground-zero-llc/gz-codemap --dry-run ./path

# Scan only — saves .scan.json for inspection
npx @ground-zero-llc/gz-codemap scan ./path

# Generate from previously saved .scan.json
npx @ground-zero-llc/gz-codemap generate ./path

# Generate to a different output directory
npx @ground-zero-llc/gz-codemap generate ./path --output ./out

# Update — re-scans and only overwrites files that changed (preserves manual edits)
npx @ground-zero-llc/gz-codemap update ./path

# Overwrite existing config files
npx @ground-zero-llc/gz-codemap --force ./path

# Minimal output (useful in CI)
npx @ground-zero-llc/gz-codemap --quiet ./path
```

## Library API

```ts
// Copyright (c) 2026 Ground Zero LLC.
import { scan, generate, buildProject } from "@ground-zero-llc/gz-codemap";

// Scan a project → returns a typed ProjectModel
const model = await scan("/path/to/project");

// Generate config files from the model
const files = await generate(model);

// Or do both in one call
const { model, files } = await buildProject("/path/to/project");
```

## How It Compares

| Tool | Approach | Multi-language | Plugin system | AI IDE output |
|------|----------|----------------|---------------|---------------|
| **gz-codemap** | Scan → generate pipeline | JS/TS/Python/Go/Rust | Scanners + generators | OpenCode, Cursor, Copilot |
| Manual setup | Copy-paste from old projects | Single language only | None | Whatever you write |
| Copilot instructions | Static templates | Limited | No | Copilot only |
| Cursor rules | Static templates | Limited | No | Cursor only |

codemap is the only tool that generates config for **three AI coding tools at once** from a single scan, with full multi-language support and a plugin architecture for custom tooling.

## Related Projects

- [gz-modelrouter](https://github.com/oke3/gz-modelrouter) — Intelligent LLM cost router
- [gz-gateway](https://github.com/oke3/gz-gateway) — OpenAI-compatible AI gateway — rate limiting, caching, failover, cost tracking
- [gz-context-engine](https://github.com/oke3/gz-context-engine) — Production-grade RAG context engine
- [gz-sessions](https://github.com/oke3/gz-sessions) — Persistent cross-session memory for agents
- [gz-bench](https://github.com/oke3/gz-bench) — Benchmarking suite for AI coding tools
- [gz-remote](https://github.com/oke3/gz-remote) — Drive OpenCode over SSH

## Development

```bash
git clone https://github.com/oke3/gz-codemap
cd gz-codemap
npm install
npm run dev        # watch mode
npm test           # 38+ tests
npm run build      # production build
npm run lint       # type-check
```

Requires Node.js 18+.

---

## Enterprise Support

Need this customized for your infrastructure? We offer:

- **Integration consulting** — Wire gz-codemap into your CI/CD pipeline
- **Custom configuration** — Task-specific rules, models, and workflows for your team
- **Managed deployment** — We host and maintain your instance
- **Training workshops** — Hands-on sessions for your engineering team

[Book a 30-min call](https://www.grndxero.com/brief) · [See pricing](https://www.grndxero.com/pricing)

---

## License

MIT — Ground Zero LLC

---

Built by [Ground Zero LLC](https://github.com/oke3) — AI infrastructure for the agentic age.
