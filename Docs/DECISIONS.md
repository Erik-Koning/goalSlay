# Decision Log

## Key Technical Decisions Made

### D001: Monorepo Structure with PNPM
**Date**: Project inception
**Status**: Implemented

**Decision**: Use PNPM workspaces with a monorepo containing `app-main` and `common` packages.

**Alternatives Considered**:
- Turborepo with npm
- Single package
- Separate repositories

**Rationale**:
- PNPM catalogs provide single source of truth for versions
- Shared code via `common` package reduces duplication
- Local development without publishing packages
- Fast installs via content-addressable storage

**Trade-offs**:
- Learning curve for PNPM catalogs
- Some IDE issues with workspace references

---

### D002: Next.js 16 Canary with React 19
**Date**: Project inception
**Status**: Implemented

**Decision**: Use Next.js 16 canary with React 19 for latest features.

**Alternatives Considered**:
- Next.js 15 stable
- Remix
- Plain React with Vite

**Rationale**:
- App Router is now mature
- React 19 features (use, actions) simplify data fetching
- Server Components reduce client bundle
- Vercel deployment is seamless

**Trade-offs**:
- Canary version may have breaking changes
- Some ecosystem libraries not yet compatible
- Documentation sometimes outdated

---

### D003: Better Auth for Authentication
**Date**: Project inception
**Status**: Implemented

**Decision**: Use Better Auth instead of NextAuth/Auth.js.

**Alternatives Considered**:
- NextAuth.js v5
- Clerk
- Auth0
- Custom implementation

**Rationale**:
- Native Prisma integration
- Email verification built-in
- Simpler API than NextAuth v5
- Full control over auth flow

**Trade-offs**:
- Smaller community than NextAuth
- Fewer OAuth providers out of box
- Less documentation

---

### D004: Azure SQL Server for Database
**Date**: Project inception
**Status**: Implemented

**Decision**: Use Azure SQL Database with Prisma.

**Alternatives Considered**:
- PostgreSQL (Supabase, Neon)
- MongoDB
- PlanetScale (MySQL)

**Rationale**:
- Enterprise requirement for SQL Server
- Azure ecosystem integration
- Managed backups and scaling
- Familiar SQL syntax

**Trade-offs**:
- More expensive than PostgreSQL
- Prisma SQL Server adapter less mature
- Some Prisma features limited

---

### D005: LangGraph for AI Agent Orchestration
**Date**: 2026-01-06
**Status**: Implemented

**Decision**: Use LangGraph (from LangChain) for orchestrating the Expert Council AI agents.

**Alternatives Considered**:
- Sequential function calls
- LangChain chains only
- Custom state machine
- CrewAI

**Rationale**:
- Graph-based state management fits the problem
- Built-in support for parallel execution
- Checkpointing for long-running operations
- Good TypeScript support

**Trade-offs**:
- Additional complexity for simple flows
- Learning curve for graph concepts
- Newer library, less documentation

---

### D006: Expert Council Architecture
**Date**: 2026-01-06
**Status**: Implemented

**Decision**: Create 8 specialized AI "experts" with one required (Progress Tracker) and 7 optional.

**Alternatives Considered**:
- Single multi-purpose agent
- User-defined experts
- No expert system

**Rationale**:
- Specialization improves response quality
- Users get tailored advice
- Required Progress Tracker ensures metrics
- Optional experts reduce cost when not needed

**Trade-offs**:
- Multiple LLM calls increase latency
- Higher API costs with more experts
- Orchestration complexity

---

### D007: Domain Restriction for Signup
**Date**: Project inception
**Status**: Implemented

**Decision**: Restrict signups to `koning.ca` email domain only.

**Alternatives Considered**:
- Open registration
- Invite-only
- Multiple approved domains
- Email verification only

**Rationale**:
- Enterprise/organizational use case
- Simple access control
- No need for complex invitation system

**Trade-offs**:
- Limits user base
- Hardcoded domain (could be configurable)
- No guest access possible

---

## Open Questions / Risks

### Q001: Rate Limiting Implementation
**Status**: Open
**Impact**: Security, Cost

**Question**: How should API rate limiting be implemented?

**Considerations**:
- Need to limit LLM-based endpoints especially
- Upstash Redis available but not integrated
- Better Auth has some built-in limiting

**Blockers**: None, just needs prioritization

---

### Q002: Notification Delivery
**Status**: Open
**Impact**: User Experience

**Question**: How should scheduled notifications be triggered?

**Considerations**:
- Vercel Cron functions available
- Azure Functions alternative
- Push notifications vs email

**Blockers**: Architecture decision needed

---

### Q003: Offline Support
**Status**: Deferred
**Impact**: User Experience

**Question**: Should the app work offline?

**Considerations**:
- PWA capabilities in Next.js
- Service worker complexity
- Sync conflicts

**Decision**: Not in current scope

---

## Known Technical Debt

### TD001: Console Logging Only
**Status**: Active
**Severity**: Medium

**Description**: Error tracking uses console.log only, no centralized monitoring.

**Impact**: Difficult to debug production issues

**Remediation**: Integrate Sentry or similar

---

### TD002: No Caching Layer
**Status**: Active
**Severity**: Medium

**Description**: No Redis or in-memory caching for frequently accessed data.

**Impact**: Higher database load, slower responses

**Remediation**: Add Redis caching for leaderboard, user sessions

---

### TD003: Tests Missing
**Status**: Active
**Severity**: Medium

**Description**: Limited test coverage, only agent tests exist.

**Impact**: Regressions harder to catch

**Remediation**: Add unit tests, integration tests, E2E tests

---

### TD004: No API Versioning
**Status**: Active
**Severity**: Low

**Description**: API endpoints are unversioned (`/api/` not `/api/v1/`)

**Impact**: Breaking changes affect all clients

**Remediation**: Prefix with version when breaking changes needed

---

## Assumptions Made

### A001: Single Tenant
**Assumption**: Application is single-tenant (one organization).

**If wrong**: Need multi-tenancy, data isolation, org-level admin.

---

### A002: Low Traffic
**Assumption**: < 500 concurrent users expected.

**If wrong**: Need horizontal scaling, caching, CDN optimization.

---

### A003: Azure Ecosystem
**Assumption**: Organization uses Azure, Azure SQL acceptable.

**If wrong**: May need to migrate to different database.

---

## Deferred Decisions

### DD001: Mobile App
**Status**: Deferred
**Why**: Web-first approach, evaluate after web stable

**Trigger to revisit**: User feedback requesting mobile app, > 50% mobile traffic

---

### DD002: Team/Organization Features
**Status**: Deferred
**Why**: Single-user focus for MVP

**Trigger to revisit**: Multiple users from same org, team goals requested

---

### DD003: Custom Expert Creation
**Status**: Deferred
**Why**: Complex feature, predefined experts sufficient for now

**Trigger to revisit**: User requests for custom experts, specific domain needs

---

### DD004: Internationalization (i18n)
**Status**: Deferred
**Why**: English-only organization for now

**Trigger to revisit**: Non-English users, expansion to other regions

---

*Last Updated: 2026-01-07*
