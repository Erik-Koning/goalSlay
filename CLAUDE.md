# CLAUDE.md
This file provides guidance to Claude Code for autonomous, high-quality development.

## Core Principles

### Autonomy Guidelines
- **Think before acting**: Use extended thinking ("think hard" for moderate complexity, "ultrathink" for architectural decisions) before implementing
- **Research first**: Read relevant files and understand context before writing code
- **Verify your work**: Always run tests, type checks, and linting after changes
- **Commit atomically**: Make small, focused commits with descriptive messages
- **Self-correct**: If tests fail, debug and fix without user intervention

### Quality Standards
- All code must pass `pnpm lint` and `pnpm build` before committing
- Follow existing patterns in the codebase
- Add JSDoc comments for public APIs
- Update relevant documentation when changing functionality
- Never commit with failing tests

## Project Overview
Chat Assistant is a PNPM monorepo with the following packages:
- **app-main**: Next.js 16 web application (React 19, App Router)
- **common**: Shared TSX UI components, hooks, and utilities library
- **database**: Shared Prisma schema and client (consumed by both TS and Python)
- **python-backend**: FastAPI + LangGraph commuter assistant

## Commands Reference

### Development
```bash
pnpm dev                    # Start dev server with Turbopack
pnpm build                  # Production build
pnpm lint                   # Lint all packages
pnpm typecheck              # Run TypeScript checks (if available)
```

### Database (Prisma)
```bash
pnpm prisma:generate        # Generate Prisma client in packages/database
pnpm prisma:push            # Push schema to database
```

### Python Backend
```bash
pnpm python:install         # Install Python dependencies (uses uv)
pnpm python:dev             # Start FastAPI dev server on port 8000
pnpm generate:types         # Generate TypeScript types from Python schemas
```

### Package Management
```bash
pnpm add <pkg> -w                          # Add to root
pnpm --filter app-main add <pkg>           # Add to app-main
pnpm --filter common add <pkg>             # Add to common
```

### Git Operations
```bash
git status                  # Check current state
git diff                    # Review changes before committing
git add -p                  # Stage changes interactively
git commit -m "type(scope): description"   # Commit with conventional format
git log --oneline -10       # Review recent history
```

## Tech Stack
- **Framework**: Next.js 16 (canary) with App Router, React 19, TypeScript
- **Auth**: Better Auth with email/password + Azure email verification
- **Database**: Prisma 7 with SQL Server (Azure SQL)
- **Styling**: Tailwind CSS 4, shadcn/ui (Radix), Framer Motion
- **State**: Zustand stores in `src/lib/stores/`
- **Node**: v22 (see .nvmrc)

## Architecture

### Path Aliases
- `@/*` → app-main src root
- `@common/*` → common package src
- `@/components/*`, `@/lib/*` → app-main subdirectories

### File Structure
```
chat-assistant/
├── packages/
│   ├── app-main/                    # Next.js application
│   │   └── src/
│   │       ├── app/                 # Routes and API
│   │       ├── components/          # React components
│   │       ├── lib/                 # Utilities, auth, stores
│   │       └── hooks/               # Custom hooks
│   ├── database/                    # Shared Prisma package
│   │   ├── prisma/schema.prisma     # Single source of truth
│   │   └── src/generated/           # Generated Prisma client
│   ├── python-backend/              # FastAPI + LangGraph backend
│   │   ├── pyproject.toml           # Python dependencies (uv)
│   │   └── src/assistant/
│   │       ├── main.py              # FastAPI entrypoint
│   │       ├── agent/               # LangGraph agent
│   │       ├── tools/               # Weather, commute, GO Train
│   │       ├── api/                 # API routes
│   │       └── schemas/             # Pydantic models
│   └── common/                      # Shared library
│       └── src/
│           ├── components/ui/       # shadcn/ui components
│           ├── hooks/               # 36+ custom hooks
│           └── utils/               # 60+ utility files
├── scripts/
│   └── generate-types.ts            # Python → TypeScript types
├── Docs/
├── pnpm-workspace.yaml
└── package.json
```

## Autonomous Workflow Instructions

### Before Making Changes
1. **Understand the request** - Parse what's needed and identify affected files
2. **Research the codebase** - Read relevant files to understand patterns
3. **Plan the approach** - For complex changes, create a mental plan first
4. **Check current state** - Run `git status` to see uncommitted changes

### During Implementation
1. **Understand the request** - Apply best approach for what is asked, apply to files
2. **Follow existing patterns** - Match the style of surrounding code
3. **Make incremental changes** - Small, testable modifications
5. **Break up complex code into sub components and other files, especially for reusable components**
4. **Verify as you go** - Run tests/lint after significant changes
5. **Document decisions** - Add comments for non-obvious code, and add about.md (s) in complex components
6. **Commit with good messages**


### After Implementation
1. **Run full verification**: `pnpm lint && pnpm build`
2. **Test the changes** - Run relevant tests if available
3. **Review the diff** - `git diff` to verify changes are correct
4. **Commit with good message** - Use conventional commits format

## Commit Message Convention
Use conventional commits: `type(scope): description`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `style`: Formatting, no code change
- `docs`: Documentation only
- `test`: Adding/updating tests
- `chore`: Build, config, tooling

### Scopes
- `app`: app-main package
- `common`: common package
- `auth`: Authentication related
- `db`: Database/Prisma changes
- `ui`: UI components
- `api`: API endpoints

### Examples
```
feat(auth): add password reset flow
fix(ui): resolve button hover state on mobile
refactor(common): extract date formatting utilities
docs(api): update endpoint documentation
```

## Error Handling Procedures

### If Tests Fail
1. Read the error message carefully
2. Identify the failing test and related code
3. Fix the issue
4. Re-run tests to verify
5. Continue only when all tests pass

### If Build Fails
1. Check the error output
2. Fix TypeScript or syntax errors
3. Verify imports are correct
4. Run `pnpm build` again

### If Lint Fails
1. Run `pnpm lint --fix` to auto-fix what's possible
2. Manually fix remaining issues
3. Verify with `pnpm lint`

## Code Style Guidelines

### TypeScript
- Use strict TypeScript - no `any` unless absolutely necessary
- Prefer interfaces over type aliases for object shapes
- Use discriminated unions for complex state
- Export types alongside functions that use them

### React
- Functional components only
- Use custom hooks for reusable logic
- Prefer composition over props drilling
- Colocate related components

### Imports
- Use ES modules (`import/export`), not CommonJS
- Destructure imports when possible
- Group imports: React → External → Internal → Types

### File Naming
- Components: PascalCase (`UserProfile.tsx`)
- Utilities/hooks: camelCase (`useAuth.ts`)
- Constants: SCREAMING_SNAKE_CASE
- Directories: kebab-case for routes, camelCase for others

## Authentication Notes
- Better Auth handles auth at `/api/auth/[...all]`
- Domain restricted to "koning.ca" in `lib/auth.ts`
- `useUserStore` manages client-side session with 5-min cache
- Email verification required on signup (Azure Communication Service)
- **Dev Auth Bypass**: Set `AUTH_BYPASS_ENABLED=true` in .env to skip auth (dev only)

## Python Backend Notes
- Uses `uv` for fast Python dependency management
- LangGraph `create_react_agent` for tool-calling agent
- Tools: weather, commute time, GO Train schedules (mock data)
- Memory: MemorySaver (in-memory, replace with Redis/Postgres for production)
- Next.js proxies to Python via `/api/chat` route

## Common Package Usage
The common package exports reusable components, hooks (36+), and utilities (60+). Import via `@common/*`. Key areas:
- `components/ui/` - shadcn/ui components
- `hooks/` - Custom React hooks
- `utils/` - String, date, object manipulation, crypto, validation

## Monorepo Notes
- `transpilePackages: ["common"]` in next.config.ts enables imports
- pnpm-workspace.yaml defines version catalog for shared dependencies
- See `Docs/ABOUT_PNPM_CATALOGS.md` for catalog usage

## IMPORTANT Reminders
- **NEVER** modify `.env` files directly - use `.env.example` as template
- **ALWAYS** run `pnpm prisma:generate` after schema changes
- **CHECK** for TypeScript errors before committing
- **USE** existing components from `@common/components/ui` before creating new ones
- **FOLLOW** the existing patterns - consistency over cleverness
- **USE** PNPM workspaces and install in the packages that need it, if multiple need use catalog and add to all packages.json that need it.