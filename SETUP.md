# GoalSlay Setup Guide

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Access to Azure SQL Server (or local SQL Server)

### Installation

```bash
# Clone and install dependencies
git clone <repo-url>
cd goalSlay
pnpm install

# Copy environment template
cp .env.example .env
```

---

## Local Development Setup (OpenAI)

For local development, use OpenAI directly for faster iteration.

### 1. Configure Environment

Edit `.env`:

```env
# LLM Provider - use OpenAI for local dev
LLM_PROVIDER="openai"

# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-your-openai-api-key"

# Database - your Azure SQL connection string
DATABASE_URL="sqlserver://..."

# Auth secret (generate a random 32+ char string)
BETTER_AUTH_SECRET="your-random-secret-string"
BETTER_AUTH_URL="http://localhost:3000"
```

### 2. Setup Database

```bash
cd packages/app-main

# Generate Prisma client
pnpm prisma:generate

# Push schema to database
pnpm prisma:push

# Seed with achievements and guides
pnpm prisma:seed
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

### 4. Run Agent Tests

```bash
# Run all agent tests (uses real LLM calls)
pnpm test:agents

# Run with mocks for faster CI
USE_MOCKS=true pnpm test:agents
```

---

## Enterprise Setup (Azure OpenAI)

For production deployments, use Azure OpenAI for enterprise compliance.

### 1. Azure OpenAI Prerequisites

1. Create Azure OpenAI resource in Azure Portal
2. Deploy a GPT-4 model (recommended: `gpt-4o`)
3. Note your:
   - Instance name (from endpoint URL)
   - Deployment name
   - API key
   - API version

### 2. Configure Environment

Edit `.env`:

```env
# LLM Provider - use Azure for enterprise
LLM_PROVIDER="azure"

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY="your-azure-openai-key"
AZURE_OPENAI_INSTANCE="your-instance-name"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# Optionally add LangSmith for tracing
LANGCHAIN_TRACING_V2="true"
LANGCHAIN_API_KEY="lsv2_your_key"
LANGCHAIN_PROJECT="goalslay-prod"
```

### 3. Deploy Azure Functions (Progress Check Cron)

```bash
cd azure-functions

# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Deploy to Azure
func azure functionapp publish <your-function-app-name>
```

Configure Function App settings:
- `APP_URL`: Your deployed Next.js app URL
- `CRON_SECRET`: Same as in your Next.js app

### 4. Production Deployment

Deploy Next.js app to:
- **Azure App Service** (recommended)
- **Vercel** (with Azure OpenAI network rules)
- **Azure Container Apps**

---

## Environment Variables Reference

| Variable | Local Dev | Enterprise | Description |
|----------|-----------|------------|-------------|
| `LLM_PROVIDER` | `openai` | `azure` | Which LLM provider to use |
| `OPENAI_API_KEY` | Required | - | OpenAI API key |
| `AZURE_OPENAI_API_KEY` | - | Required | Azure OpenAI key |
| `AZURE_OPENAI_INSTANCE` | - | Required | Azure instance name |
| `AZURE_OPENAI_DEPLOYMENT` | - | Required | Model deployment name |
| `DATABASE_URL` | Required | Required | SQL Server connection |
| `BETTER_AUTH_SECRET` | Required | Required | Auth secret key |
| `CRON_SECRET` | Optional | Required | Cron job auth |

---

## Testing

### Unit Tests (with mocks)
```bash
USE_MOCKS=true pnpm test
```

### Integration Tests (real LLM)
```bash
pnpm test:agents
```

### Build Verification
```bash
pnpm build
```

---

## Troubleshooting

### LLM Connection Issues

**OpenAI**:
- Check `OPENAI_API_KEY` is valid
- Verify you have API credits

**Azure OpenAI**:
- Verify network access (VNet rules)
- Check deployment name matches exactly
- Ensure API version is supported

### Database Issues

```bash
# Reset and re-push schema
pnpm prisma:push --force-reset --accept-data-loss

# Check connection
pnpm prisma studio
```

### Build Failures

```bash
# Clean and rebuild
rm -rf .next node_modules/.cache
pnpm build
```
