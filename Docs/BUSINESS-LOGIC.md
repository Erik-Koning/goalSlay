# Business Logic

## Core Domain Rules

### Goal Setting Rules

#### Goal Set Constraints
- Each user can have **3-5 goals** per goal set
- Goals must be at least **10 characters** long
- Goal order must be between **1-5**
- Only **one active goal set** per user at a time
- Goal sets have a **14-day editable window** from start date

#### Goal Validation
Goals are validated by the LLM Validation Agent for SMART criteria:
- **S**pecific - Clear and well-defined
- **M**easurable - Has quantifiable metrics
- **A**chievable - Realistic given context
- **R**elevant - Aligned with professional growth
- **T**ime-bound - Has implicit or explicit timeline

**Validation Statuses**:
| Status | Meaning | User Action |
|--------|---------|-------------|
| `pending` | Not yet validated | Wait for validation |
| `valid` | Meets SMART criteria | Ready to proceed |
| `warning` | Acceptable but could improve | Consider revisions |
| `rejected` | Does not meet criteria | Must revise |

### Goal Set Lifecycle

```
┌─────────┐   submit    ┌─────────────┐   needs     ┌──────────────────┐
│  draft  │────────────▶│pending_review│───approval──▶│pending_approval │
└─────────┘             └──────┬──────┘              └────────┬─────────┘
                               │                              │
                          auto-approve                   admin decision
                               │                              │
                               ▼                              ▼
                        ┌─────────┐                    ┌─────────────┐
                        │  active │                    │  approved / │
                        └────┬────┘                    │  rejected   │
                             │                         └─────────────┘
            ┌────────────────┼────────────────┐
            │                │                │
       all goals         user choice     deadline
       completed          to stop         passed
            │                │                │
            ▼                ▼                ▼
      ┌───────────┐   ┌───────────┐   ┌───────────┐
      │ completed │   │ abandoned │   │ completed │
      └───────────┘   └───────────┘   └───────────┘
```

### Authentication Rules

#### Domain Restriction
- Only email addresses from **`koning.ca`** domain are allowed
- Checked during signup in `auth.ts` database hooks
- Unauthorized domains receive HTTP 422 error

#### Email Verification
- Required for all new signups
- Sent via Azure Communication Services
- Auto sign-in after successful verification
- Verification tokens expire (Better Auth default)

#### Roles
| Role | Permissions |
|------|------------|
| `user` | Own data CRUD, view leaderboard, submit updates |
| `admin` | All user permissions + manage users, guides, approvals |

### Expert Council Rules

#### Expert Selection
- **Progress Tracker** is **always required** and auto-selected
- Users can select **0-7 optional experts**
- All selected experts run in parallel (except Progress Tracker first)

#### Expert Review Process
1. Validation Agent validates goal against SMART criteria
2. Progress Tracker defines metrics and estimates
3. Optional experts provide specialized feedback
4. Orchestrator synthesizes all reviews into summary

### Daily Update Rules

#### Update Periods
| Period | Description |
|--------|-------------|
| `morning` | Updates for morning activities |
| `afternoon` | Updates for afternoon activities |
| `evening` | Updates for evening activities |
| `full_day` | Single update covering entire day |

#### Activity Extraction
The Extraction Agent parses daily updates and identifies:
- **Activity Type**: experiments, product_demos, mentoring, presentations, volunteering
- **Quantity**: Numeric count of activities
- **Summary**: Brief description
- **Goal Linking**: Optional association with specific goal

### Gamification Rules

#### Streak Calculation
- Streak increments when user submits daily update
- Streak resets to 0 if no update for a calendar day
- `streakLongest` updated when `streakCurrent` exceeds it
- Timezone-aware (uses user's configured timezone)

#### Points System
| Action | Points |
|--------|--------|
| Submit daily update | 10 |
| Complete goal set | 100 |
| Earn achievement | Varies by achievement |
| Maintain streak (per day) | 5 |

#### Achievement Categories
| Category | Examples |
|----------|----------|
| `streak` | 7-day streak, 30-day streak, etc. |
| `goals` | First goal, complete 5 goal sets, etc. |
| `activities` | 100 experiments, first demo, etc. |
| `special` | Beta tester, top of leaderboard, etc. |

### Admin Workflow Rules

#### Goal Guide Management
- Guides can be `role_guide` (applies to role) or `goal_guide` (content guide)
- `isDefault` guide used when no specific guide applies
- `appliesToUserId` for user-specific guides (NULL = all users)

#### Approval Workflow
- Some goal sets `requiresApproval = true` (based on org settings)
- Admin sees `pending_approval` goal sets
- Admin can approve (-> `active`) or reject (stays `pending_approval` with comment)

### Notification Rules

#### Progress Reminders
- Triggered when progress falls below `progressThresholdPercent`
- Only sent if `progressReminderEnabled = true`

#### Daily Reminders
- Sent at `dailyReminderTime` (user's local time)
- Only sent if `dailyReminderEnabled = true`
- Skipped if user already submitted update for today

#### Weekly Summary
- Sent on Sunday/Monday (configurable)
- Only sent if `weeklySummaryEnabled = true`
- Includes: streak status, points earned, progress summary

## State Machines

### Goal Set State Machine

```
States: draft, pending_review, pending_approval, active, completed, abandoned

Transitions:
  draft -> pending_review: User submits goals
  pending_review -> pending_approval: If requiresApproval
  pending_review -> active: If !requiresApproval and valid
  pending_approval -> active: Admin approves
  pending_approval -> pending_review: Admin rejects (for revision)
  active -> completed: All goals achieved or end date reached
  active -> abandoned: User abandons

Constraints:
  - Cannot edit goals after editableUntil date
  - Cannot have multiple active goal sets
  - Cannot transition from completed/abandoned
```

### Validation State Machine

```
States: pending, valid, warning, rejected

Transitions:
  pending -> valid: Passes SMART validation
  pending -> warning: Partially meets criteria
  pending -> rejected: Fails SMART validation
  warning -> valid: User revises, passes
  rejected -> valid: User revises, passes
  rejected -> warning: User revises, partially passes

Constraints:
  - Goal set cannot go active if any goal is rejected
```

## Edge Cases

### Goal Editing
- Goals can be edited while `status = draft`
- Goals can be edited until `editableUntil` date if `status = active`
- Admin can always edit goals regardless of status

### Concurrent Updates
- Multiple daily updates allowed per day (different periods)
- Only one `full_day` update per date allowed
- Updates for past dates allowed (backdating) up to 7 days

### Streak Edge Cases
- Timezone changes: Use user's current timezone at evaluation time
- Multiple updates same day: Counts as one day for streak
- Backdated updates: Do not restore broken streaks

### Data Deletion
- Deleting user cascades to: accounts, sessions, achievements
- Goal sets and updates use NoAction (preserved for admin review)
- Admin can hard-delete user data on request

---

*Last Updated: 2026-01-07*
