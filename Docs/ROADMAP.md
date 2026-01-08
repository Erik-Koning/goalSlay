# Roadmap

## Current Status

**Version**: 1.0.0 (Development)
**Last Major Milestone**: Expert Council Implementation (2026-01-06)

## Completed Features

### Core Platform
- [x] PNPM monorepo setup with workspaces and catalogs
- [x] Next.js 16 with React 19 App Router
- [x] Better Auth integration with email/password
- [x] Email verification via Azure Communication Services
- [x] Domain-restricted signup (koning.ca)
- [x] Prisma 7 with Azure SQL Server

### Goal Management
- [x] Goal set creation (3-5 goals)
- [x] SMART goal validation via LLM
- [x] Expert Council system with 8 experts
- [x] LangGraph orchestration for reviews
- [x] Progress estimates from Progress Tracker
- [x] Expert synthesis by Orchestrator

### Daily Updates
- [x] Daily update submission
- [x] Activity extraction via LLM
- [x] Period-based updates (morning/afternoon/evening/full_day)

### Gamification
- [x] Streak tracking (current and longest)
- [x] Points system
- [x] Achievement model
- [x] Leaderboard API

### Admin
- [x] User management endpoints
- [x] Goal guide management
- [x] Approval workflow

## Planned Features

### Phase 1: Polish & Stability (Q1 2026)

#### High Priority
- [ ] Rate limiting for API endpoints
- [ ] Error tracking integration (Sentry)
- [ ] Unit test coverage (> 60%)
- [ ] E2E tests for critical flows

#### Medium Priority
- [ ] Progress visualization (charts)
- [ ] Weekly summary emails
- [ ] Goal completion celebrations
- [ ] Activity trend analysis

#### Low Priority
- [ ] Dark mode toggle refinement
- [ ] Keyboard shortcuts
- [ ] Export to PDF

### Phase 2: Enhanced Engagement (Q2 2026)

#### High Priority
- [ ] Push notifications (web)
- [ ] Daily reminder emails
- [ ] Progress comparison (week-over-week)
- [ ] Goal revision history

#### Medium Priority
- [ ] Achievement notifications
- [ ] Streak recovery (grace period)
- [ ] Goal templates
- [ ] Suggested goals based on role

#### Low Priority
- [ ] Social sharing of achievements
- [ ] Custom expert personas
- [ ] Goal commenting (self-notes)

### Phase 3: Team Features (Q3 2026)

#### High Priority
- [ ] Team/organization model
- [ ] Team leaderboards
- [ ] Manager dashboard
- [ ] Team goal alignment

#### Medium Priority
- [ ] Peer recognition
- [ ] Team achievements
- [ ] Aggregated analytics
- [ ] Export team reports

#### Low Priority
- [ ] Goal cascading (org -> team -> individual)
- [ ] Cross-team visibility (opt-in)
- [ ] Team challenges

### Phase 4: Advanced AI (Q4 2026)

#### High Priority
- [ ] Natural language goal creation
- [ ] Conversational daily updates
- [ ] AI-powered goal suggestions
- [ ] Predictive progress alerts

#### Medium Priority
- [ ] Voice input for updates
- [ ] Custom expert training
- [ ] Pattern recognition across users
- [ ] Contextual recommendations

#### Low Priority
- [ ] AI goal coaching chatbot
- [ ] Automated goal adjustment suggestions
- [ ] Integration with calendar for scheduling

## Technical Debt Backlog

### Critical (Before Production)
- [ ] Implement rate limiting
- [ ] Add error monitoring
- [ ] Security audit
- [ ] Performance testing

### High Priority
- [ ] Add Redis caching layer
- [ ] Implement proper logging
- [ ] Add API versioning
- [ ] Database query optimization

### Medium Priority
- [ ] Refactor common package (too many deps)
- [ ] Extract shared types to separate package
- [ ] Improve TypeScript strictness
- [ ] Add OpenAPI/Swagger documentation

### Low Priority
- [ ] Clean up unused dependencies
- [ ] Standardize error handling
- [ ] Add health check endpoints
- [ ] Implement graceful degradation

## Infrastructure Roadmap

### Near-term
- [ ] Production environment setup
- [ ] CI/CD pipeline refinement
- [ ] Staging environment
- [ ] Database backup verification

### Medium-term
- [ ] CDN for static assets
- [ ] Edge caching optimization
- [ ] Database read replicas (if needed)
- [ ] Auto-scaling configuration

### Long-term
- [ ] Multi-region deployment (if needed)
- [ ] Disaster recovery testing
- [ ] Cost optimization review
- [ ] Security compliance audit

## Dependencies Between Features

```
Rate Limiting ─────────────┐
                           ├──▶ Production Ready
Error Monitoring ──────────┤
                           │
Security Audit ────────────┘

Team Model ────────────────┐
                           ├──▶ Team Features
Team Leaderboard ◀─────────┤
                           │
Manager Dashboard ◀────────┘

Push Notifications ────────┐
                           ├──▶ Real-time Engagement
Progress Alerts ◀──────────┘
```

## Scale Limits of Current Approach

| Component | Current Limit | Bottleneck | Solution |
|-----------|--------------|------------|----------|
| Database | ~1000 concurrent | Connections | Connection pooling, read replicas |
| LLM calls | ~100/minute | OpenAI rate limits | Caching, batching, quota increase |
| File exports | ~10 concurrent | Memory | Streaming, worker queues |
| Leaderboard | ~1000 users | Full table scan | Redis caching, materialized views |

## "Good Enough for Now" Implementations

| Component | Current State | Future State |
|-----------|--------------|--------------|
| Caching | None | Redis with TTL strategy |
| Background jobs | Inline execution | Job queue (Bull/Bee) |
| File storage | Not implemented | Azure Blob Storage |
| Full-text search | SQL LIKE | Elasticsearch/Algolia |
| Analytics | Raw queries | Data warehouse/OLAP |

---

*Last Updated: 2026-01-07*
