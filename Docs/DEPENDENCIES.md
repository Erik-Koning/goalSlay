# Dependencies

## External Services

### Azure Communication Services
- **Purpose**: Email verification, notifications
- **Configuration**: `AZURE_CONNECTION_STRING`, `AZURE_SENDER_EMAIL`
- **Usage**: `@azure/communication-email` package
- **Location**: `/lib/auth.ts`

### Azure SQL Database
- **Purpose**: Primary data storage
- **Configuration**: `DATABASE_URL` connection string
- **Provider**: SQL Server via Prisma adapter
- **Location**: `/lib/prisma.ts`

### OpenAI API
- **Purpose**: LLM for goal validation, expert reviews, activity extraction
- **Configuration**: `OPENAI_API_KEY`
- **Model**: GPT-4 (configurable in `/lib/agents/config/models.ts`)
- **Usage**: Via LangChain integration

### Vercel
- **Purpose**: Hosting, CI/CD, edge functions
- **Configuration**: Automatic via Git integration
- **Features**: Preview deployments, edge caching

## Core Dependencies

### Framework & Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16 (canary) | React framework with App Router |
| `react` | 19 | UI library |
| `react-dom` | 19 | React DOM renderer |
| `typescript` | 5.8+ | Type safety |

### Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| `prisma` | 7 | ORM and migrations |
| `@prisma/client` | 7 | Database client |
| `@prisma/adapter-mssql` | 7 | SQL Server adapter |

### Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| `better-auth` | 1.3+ | Authentication library |

### AI/LLM

| Package | Version | Purpose |
|---------|---------|---------|
| `langchain` | 1.2+ | LLM framework |
| `@langchain/core` | 1.1+ | Core abstractions |
| `@langchain/langgraph` | 1.0+ | Graph-based agent workflows |
| `@langchain/openai` | 1.2+ | OpenAI integration |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/*` | Various | Accessible UI primitives |
| `tailwindcss` | 4 | Utility-first CSS |
| `framer-motion` | 12 | Animations |
| `lucide-react` | 0.483+ | Icons |
| `sonner` | 2+ | Toast notifications |
| `vaul` | 1.1+ | Drawer component |
| `recharts` | 2.15+ | Charts |

### Form & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | 3.24+ | Schema validation |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | 4.3+ | Client state management |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `clsx` | 2.1+ | Class name utility |
| `tailwind-merge` | 3+ | Tailwind class merging |
| `class-variance-authority` | 0.7+ | Component variants |

### Drag & Drop

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | 6.3+ | Drag and drop |
| `@dnd-kit/sortable` | 10+ | Sortable lists |
| `@dnd-kit/utilities` | 3.2+ | DnD utilities |

### Data Tables

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-table` | 8.21+ | Headless table |

## Common Package Dependencies

The `common` package includes additional dependencies for shared functionality:

### AWS SDK (for enterprise features)
- `@aws-sdk/client-cloudtrail`
- `@aws-sdk/client-guardduty`
- `@aws-sdk/client-kms`
- `@aws-sdk/client-securityhub`

### PDF & Documents
- `@react-pdf/renderer` - PDF generation
- `react-pdf` - PDF viewing
- `pdf-lib` - PDF manipulation

### Additional UI
- `react-calendar` - Calendar component
- `react-colorful` - Color picker
- `react-day-picker` - Date picker
- `react-dropzone` - File upload
- `qrcode.react` - QR codes

### Mapping
- `leaflet` - Maps
- `react-leaflet` - React wrapper

## Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | 4+ | Testing framework |
| `@vitejs/plugin-react` | 5.1+ | React plugin for Vite |
| `tsx` | 4.19+ | TypeScript execution |
| `dotenv-cli` | latest | Environment variable loading |

## Version Catalog (pnpm-workspace.yaml)

Shared versions managed via pnpm catalog:

```yaml
catalog:
  "@prisma/client": "^7.2.0"
  "prisma": "^7.2.0"
  "react": "19.2.3"
  "react-dom": "19.2.3"
  "next": "^16.1.0-canary.12"
  "typescript": "^5.8.2"
  "tailwindcss": "^4"
  "zod": "^3.24.2"
  # ... additional shared versions
```

## Environment Requirements

### Node.js
- **Required**: v22+
- **Specified in**: `.nvmrc`

### Package Manager
- **Required**: pnpm
- **Workspace**: Configured in `pnpm-workspace.yaml`

## Version Constraints

### Peer Dependencies
- React 19 required by Next.js 16
- TypeScript 5.x required for latest features

### Breaking Changes to Watch
- Next.js 16 is canary - may have breaking changes
- React 19 has new features (use, actions, etc.)
- Prisma 7 has new adapter system

## Security Considerations

### Packages with Known Vulnerabilities
- Regular `pnpm audit` recommended
- No current high-severity vulnerabilities known

### Sensitive Packages
- `better-auth`: Handles authentication - keep updated
- `prisma`: Database access - verify queries
- `@langchain/*`: API key handling - secure storage

## Upgrade Strategy

### Regular Updates
1. Run `pnpm outdated` weekly
2. Update patch versions freely
3. Minor versions: Test before deploying
4. Major versions: Plan migration, test thoroughly

### Catalog Updates
When updating shared dependencies:
1. Update version in `pnpm-workspace.yaml`
2. Run `pnpm install` to propagate
3. Run `pnpm build` to verify
4. Test affected functionality

---

*Last Updated: 2026-01-07*
