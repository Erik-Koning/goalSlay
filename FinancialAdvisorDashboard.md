# Financial Advisor Control Dashboard
## Master Software Specification Document

**Version:** 1.0.0  
**Date:** January 29, 2026  
**Project Codename:** AdvisorHub  
**Target Agent:** Claude Ultra Max

---

## Executive Summary

AdvisorHub is a comprehensive financial advisor dashboard application designed to streamline client relationship management, appointment scheduling, lead tracking, and intelligent AI-assisted client interactions. The system combines a modern Next.js frontend with a sophisticated Python-based agentic backend powered by LangChain/LangGraph for feature-rich LLM queries and long-running task management.

### Key Objectives

- **Unified Client Management**: Centralized view of client details, notes, investment performance, and communication history
- **Intelligent Chat Interface**: AI-powered chat with deep context awareness, knowledge graph integration, and access to LLM expert catalogs
- **Resilient Long-Running Tasks**: Graceful handling of HTTP timeouts with background task completion and polling-based result retrieval
- **Real-Time Call Transcription**: Live call recording with speaker separation and automatic summary generation
- **Lead & Todo Management**: Efficient tracking of client leads and advisor tasks with database persistence

### Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend API | Next.js API Routes (mocked endpoints) |
| Agentic Backend | Python 3.12+, FastAPI, LangChain, LangGraph |
| Database | PostgreSQL with Prisma ORM |
| Knowledge Graph | Azure Cosmos DB (Gremlin API) |
| Package Manager | pnpm with Turborepo |

---

## 1. Monorepo Structure

```
advisor-hub/
├── package.json                    # Root workspace configuration
├── pnpm-workspace.yaml             # pnpm workspace definition
├── turbo.json                      # Turborepo configuration
├── .env.example
│
├── packages/
│   ├── app-main/                   # Next.js 16 frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx        # Dashboard Home
│   │   │   │   ├── globals.css
│   │   │   │   ├── client/[id]/page.tsx
│   │   │   │   └── api/
│   │   │   │       ├── appointments/route.ts
│   │   │   │       ├── leads/route.ts
│   │   │   │       ├── todos/route.ts
│   │   │   │       ├── clients/[id]/route.ts
│   │   │   │       └── chat/route.ts
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── client/
│   │   │   │   └── chat/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── types/
│   │
│   ├── database/                   # Prisma + PostgreSQL
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   │
│   ├── common/                     # Shared UI components
│   │   └── src/components/
│   │       ├── Calendar/
│   │       ├── Card/GlassCard.tsx
│   │       ├── Button/
│   │       ├── Input/
│   │       ├── Modal/
│   │       ├── Badge/
│   │       ├── Spinner/
│   │       └── Charts/ToroidChart.tsx
│   │
│   └── agentic/                    # Python FastAPI + LangChain
│       ├── pyproject.toml
│       └── src/
│           ├── main.py
│           ├── config.py
│           ├── api/routes/
│           ├── agents/
│           │   ├── orchestrator.py
│           │   ├── interest_extractor.py
│           │   └── context_retriever.py
│           └── services/
│               ├── knowledge_graph.py
│               └── task_manager.py
```

---

## 2. Package Configurations

### 2.1 Root package.json

```json
{
  "name": "advisor-hub",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "db:generate": "turbo run db:generate --filter=database",
    "db:push": "turbo run db:push --filter=database",
    "agentic:dev": "cd packages/agentic && poetry run uvicorn src.main:app --reload --port 8000"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 2.2 app-main/package.json

```json
{
  "name": "@advisor-hub/app-main",
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@advisor-hub/common": "workspace:*",
    "@advisor-hub/database": "workspace:*",
    "swr": "^2.2.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "typescript": "^5.4.0"
  }
}
```

### 2.3 agentic/pyproject.toml

```toml
[tool.poetry]
name = "advisor-hub-agentic"
version = "1.0.0"

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.111.0"
uvicorn = { extras = ["standard"], version = "^0.29.0" }
langchain = "^0.2.0"
langchain-openai = "^0.1.0"
langchain-anthropic = "^0.1.0"
langgraph = "^0.0.50"
azure-cosmos = "^4.6.0"
gremlinpython = "^3.7.0"
pydantic = "^2.7.0"
pydantic-settings = "^2.2.0"
redis = "^5.0.0"
httpx = "^0.27.0"
```

---

## 3. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Client {
  id              String        @id @default(cuid())
  firstName       String
  lastName        String
  email           String        @unique
  phone           String?
  company         String?
  title           String?
  address         String?
  city            String?
  state           String?
  zipCode         String?
  riskTolerance   RiskTolerance @default(MODERATE)
  investmentGoals String?
  annualIncome    Decimal?      @db.Decimal(15, 2)
  netWorth        Decimal?      @db.Decimal(15, 2)
  status          ClientStatus  @default(PROSPECT)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  lastContactedAt DateTime?
  
  notes           Note[]
  calls           Call[]
  todos           Todo[]
  investments     Investment[]
  chatSessions    ChatSession[]
  knowledgeGraphId String?      @unique
}

enum RiskTolerance {
  CONSERVATIVE
  MODERATE
  AGGRESSIVE
}

enum ClientStatus {
  PROSPECT
  LEAD
  ACTIVE
  INACTIVE
  CHURNED
}

model Note {
  id                     String       @id @default(cuid())
  clientId               String
  client                 Client       @relation(fields: [clientId], references: [id], onDelete: Cascade)
  title                  String?
  content                String       @db.Text
  category               NoteCategory @default(GENERAL)
  syncedToKnowledgeGraph Boolean      @default(false)
  knowledgeGraphNodeId   String?
  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt
}

enum NoteCategory {
  GENERAL
  MEETING
  CALL
  FINANCIAL
  PERSONAL
  ACTION_ITEM
}

model Call {
  id              String        @id @default(cuid())
  clientId        String
  client          Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  startTime       DateTime
  endTime         DateTime?
  duration        Int?
  direction       CallDirection
  status          CallStatus    @default(COMPLETED)
  transcript      String?       @db.Text
  advisorSegments Json?
  clientSegments  Json?
  summary         String?       @db.Text
  suggestedAction String?
  suggestedTitle  String?
  sentiment       CallSentiment?
  recordingUrl    String?
  createdAt       DateTime      @default(now())
}

enum CallDirection {
  INBOUND
  OUTBOUND
}

enum CallStatus {
  IN_PROGRESS
  COMPLETED
  MISSED
  VOICEMAIL
}

enum CallSentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

model Todo {
  id          String         @id @default(cuid())
  title       String
  description String?        @db.Text
  status      TodoStatus     @default(TODO)
  priority    TodoPriority   @default(MEDIUM)
  dueDate     DateTime?
  clientId    String?
  client      Client?        @relation(fields: [clientId], references: [id], onDelete: SetNull)
  sourceType  TodoSourceType @default(MANUAL)
  sourceId    String?
  completedAt DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum TodoStatus {
  TODO
  DONE
}

enum TodoPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TodoSourceType {
  MANUAL
  CALL_SUMMARY
  CHAT_SUGGESTION
}

model Investment {
  id              String             @id @default(cuid())
  clientId        String
  client          Client             @relation(fields: [clientId], references: [id], onDelete: Cascade)
  name            String
  category        InvestmentCategory
  value           Decimal            @db.Decimal(15, 2)
  percentage      Decimal            @db.Decimal(5, 2)
  costBasis       Decimal?           @db.Decimal(15, 2)
  gainLoss        Decimal?           @db.Decimal(15, 2)
  gainLossPercent Decimal?           @db.Decimal(8, 4)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
}

enum InvestmentCategory {
  STOCKS
  BONDS
  MUTUAL_FUNDS
  ETF
  REAL_ESTATE
  CASH
  CRYPTO
  COMMODITIES
  ALTERNATIVE
  OTHER
}

model ChatSession {
  id                     String        @id @default(cuid())
  clientId               String
  client                 Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  isActive               Boolean       @default(true)
  messages               ChatMessage[]
  longRunningTaskResults Json[]        @default([])
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt
}

model ChatMessage {
  id               String       @id @default(cuid())
  sessionId        String
  session          ChatSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role             MessageRole
  content          String       @db.Text
  responseMetadata Json?
  isLongRunning    Boolean      @default(false)
  taskId           String?
  taskStatus       TaskStatus?
  createdAt        DateTime     @default(now())
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum TaskStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model Lead {
  id            String     @id @default(cuid())
  firstName     String
  lastName      String
  email         String
  phone         String?
  company       String?
  source        LeadSource
  status        LeadStatus @default(NEW)
  lastCalledAt  DateTime?
  recallDate    DateTime?
  lastCallNotes String?    @db.Text
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

enum LeadSource {
  REFERRAL
  WEBSITE
  COLD_CALL
  EVENT
  SOCIAL_MEDIA
  OTHER
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  UNQUALIFIED
  CONVERTED
}

model Appointment {
  id          String            @id @default(cuid())
  title       String
  description String?           @db.Text
  clientId    String?
  clientName  String
  clientEmail String?
  clientPhone String?
  startTime   DateTime
  endTime     DateTime
  location    String?
  meetingLink String?
  status      AppointmentStatus @default(SCHEDULED)
  type        AppointmentType   @default(CONSULTATION)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum AppointmentType {
  CONSULTATION
  REVIEW
  PLANNING
  FOLLOW_UP
  ONBOARDING
}
```

---

## 4. Feature Specifications

### 4.1 Control Dashboard Home

#### Layout Structure (3 Rows)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TOP ROW - Calendar & Appointments (2/3 width scrollable list)          │
│  ┌────────────────────────────────────────────────────┬───────────────┐ │
│  │  APPOINTMENTS LIST (scrollable)                    │  CALENDAR     │ │
│  │  9:00 AM  John Smith - Portfolio Review  [Meeting] │  [Month View] │ │
│  │  10:30 AM Sarah Johnson - Tax Planning   [Call]    │               │ │
│  │  1:00 PM  Mike Williams - New Client     [Zoom]    │               │ │
│  └────────────────────────────────────────────────────┴───────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│  MIDDLE ROW - Todos & Leads (Split View)                                │
│  ┌────────────────────────────┬────────────────────────────────────────┐│
│  │  TODOS                     │  LEADS                                 ││
│  │  ▼ Todo (3)                │  Alex Brown    Last: Jan 25  [📞] [📝]  ││
│  │    ☐ Call John re: ROTH    │  Recall: Jan 30                        ││
│  │    ☐ Review Q4 reports     │  Maria Garcia  Last: Jan 20  [📞] [📝]  ││
│  │  ▼ Done (2)                │  Recall: Feb 2                         ││
│  │    ☑ Send prospectus       │                                        ││
│  └────────────────────────────┴────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

#### Appointments API (Mocked)

```typescript
// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const MOCK_APPOINTMENTS = [
  {
    id: 'apt-1',
    title: 'Portfolio Review',
    clientName: 'John Smith',
    clientEmail: 'john@example.com',
    clientPhone: '555-0101',
    startTime: '2026-01-29T09:00:00Z',
    endTime: '2026-01-29T10:00:00Z',
    type: 'REVIEW',
    status: 'CONFIRMED',
    location: 'Office',
  },
  {
    id: 'apt-2',
    title: 'Tax Planning Discussion',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@example.com',
    clientPhone: '555-0102',
    startTime: '2026-01-29T10:30:00Z',
    endTime: '2026-01-29T11:30:00Z',
    type: 'PLANNING',
    status: 'SCHEDULED',
    meetingLink: 'https://zoom.us/j/123456',
  },
  {
    id: 'apt-3',
    title: 'New Client Introduction',
    clientName: 'Mike Williams',
    clientEmail: 'mike@example.com',
    clientPhone: '555-0103',
    startTime: '2026-01-29T13:00:00Z',
    endTime: '2026-01-29T14:00:00Z',
    type: 'ONBOARDING',
    status: 'CONFIRMED',
  },
  {
    id: 'apt-4',
    title: 'Estate Planning Follow-up',
    clientName: 'Emily Chen',
    clientEmail: 'emily@example.com',
    clientPhone: '555-0104',
    startTime: '2026-01-29T15:30:00Z',
    endTime: '2026-01-29T16:30:00Z',
    type: 'FOLLOW_UP',
    status: 'SCHEDULED',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  let appointments = MOCK_APPOINTMENTS;
  
  if (dateParam) {
    const date = parseISO(dateParam);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    appointments = MOCK_APPOINTMENTS.filter(apt => {
      const aptDate = parseISO(apt.startTime);
      return aptDate >= dayStart && aptDate <= dayEnd;
    });
  }
  
  return NextResponse.json({ appointments });
}
```

#### Leads API (Mocked)

```typescript
// src/app/api/leads/route.ts
const MOCK_LEADS = [
  {
    id: 'lead-1',
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'alex.brown@company.com',
    phone: '555-0201',
    company: 'Tech Innovations Inc',
    source: 'REFERRAL',
    status: 'CONTACTED',
    lastCalledAt: '2026-01-25T14:30:00Z',
    recallDate: '2026-01-30T10:00:00Z',
    lastCallNotes: 'Interested in aggressive growth portfolio. Follow up with prospectus.',
  },
  {
    id: 'lead-2',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@business.com',
    phone: '555-0202',
    company: 'Garcia Enterprises',
    source: 'WEBSITE',
    status: 'QUALIFIED',
    lastCalledAt: '2026-01-20T11:00:00Z',
    recallDate: '2026-02-02T09:00:00Z',
    lastCallNotes: 'High net worth individual. Interested in tax-efficient strategies.',
  },
];

export async function GET() {
  return NextResponse.json({ leads: MOCK_LEADS });
}
```

#### Todos API (Database Connected)

```typescript
// src/app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@advisor-hub/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  
  const where: any = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  
  const todos = await prisma.todo.findMany({
    where,
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  
  return NextResponse.json({ todos });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const todo = await prisma.todo.create({
    data: {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      clientId: body.clientId,
      sourceType: body.sourceType || 'MANUAL',
      sourceId: body.sourceId,
    },
  });
  
  return NextResponse.json({ todo }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  
  const todo = await prisma.todo.update({
    where: { id },
    data: {
      ...updates,
      completedAt: updates.status === 'DONE' ? new Date() : null,
    },
  });
  
  return NextResponse.json({ todo });
}
```

### 4.2 Client Page

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CLIENT HEADER                                                                   │
│  [Avatar] John Smith                                        [Import ▼] [⋮]      │
│           Senior VP, Acme Corp | john@acme.com | 555-1234                        │
├───────────────────────────────────────────────────────────┬─────────────────────┤
│  MAIN CONTENT                                              │  CHAT SIDEBAR       │
│  ┌─────────────────────────────┬─────────────────────────┐│                     │
│  │  CONTACT DETAILS            │  TOROID INVESTMENT CHART││  [Chat History]     │
│  │  Email: john@acme.com       │      [Donut Chart]      ││                     │
│  │  Phone: 555-1234            │   Stocks: 45%           ││  User: What is my   │
│  │  Risk: Moderate             │   Bonds: 30%            ││  current allocation?│
│  └─────────────────────────────┴─────────────────────────┘│                     │
│  ┌───────────────────────────────────────────────────────┐│  AI: Based on your  │
│  │  PERFORMANCE METRICS                                   ││  portfolio...       │
│  │  Total: $1.2M  |  YTD: +12.5%  |  vs Benchmark: +2.1% ││                     │
│  └───────────────────────────────────────────────────────┘│  [Loading Tasks]    │
│  ┌───────────────────────────────────────────────────────┐│  ┌─────────────────┐│
│  │  CALL TRANSCRIPT                                       ││  │ ⏳ Summary      ││
│  │  [▶ Record] | Advisor | Client                        ││  │    pending      ││
│  │  00:00 [A]: Good morning John...                      ││  └─────────────────┘│
│  │  AI SUMMARY: Client interested in ROTH conversion     ││                     │
│  │  SUGGESTED: [+ Add to Todos ☐ Due Date]               ││  [Message Input]    │
│  └───────────────────────────────────────────────────────┘│                     │
│  ┌───────────────────────────────────────────────────────┐│                     │
│  │  NOTES                                                 ││                     │
│  │  [+ Add Note]                                         ││                     │
│  │  Jan 28: Discussed retirement timeline changes...     ││                     │
│  └───────────────────────────────────────────────────────┘│                     │
└───────────────────────────────────────────────────────────┴─────────────────────┘
```

#### Features

1. **Import Client Details**
   - Drop-in icon and button in top right
   - Paste/drop text with client details
   - AI parses and extracts structured fields
   - Saves to client profile AND knowledge graph

2. **Toroid Wheel Chart**
   - Visual representation of investment allocation
   - Categories: Stocks, Bonds, Real Estate, Cash, etc.
   - Interactive hover states showing percentages

3. **Call Transcript**
   - Start/stop recording button
   - Real-time transcription with speaker separation (Advisor/Client)
   - WebSocket streaming to Python backend
   - LLM generates summary and suggested next action
   - "+ Add to Todos" button with optional due date checkbox
   - Uses Calendar component from common package for date selection

4. **Notes Section**
   - Add new notes linked to client
   - Notes sync to knowledge graph for context retrieval
   - Categories: General, Meeting, Call, Financial, Personal

---

## 5. Agentic Chat System

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Chat Message Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Message                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ROOT ORCHESTRATOR (LangGraph)               │    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │ 1. Extract Interests from Message                   ││    │
│  │  │    - Pattern matching for "interested in", "looking"││    │
│  │  │    - LLM classification for complex statements      ││    │
│  │  │    - Save extracted interests to Knowledge Graph    ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │ 2. Retrieve Context from Knowledge Graph            ││    │
│  │  │    - Client profile, interests, recent notes        ││    │
│  │  │    - Investment summary                             ││    │
│  │  │    - Previous chat history                          ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │ 3. Check if Expert Consultation Needed              ││    │
│  │  │    - Complex tax/estate/regulatory questions        ││    │
│  │  │    - Query external Agent Catalog API if needed     ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │  │ 4. Generate Response                                ││    │
│  │  │    - Combine all context into system prompt         ││    │
│  │  │    - Generate helpful, contextual response          ││    │
│  │  └─────────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Long-Running Task Management

#### Problem
HTTP requests timeout after ~30 seconds. Complex LLM operations may take longer.

#### Solution
1. Start task with timeout monitoring
2. If timeout approaching:
   - Backend continues processing in background
   - Frontend receives notification task is long-running
   - Task result saved to `longRunningTaskResults` array in chat session
3. Frontend polls `/api/chat/poll` endpoint for completed results
4. Results displayed via subtle notification card at top of chat

#### Task Manager Implementation

```python
# src/services/task_manager.py
import asyncio
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import redis.asyncio as redis

class TaskStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class TaskResult:
    task_id: str
    status: TaskStatus
    result: Any | None = None
    error: str | None = None
    completed_at: datetime | None = None

class TaskManager:
    def __init__(self):
        self.redis: redis.Redis | None = None
        self._background_tasks: set[asyncio.Task] = set()
    
    async def execute_with_timeout(
        self,
        task_fn: Callable,
        session_id: str,
        timeout: int = 30,
        *args, **kwargs
    ) -> tuple[TaskResult | None, bool]:
        """
        Execute task with timeout handling.
        Returns (result, is_long_running)
        """
        task_id = str(uuid.uuid4())
        
        try:
            result = await asyncio.wait_for(
                task_fn(*args, **kwargs),
                timeout=timeout
            )
            return TaskResult(task_id, TaskStatus.COMPLETED, result), False
            
        except asyncio.TimeoutError:
            # Move to background
            background_task = asyncio.create_task(
                self._continue_in_background(task_id, session_id, task_fn, args, kwargs)
            )
            self._background_tasks.add(background_task)
            return TaskResult(task_id, TaskStatus.PENDING), True
    
    async def _continue_in_background(self, task_id, session_id, task_fn, args, kwargs):
        try:
            result = await task_fn(*args, **kwargs)
            await self._store_result(session_id, TaskResult(
                task_id, TaskStatus.COMPLETED, result, completed_at=datetime.utcnow()
            ))
        except Exception as e:
            await self._store_result(session_id, TaskResult(
                task_id, TaskStatus.FAILED, error=str(e), completed_at=datetime.utcnow()
            ))
    
    async def get_pending_results(self, session_id: str) -> list[TaskResult]:
        """Poll for completed background tasks."""
        # Retrieve from Redis and return completed tasks
        pass
```

### 5.3 LangGraph Orchestrator

```python
# src/agents/orchestrator.py
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, END

class OrchestratorState(TypedDict):
    messages: Sequence[BaseMessage]
    client_id: str
    session_id: str
    extracted_interests: list[str]
    context: dict
    should_query_expert: bool
    expert_response: str | None
    final_response: str | None

class ChatOrchestrator:
    def __init__(self, knowledge_graph, expert_connector):
        self.llm = ChatAnthropic(model="claude-sonnet-4-20250514")
        self.knowledge_graph = knowledge_graph
        self.expert_connector = expert_connector
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(OrchestratorState)
        
        workflow.add_node("extract_interests", self._extract_interests)
        workflow.add_node("retrieve_context", self._retrieve_context)
        workflow.add_node("check_expert_need", self._check_expert_need)
        workflow.add_node("query_expert", self._query_expert)
        workflow.add_node("generate_response", self._generate_response)
        
        workflow.set_entry_point("extract_interests")
        workflow.add_edge("extract_interests", "retrieve_context")
        workflow.add_edge("retrieve_context", "check_expert_need")
        workflow.add_conditional_edges(
            "check_expert_need",
            lambda s: "query_expert" if s["should_query_expert"] else "generate_response"
        )
        workflow.add_edge("query_expert", "generate_response")
        workflow.add_edge("generate_response", END)
        
        return workflow.compile()
    
    async def _extract_interests(self, state: OrchestratorState) -> dict:
        """Extract client interests and save to knowledge graph."""
        # Pattern matching + LLM analysis for interests
        # Save to knowledge graph if found
        pass
    
    async def _retrieve_context(self, state: OrchestratorState) -> dict:
        """Get relevant context from knowledge graph."""
        context = await self.knowledge_graph.get_client_context(state["client_id"])
        return {"context": context}
    
    async def _generate_response(self, state: OrchestratorState) -> dict:
        """Generate final response with all context."""
        system_prompt = self._build_system_prompt(state)
        response = await self.llm.ainvoke([...])
        return {"final_response": response.content}
```

### 5.4 Interest Extractor

```python
# src/agents/interest_extractor.py
import re

class InterestExtractor:
    INTEREST_PATTERNS = [
        r"i(?:'m| am) interested in (.+?)(?:\.|,|$)",
        r"i(?:'m| am) looking for (.+?)(?:\.|,|$)",
        r"i want to (?:learn|know) about (.+?)(?:\.|,|$)",
        r"tell me about (.+?)(?:\.|,|$)",
    ]
    
    async def extract(self, message: str) -> list[str]:
        """Extract interests using patterns + LLM for complex cases."""
        interests = []
        message_lower = message.lower()
        
        for pattern in self.INTEREST_PATTERNS:
            matches = re.findall(pattern, message_lower, re.IGNORECASE)
            interests.extend(matches)
        
        if not interests:
            interests = await self._llm_extract(message)
        
        return list(set(filter(None, interests)))
```

---

## 6. Knowledge Graph (Azure Cosmos DB)

### 6.1 Graph Schema

```
VERTICES:
- Client (clientId, name, email, riskTolerance)
- Interest (name)
- Note (noteId, content, category, createdAt)
- Investment (name, category, value, percentage)
- Call (callId, summary, date)

EDGES:
- Client -[HAS_INTEREST]-> Interest
- Client -[HAS_NOTE]-> Note
- Client -[HAS_INVESTMENT]-> Investment
- Client -[HAD_CALL]-> Call
- Interest -[MENTIONED_IN]-> Note
```

### 6.2 Knowledge Graph Service

```python
# src/services/knowledge_graph.py
from gremlin_python.driver import client

class KnowledgeGraphService:
    async def add_client_interests(self, client_id: str, interests: list[str]):
        """Add interests to client's knowledge graph."""
        for interest in interests:
            query = f"""
            g.V().has('Interest', 'name', '{interest}')
            .fold()
            .coalesce(unfold(), addV('Interest').property('name', '{interest}'))
            .as('interest')
            .V().has('Client', 'clientId', '{client_id}')
            .addE('HAS_INTEREST').to('interest')
            """
            await self._execute_query(query)
    
    async def add_client_note(self, client_id: str, note_id: str, content: str):
        """Add note to knowledge graph for context retrieval."""
        pass
    
    async def get_client_context(self, client_id: str) -> dict:
        """Retrieve all relevant context for a client."""
        return {
            "profile": await self._get_profile(client_id),
            "interests": await self._get_interests(client_id),
            "recent_notes": await self._get_recent_notes(client_id),
            "investment_summary": await self._get_investments(client_id),
        }
```

---

## 7. UI/UX Design System

### 7.1 Design Tokens (Tailwind v4)

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors - Light, clean, professional */
  --color-background: #f8fafc;        /* Faint off-white with blue tint */
  --color-surface: #ffffff;
  --color-border: rgba(148, 163, 184, 0.3);
  --color-border-strong: rgba(148, 163, 184, 0.5);
  
  /* Text */
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  
  /* Accents */
  --color-accent: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Glass effect */
  --color-glass-bg: rgba(255, 255, 255, 0.7);
  --color-glass-border: rgba(255, 255, 255, 0.5);
  
  /* Shadows - Subtle */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

body {
  background: linear-gradient(135deg, var(--color-background) 0%, #e0f2fe 100%);
  min-height: 100vh;
}

/* Glass morphism */
.glass {
  background: var(--color-glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
}

/* White buttons and textareas */
input, textarea, select, button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

input:focus, textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 7.2 Component Variants

```typescript
// GlassCard Component
<div className="
  rounded-xl
  bg-white/70
  backdrop-blur-md
  border border-gray-200/50
  shadow-sm
  p-4
">
  {children}
</div>

// Button (White with subtle border)
<button className="
  bg-white
  border border-gray-200/50
  rounded-lg
  px-4 py-2
  text-gray-700
  shadow-sm
  hover:bg-gray-50
  hover:shadow-md
  transition-all
">
  {label}
</button>

// Input (White)
<input className="
  w-full
  bg-white
  border border-gray-200/50
  rounded-lg
  px-3 py-2
  text-gray-800
  placeholder-gray-400
  focus:border-blue-500
  focus:ring-2 focus:ring-blue-500/10
  transition-all
" />
```

---

## 8. Chat UI Specifications

### 8.1 Chat Sidebar Component

Located on right side of Client Page. Features:

1. **Header**: "AI Assistant" with subtitle
2. **Long-Running Task Notifications**: Subtle card dropdown at top showing pending tasks with loading spinners
3. **Message History**: Scrollable list with user/assistant messages
4. **Input Area**: Text input with send button

### 8.2 Long-Running Task Notification

```typescript
// When task times out, show notification
<div className="p-3 bg-blue-50/50 border-b">
  <div className="flex items-center gap-3 p-2 bg-white/70 rounded-lg">
    <Spinner size="sm" />
    <div>
      <p className="text-sm text-gray-700">Processing request...</p>
      <p className="text-xs text-gray-500">Result will appear when ready</p>
    </div>
  </div>
</div>
```

### 8.3 Polling Hook

```typescript
// src/hooks/useLongRunningTasks.ts
export function useLongRunningTasks(sessionId: string | null) {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Poll every 3 seconds
  const { data } = useSWR(
    sessionId ? `/api/chat/poll?sessionId=${sessionId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  // Move completed tasks from pending to completed
  useEffect(() => {
    if (data?.completedTasks) {
      // Update state accordingly
    }
  }, [data]);

  return { pendingTasks, completedTasks, dismissTask };
}
```

---

## 9. Common Package Components

### 9.1 Calendar Component

```typescript
// packages/common/src/components/Calendar/Calendar.tsx
interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({ selectedDate, onDateSelect, minDate, maxDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Render month view with day selection
}
```

### 9.2 ToroidChart Component

```typescript
// packages/common/src/components/Charts/ToroidChart.tsx
interface ToroidChartData {
  label: string;
  value: number;
  color: string;
}

interface ToroidChartProps {
  data: ToroidChartData[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export function ToroidChart({ data, size = 200, strokeWidth = 24, ... }: ToroidChartProps) {
  // SVG donut chart with segments
}
```

### 9.3 GlassCard Component

```typescript
// packages/common/src/components/Card/GlassCard.tsx
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export function GlassCard({ children, className, blur = 'md', padding = 'md', hoverable }: GlassCardProps) {
  return (
    <div className={cn(
      'rounded-xl bg-white/70 backdrop-blur-md border border-gray-200/50 shadow-sm',
      hoverable && 'transition-shadow hover:shadow-md',
      className
    )}>
      {children}
    </div>
  );
}
```

---

## 10. TypeScript Type Definitions

```typescript
// src/types/index.ts

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  investmentGoals?: string;
  status: 'PROSPECT' | 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'CHURNED';
  investments?: Investment[];
  notes?: Note[];
  calls?: Call[];
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  clientId?: string;
  sourceType: 'MANUAL' | 'CALL_SUMMARY' | 'CHAT_SUGGESTION';
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source: 'REFERRAL' | 'WEBSITE' | 'COLD_CALL' | 'EVENT' | 'SOCIAL_MEDIA' | 'OTHER';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED';
  lastCalledAt?: string;
  recallDate?: string;
  lastCallNotes?: string;
}

export interface Appointment {
  id: string;
  title: string;
  clientName: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  type: 'CONSULTATION' | 'REVIEW' | 'PLANNING' | 'FOLLOW_UP' | 'ONBOARDING';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  location?: string;
  meetingLink?: string;
}

export interface Investment {
  id: string;
  name: string;
  category: 'STOCKS' | 'BONDS' | 'MUTUAL_FUNDS' | 'ETF' | 'REAL_ESTATE' | 'CASH' | 'CRYPTO' | 'OTHER';
  value: number;
  percentage: number;
  gainLoss?: number;
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  isLongRunning?: boolean;
  taskId?: string;
  taskStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface PendingTask {
  id: string;
  description?: string;
  startedAt: string;
}

export interface CompletedTask {
  id: string;
  result: string;
  completedAt: string;
}
```

---

## 11. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/advisor_hub"

# Redis
REDIS_URL="redis://localhost:6379"

# Azure Cosmos DB
COSMOS_ENDPOINT="your-cosmos-endpoint"
COSMOS_KEY="your-cosmos-key"
COSMOS_DATABASE="advisor-hub"
COSMOS_CONTAINER="knowledge-graph"

# AI
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Agent Catalog
AGENT_CATALOG_URL="https://agents.example.com"
AGENT_CATALOG_API_KEY="..."

# Next.js
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Python Backend
AGENTIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_AGENTIC_WS_URL="ws://localhost:8000"
```

---

## 12. Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Set up monorepo with pnpm and Turborepo
- [ ] Configure Next.js 16 with TypeScript and Tailwind v4
- [ ] Set up Prisma with PostgreSQL
- [ ] Create database schema and migrations
- [ ] Implement common UI component library
- [ ] Set up Python FastAPI project with Poetry

### Phase 2: Dashboard (Week 2-3)
- [ ] Build Dashboard Home layout
- [ ] Implement Calendar component
- [ ] Create Appointments API (mocked)
- [ ] Build Todos panel with database persistence
- [ ] Create Leads panel with mocked API
- [ ] Implement navigation and routing

### Phase 3: Client Page (Week 3-4)
- [ ] Build Client Page layout
- [ ] Implement Contact Details section
- [ ] Create ToroidChart investment visualization
- [ ] Build Performance Metrics component
- [ ] Implement Notes section with CRUD
- [ ] Create Import Client modal

### Phase 4: Call Transcription (Week 4-5)
- [ ] Set up audio recording in browser
- [ ] Implement WebSocket transcription stream
- [ ] Build speaker separation logic
- [ ] Create transcript UI with timeline
- [ ] Implement AI summary generation
- [ ] Add suggested action → Todo flow

### Phase 5: Agentic Chat (Week 5-6)
- [ ] Build LangGraph orchestrator
- [ ] Implement interest extraction
- [ ] Set up Azure Cosmos DB knowledge graph
- [ ] Create context retrieval service
- [ ] Implement long-running task manager
- [ ] Build Chat Sidebar UI
- [ ] Add polling for background tasks

### Phase 6: Integration & Polish (Week 6-7)
- [ ] Connect all components
- [ ] Implement error handling throughout
- [ ] Add loading states and skeletons
- [ ] Performance optimization
- [ ] Security audit
- [ ] E2E testing

---

*End of Specification Document*