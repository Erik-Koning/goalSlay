# Architecture

## System Architecture

### High-Level Overview

GoalSlay is a goal-setting and tracking platform built as a PNPM monorepo with two packages:

```
goalSlay/
├── packages/
│   ├── app-main/          # Next.js 16 application (React 19, App Router)
│   └── common/            # Shared components, hooks, and utilities library
├── Docs/                  # Project documentation
└── pnpm-workspace.yaml    # Workspace configuration with version catalog
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Landing Page  │  │   Auth Pages    │  │  Platform Pages │     │
│  │   (page.tsx)    │  │ login/signup    │  │ dashboard/goals │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
└───────────┼────────────────────┼────────────────────┼───────────────┘
            │                    │                    │
┌───────────┼────────────────────┼────────────────────┼───────────────┐
│           │              API Layer (Next.js Routes)  │               │
│  ┌────────▼────────────────────▼────────────────────▼────────┐      │
│  │                     /api/* Routes                          │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │      │
│  │  │   auth   │ │goal-sets │ │  goals   │ │  daily-  │     │      │
│  │  │[...all]  │ │  [id]    │ │ validate │ │ updates  │     │      │
│  │  └──────────┘ └──────────┘ │ experts  │ │ extract  │     │      │
│  │  ┌──────────┐ ┌──────────┐ └──────────┘ └──────────┘     │      │
│  │  │  admin/  │ │  export/ │ ┌──────────┐ ┌──────────┐     │      │
│  │  │ users    │ │user/team │ │ achieve- │ │ leader-  │     │      │
│  │  │ guides   │ │          │ │  ments   │ │  board   │     │      │
│  │  │ approve  │ │          │ └──────────┘ └──────────┘     │      │
│  │  └──────────┘ └──────────┘                               │      │
│  └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
            │                    │                    │
┌───────────┼────────────────────┼────────────────────┼───────────────┐
│           │           Services Layer                │                │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼─────────┐     │
│  │   Better Auth   │  │  Prisma ORM     │  │  LangChain/     │     │
│  │   (auth.ts)     │  │  (prisma.ts)    │  │  LangGraph      │     │
│  │                 │  │                  │  │  AI Agents      │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
            │                    │                    │
┌───────────┼────────────────────┼────────────────────┼───────────────┐
│           │          External Services              │                │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼─────────┐     │
│  │     Azure       │  │    Azure SQL    │  │     OpenAI      │     │
│  │   Communication │  │    Database     │  │   GPT Models    │     │
│  │   (Email)       │  │                 │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Service Boundaries

| Service | Responsibility | Location |
|---------|---------------|----------|
| **Authentication** | User signup, login, email verification, sessions | `/lib/auth.ts`, `/api/auth/[...all]` |
| **Goal Management** | CRUD for goal sets and individual goals | `/api/goal-sets/*`, `/api/goals/*` |
| **AI Expert Council** | Goal validation, expert reviews, synthesis | `/lib/agents/*` |
| **Daily Updates** | User check-ins and activity extraction | `/api/daily-updates/*` |
| **Gamification** | Achievements, streaks, leaderboard | `/api/achievements`, `/api/leaderboard` |
| **Admin** | User management, guides, approvals | `/api/admin/*` |
| **Export** | Data export for users and teams | `/api/export/*` |

### Data Flow

1. **Goal Creation Flow**:
   ```
   User Input → Validation Agent → Expert Reviews → Orchestrator Synthesis → Database
   ```

2. **Daily Update Flow**:
   ```
   User Update → Extraction Agent → Activity Linking → Streak Calculation → Database
   ```

3. **Authentication Flow**:
   ```
   Signup → Domain Validation → Email Verification (Azure) → Session Creation
   ```

## AI Agent Architecture (LangGraph)

### Expert Council System

The system uses LangGraph to orchestrate multiple AI "experts" that review and provide feedback on user goals:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Goal Review Graph                             │
│  ┌─────────────┐                                                │
│  │   START     │                                                │
│  └──────┬──────┘                                                │
│         │                                                        │
│  ┌──────▼──────┐                                                │
│  │ validateGoals│ ← Validation Agent                            │
│  └──────┬──────┘                                                │
│         │                                                        │
│  ┌──────▼──────────────────────────────────────────────┐       │
│  │               runExpertReviews                       │       │
│  │  ┌─────────────────┐  ┌─────────────────┐          │       │
│  │  │Progress Tracker │  │ Optional Experts │          │       │
│  │  │   (Required)    │  │  (User-selected) │          │       │
│  │  └─────────────────┘  └─────────────────┘          │       │
│  └──────┬──────────────────────────────────────────────┘       │
│         │                                                        │
│  ┌──────▼──────┐     ┌─ more goals? ─┐                         │
│  │synthesize   │ ──► │  Loop back    │                         │
│  │Reviews      │     └───────────────┘                         │
│  └──────┬──────┘                                                │
│         │ (all goals processed)                                 │
│  ┌──────▼──────┐                                                │
│  │ buildOutput │                                                │
│  └──────┬──────┘                                                │
│  ┌──────▼──────┐                                                │
│  │    END      │                                                │
│  └─────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Available Experts

| Expert ID | Name | Required | Purpose |
|-----------|------|----------|---------|
| `progress_tracker` | Progress Tracker | Yes | Defines metrics and daily/weekly targets |
| `motivator` | Motivation Coach | No | Psychological strategies and encouragement |
| `strategist` | Strategic Planner | No | Action plans and prioritization |
| `accountability` | Accountability Partner | No | Check-in structures and commitment devices |
| `obstacle_analyst` | Obstacle Analyst | No | Identifies blockers and mitigation strategies |
| `time_optimizer` | Time Optimizer | No | Scheduling and time management |
| `skill_advisor` | Skills Advisor | No | Skills gap analysis and learning resources |
| `wellness_guide` | Wellness Guide | No | Work-life balance and burnout prevention |

## Extensibility Points

### Adding New AI Experts

1. Create prompt in `/lib/agents/prompts/experts/[expert-name].ts`
2. Create tool in `/lib/agents/tools/expert-tools/[expert-name].tool.ts`
3. Register in `/lib/agents/tools/expert-tools/index.ts`
4. Add to `EXPERT_IDS` and `EXPERTS` in `/lib/agents/types.ts`

### Adding New API Endpoints

1. Create route file in `/app/api/[endpoint]/route.ts`
2. Use `auth.api.getSession()` for authentication
3. Use Zod schemas for validation
4. Follow existing patterns for error handling

### Shared Components

The `common` package provides reusable components via `@common/*` imports:
- UI components (`@common/components/ui/*`)
- Custom hooks (`@common/hooks/*`)
- Utilities (`@common/utils/*`)

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16 (canary) |
| React | React | 19 |
| Language | TypeScript | 5.8+ |
| Database | Azure SQL Server | - |
| ORM | Prisma | 7 |
| Auth | Better Auth | 1.3+ |
| AI/LLM | LangChain/LangGraph + OpenAI | 1.x |
| Styling | Tailwind CSS | 4 |
| UI Components | shadcn/ui (Radix) | - |
| Animation | Framer Motion | 12 |
| State | Zustand | 4.3+ |
| Email | Azure Communication Services | - |

## Feature Flags (Planned)

Currently no feature flag system is implemented. Consider adding:
- LaunchDarkly integration
- Environment-based feature toggles

## API Versioning Strategy

Currently no API versioning. All endpoints are unversioned (`/api/*`).

**Recommendation**: Consider prefixing with `/api/v1/*` for future compatibility.

---

*Last Updated: 2026-01-07*
