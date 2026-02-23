# Team Pulse - AI Agent Instructions

## Project Overview

Team Pulse is a pnpm-based monorepo workspace. The project is in early setup phase with core tooling configured but no application code yet.

## Tech Stack & Tooling

- **Package Manager**: pnpm v10.28.1 (required - enforced via packageManager field)
- **Linter/Formatter**: Biome v2.3.14+ (replaces ESLint/Prettier)
- **Workspace**: pnpm monorepo structure (uses `pnpm -r` for recursive commands)

## Development Workflow

### Essential Commands
```bash
pnpm dev       # Run dev servers for all workspace packages
pnpm build     # Build all workspace packages
pnpm lint      # Lint all packages with Biome
pnpm format    # Format all packages with Biome
pnpm check     # Run checks across all packages
```

All commands use `pnpm -r` (recursive) to execute across workspace packages simultaneously.

### Package Manager Notes
- **Always use pnpm**, never npm or yarn (enforced by packageManager field)
- Install dependencies: `pnpm install` or `pnpm i`
- Add dependencies: `pnpm add <package>` (in package directory) or `pnpm add -w <package>` (workspace root)
- The workspace uses pnpm workspaces but has no `pnpm-workspace.yaml` yet - packages will need to be defined when created

## Code Quality

### Biome Configuration
- Biome handles both linting and formatting (no ESLint, no Prettier)
- Run `pnpm lint` to check for issues
- Run `pnpm format` to auto-format code
- Configuration file (biome.json or biome.jsonc) should be created when first package is added

## Project Structure (Planned)

This is a monorepo scaffold. When adding packages/apps:
1. Create directories for packages (e.g., `packages/`, `apps/`)
2. Add `pnpm-workspace.yaml` with workspace pattern:
   ```yaml
   packages:
     - 'packages/*'
     - 'apps/*'
   ```
3. Each workspace package should have its own package.json with scripts matching root (dev, build, lint, format, check)

## Workspace Architecture Guidelines

### When Creating New Packages
- Place shared libraries in `packages/`
- Place applications in `apps/`
- Each package should export clear public APIs
- Use workspace protocol for internal dependencies: `"@team-pulse/package-name": "workspace:*"`

### Script Conventions
Every workspace package should implement these scripts:
- `dev`: Start development mode
- `build`: Production build
- `lint`: Run Biome linting
- `format`: Run Biome formatting
- `check`: Type checking or validation

This ensures root-level `pnpm -r <script>` commands work consistently.

## What to Do Next

When building out this workspace:
1. Create `pnpm-workspace.yaml` defining workspace packages
2. Add first application or library package
3. Configure Biome (create biome.json with project-specific rules)
4. Add TypeScript if needed (tsconfig.json)
5. Set up .gitignore for common patterns (node_modules, dist, .env, etc.)
6. Update this file with actual architecture decisions and patterns as they emerge
