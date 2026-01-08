# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial specification documentation suite:
  - `ARCHITECTURE.md` - System design and AI agent architecture
  - `DATA-MODEL.md` - Complete Prisma schema documentation
  - `API-SPEC.md` - All API endpoints with request/response schemas
  - `BUSINESS-LOGIC.md` - Domain rules and state machines
  - `USER-FLOWS.md` - User journeys and permission matrix
  - `REQUIREMENTS.md` - NFRs and infrastructure requirements
  - `DEPENDENCIES.md` - All external services and packages
  - `DECISIONS.md` - Technical decisions and trade-offs
  - `ROADMAP.md` - Planned features and tech debt backlog
  - `CHANGELOG.md` - This file

## [1.0.0-alpha] - 2026-01-07

### Added
- **Expert Council System** - LangGraph-based AI agent orchestration
  - 8 specialized experts (1 required, 7 optional)
  - Progress Tracker for metrics and estimates
  - Orchestrator for synthesis
  - Parallel expert execution
- **Goal Management**
  - Goal set creation (3-5 goals)
  - SMART validation via LLM
  - Expert reviews and summaries
  - Progress estimates
- **Daily Updates**
  - Period-based updates (morning/afternoon/evening/full_day)
  - Activity extraction via LLM
  - Goal linking
- **Gamification**
  - Streak tracking
  - Points system
  - Achievement system
  - Leaderboard
- **Authentication**
  - Better Auth integration
  - Email/password signup
  - Email verification via Azure
  - Domain restriction (koning.ca)
- **Admin Features**
  - User management
  - Goal guide management
  - Approval workflow
- **Infrastructure**
  - PNPM monorepo with workspaces
  - Version catalogs for dependencies
  - Next.js 16 with React 19
  - Prisma 7 with Azure SQL

### Technical
- LangChain/LangGraph for AI orchestration
- Zod for API validation
- Zustand for state management
- Tailwind CSS 4 for styling
- shadcn/ui components (Radix-based)
- Framer Motion for animations

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0-alpha | 2026-01-07 | Expert Council, full platform |
| 0.1.0 | 2026-01-04 | Initial monorepo setup |

---

## Document Change History

This section tracks changes to the specification documents themselves.

### 2026-01-07
- **Created all specification documents** from codebase analysis
  - Documented existing architecture and AI agent system
  - Captured all database entities and relationships
  - Specified all API endpoints currently implemented
  - Documented business rules and state machines
  - Created user flow diagrams
  - Listed all dependencies and external services
  - Recorded key technical decisions
  - Created feature roadmap and tech debt backlog

### Future Updates
- Update documents when significant changes are made
- Review documents before major releases
- Keep CHANGELOG updated with each PR

---

*Last Updated: 2026-01-07*
