# Contributing to opencode-codemap

Thanks for considering a contribution! codemap reads real projects and generates their OpenCode config — so correctness and restraint matter more than features.

## Development setup

```sh
git clone https://github.com/oke3/opencode-codemap.git
cd opencode-codemap
npm install

npm test        # vitest run — full generator test suite
npm run lint    # tsc --noEmit strict typecheck
npm run build   # tsup -> dist/
```

- Node ≥ 18. No runtime dependencies — dev tooling only (`tsup`, `typescript`, `vitest`).
- Match existing code style: ES modules, `async/await`, strict TypeScript.

## Non-negotiable constraints

1. **Zero runtime dependencies** — Node built-ins only in `src/`.
2. **Generators must never overwrite by default** — generated files go through the existing overwrite/preserve logic.
3. **Every new detection/generator ships with tests** covering the emitted file content.
4. **Strict typecheck must pass** (`npm run lint`) and all tests green before merge.
5. **No telemetry, no network calls, no tracking** — the scanner stays local.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/), as used historically:

```txt
feat: detect astro projects and generate matching agents
fix: plural, stale version strings, dead code, race conditions
chore: bump to v0.2.1, add version-check guard to publish step
```

Prefixes: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `perf`.

## Pull requests

1. Open an issue first for behavior changes or new framework detections.
2. One logical change per PR; include before/after of generated output when relevant.
3. Update tests for any generator change.
4. Bump `package.json` version only in release PRs (CI auto-publishes on version change).

## Reporting bugs

Include: the project type you scanned (frameworks, package manager), the command run (`scan` / `generate` / `update`), expected vs actual output, and the relevant `.scan.json` fragment if possible.
