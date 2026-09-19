# gz-codemap

> Built by [Ground Zero LLC](https://github.com/oke3) — AI infrastructure for the agentic age.

**Scan any codebase → auto-generate OpenCode project config.**  
Solves the cold start problem — go from blank to productive in one command.

```bash
npx @ground-zero-llc/gz-codemap
```

## Why

Every new OpenCode project starts blank. You need:
- An `AGENTS.md` describing your stack, conventions, and how to build/test
- A working `opencode.json` with permissions, model config, formatters
- Custom agent personas for your React/API/Astro developers
- Convenience commands wired from `package.json` scripts

Writing all this by hand every time is tedious and error-prone. codemap reads your project, figures out what you're using, and generates everything in seconds.

## Usage

```bash
# One-shot: scan + generate in your current directory
npx @ground-zero-llc/gz-codemap

# Scan a specific project
npx @ground-zero-llc/gz-codemap ./path/to/project

# Preview without writing files
npx @ground-zero-llc/gz-codemap --dry-run ./path

# Overwrite existing config files
npx @ground-zero-llc/gz-codemap --force ./path

# Minimal output (useful in CI)
npx @ground-zero-llc/gz-codemap --quiet ./path

# Scan only — saves .scan.json for inspection
npx @ground-zero-llc/gz-codemap scan ./path

# Generate from previously saved .scan.json
npx @ground-zero-llc/gz-codemap generate ./path

# Generate to a different output directory
npx @ground-zero-llc/gz-codemap generate ./path --output ./out

# Update — re-scans and only overwrites files that changed (preserves manual edits)
npx @ground-zero-llc/gz-codemap update ./path
```

## What it detects

| Project type | Detection method | Example output |
|---|---|---|
| **Web frameworks** | `package.json` dependencies | Next.js, React, Astro, Solid, Qwik, Lit, Hono, Angular, NestJS… |
| **Mobile frameworks** | `package.json` dependencies | React Native, Expo |
| **CLI tools** | `package.json` `bin` field | CLI tool config, entry point routing |
| **Libraries** | `package.json` `main` / `exports` | Library conventions, build commands |
| **Python** | `pyproject.toml`, `setup.py`, `Pipfile` | Ruff, pytest, black, hatch/poetry/uv |
| **Go** | `go.mod` | `go test`, `gofmt`, golangci-lint |
| **Rust** | `Cargo.toml` | `cargo test`, `rustfmt`, clippy |
| **Docker** | `Dockerfile`, `docker-compose.yml`, `.dockerignore` | Container build, compose commands |
| **Environment** | `.env.example`, `.env.sample`, `.env.template` | Env var reference |
| **Config files** | Project-root config files | Tailwind CSS, PostCSS, Prisma, Turbo, Nx, Lerna, Flutter |
| **Tooling** | Config files + deps | vitest, jest, eslint, prettier, biome, tsc —noEmit |

## What it generates

| File | Content |
|------|---------|
| **`AGENTS.md`** | Project identity, stack, build/test/lint/format commands, directory structure, conventions, framework-specific notes in natural language |
| **`opencode.json`** | Runtime config: model selection, permissions, formatters, LSP, instructions reference |
| **`.cursorrules`** | Cursor AI project rules (framework conventions, lint/test commands) |
| **`.github/copilot-instructions.md`** | GitHub Copilot project context |
| **`.opencode/agents/react-dev.md`** | Custom agent persona for React development |
| **`.opencode/agents/api-dev.md`** | Custom agent persona for API/framework work |
| **`.opencode/agents/astro-dev.md`** | Custom agent persona (Astro projects) |
| **`.opencode/agents/type-dev.md`** | Custom agent persona for TypeScript type fixes |
| **`.opencode/commands/*.md`** | One command file per `package.json` script — `dev`, `build`, `test`, `lint`, `commit`, and any custom scripts |

### Example output

A Next.js + React + vitest project:
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

A Python project with ruff + pytest:
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

A Go project:
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

Plugin-based. **Scanners** analyze the project, **generators** produce config files.

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

### Adding a scanner

```ts
import type { ScannerPlugin } from "@ground-zero-llc/gz-codemap";

export const myScanner: ScannerPlugin = {
  name: "my-scanner",
  async scan(ctx) {
    // analyze ctx.projectRoot
    return { type: "my-scanner", data: { /* ... */ } };
  },
};
```

Then inject it:

```ts
import { scan } from "@ground-zero-llc/gz-codemap";
import { myScanner } from "./my-scanner.js";

const model = await scan("/path/to/project", {
  scanners: [myScanner], // merges with defaults
});
```

### Adding a generator

```ts
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

```ts
const files = await generate(model, {
  generators: [myGenerator], // merges with defaults
});
```

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

## License

MIT — oke3

---

