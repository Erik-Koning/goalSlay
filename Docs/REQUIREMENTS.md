# Non-Functional Requirements

## Performance Targets

### Response Times

| Operation | Target | Maximum |
|-----------|--------|---------|
| Page load (initial) | < 2s | 4s |
| API response (simple) | < 200ms | 500ms |
| API response (with DB) | < 500ms | 1s |
| LLM validation (single goal) | < 5s | 10s |
| Expert council review (full) | < 30s | 60s |
| Activity extraction | < 10s | 20s |

### Throughput

| Metric | Target |
|--------|--------|
| Concurrent users | 100 |
| API requests/second | 500 |
| Daily updates/day | 1,000 |
| Goal validations/hour | 200 |

### Client Performance

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Cumulative Layout Shift | < 0.1 |
| Bundle size (initial) | < 200KB gzipped |

## Scalability Expectations

### Current Scale
- Users: < 100
- Daily active users: < 50
- Data volume: < 10GB

### Near-term Scale (6 months)
- Users: < 500
- Daily active users: < 200
- Data volume: < 50GB

### Design Constraints
- Stateless API design for horizontal scaling
- Database connection pooling (Prisma default)
- CDN for static assets (Vercel)
- No in-memory caching currently implemented

## Security Requirements

### Authentication
- Password hashing: bcrypt (Better Auth default)
- Session tokens: Cryptographically random, 256-bit
- Session expiration: 30 days (configurable)
- Rate limiting: Not currently implemented (TODO)

### Authorization
- Role-based access control (user/admin)
- Resource ownership verification
- Admin-only endpoints protected

### Data Protection
- HTTPS enforced (Vercel)
- Sensitive data not logged
- Environment variables for secrets
- Database connection encrypted (Azure SQL)

### Input Validation
- Zod schemas for all API inputs
- SQL injection prevented (Prisma ORM)
- XSS prevention (React default escaping)

### Compliance Considerations
- Email domain restriction (organizational use)
- User data export available (GDPR-ready)
- No PII exposed in logs

## Availability/Uptime Goals

### Target Availability
- Production: 99.5% uptime
- Planned maintenance: < 2 hours/month, with notice

### Disaster Recovery
- Database: Azure SQL auto-backups
- Code: GitHub repository
- Recovery Time Objective (RTO): < 4 hours
- Recovery Point Objective (RPO): < 1 hour

### Monitoring (Planned)
- Uptime monitoring: Not yet implemented
- Error tracking: Console logging only
- Performance monitoring: Not yet implemented

## Browser Support

### Supported Browsers
| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |

### Mobile Support
- Responsive design required
- Touch-friendly interactions
- iOS Safari and Chrome Android supported

## Accessibility Requirements

### WCAG Compliance
- Target: WCAG 2.1 Level AA
- Current status: Partially implemented

### Key Requirements
- Keyboard navigation for all interactions
- Screen reader compatibility
- Color contrast ratios met
- Focus indicators visible
- Alt text for images

## API Requirements

### Rate Limiting (Planned)
| Endpoint Category | Rate Limit |
|-------------------|------------|
| Authentication | 10/minute |
| Goal validation (LLM) | 20/hour |
| Expert review (LLM) | 10/hour |
| Standard CRUD | 100/minute |

### Timeout Configuration
| Operation | Timeout |
|-----------|---------|
| Standard API | 30s |
| LLM operations | 60s |
| File export | 120s |

## Data Retention

### Active Data
- User accounts: Indefinite (until deletion)
- Goal sets: Indefinite
- Daily updates: Indefinite
- Sessions: 30 days

### Archival (Planned)
- Completed goal sets > 1 year: Archive
- Daily updates > 2 years: Archive
- Deleted user data: 30 days retention, then purge

## Infrastructure Requirements

### Hosting
- Platform: Vercel (Next.js)
- Region: Auto (Vercel Edge)
- Environment: Production + Preview

### Database
- Provider: Azure SQL Database
- SKU: Standard S0 or higher
- Backup: Automated (Azure)

### External Services
- Azure Communication Services (email)
- OpenAI API (LLM)

### Environment Variables Required
```
DATABASE_URL
AZURE_CONNECTION_STRING
AZURE_SENDER_EMAIL
OPENAI_API_KEY
BETTER_AUTH_SECRET
```

---

*Last Updated: 2026-01-07*
