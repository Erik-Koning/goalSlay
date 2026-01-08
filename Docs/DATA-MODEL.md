# Data Model

## Database Schema

The application uses **Prisma 7** with **Azure SQL Server** as the database provider.

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     account     │────▶│      user       │◀────│    session      │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GoalGuide     │     │  UserGoalSet    │     │  DailyUpdate    │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                        │
                                 ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │      Goal       │     │ExtractedActivity│
                        └────────┬────────┘     └─────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│GoalProgressEst. │     │  ExpertReview   │     │GoalExpertSelect.│
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Achievement   │◀───▶│UserAchievement  │◀───▶│      user       │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│NotificationSet. │◀───▶│      user       │
└─────────────────┘     └─────────────────┘

┌─────────────────┐
│  AdminSettings  │◀───▶user (admin only)
└─────────────────┘
```

## Entities

### Better Auth Models (Core Auth)

#### `account`
| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| accountId | String | Account identifier |
| providerId | String | Auth provider (e.g., "email") |
| userId | String | FK to user |
| accessToken | String? | OAuth access token |
| refreshToken | String? | OAuth refresh token |
| password | String? | Hashed password for email auth |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

#### `session`
| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| token | String | Unique session token |
| expiresAt | DateTime | Session expiration |
| userId | String | FK to user |
| ipAddress | String? | Client IP |
| userAgent | String? | Client user agent |

#### `verification`
| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key |
| identifier | String | Email or phone |
| value | String | Verification code/token |
| expiresAt | DateTime | Expiration time |

### User Model (Extended)

#### `user` (mapped: `users`)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | String | - | Primary key |
| email | VarChar(255) | - | Unique email |
| name | VarChar(255) | - | Display name |
| emailVerified | Boolean | - | Email verification status |
| image | String? | - | Profile image URL |
| role | VarChar(50) | "user" | "user" or "admin" |
| timezone | VarChar(100) | "UTC" | User timezone |
| streakCurrent | Int | 0 | Current streak days |
| streakLongest | Int | 0 | Longest streak achieved |
| streakLastUpdate | DateTime? | - | Last streak update |
| totalPoints | Int | 0 | Gamification points |
| createdAt | DateTime | - | Account creation |
| updatedAt | DateTime | - | Last update |

### Goal Management

#### `GoalGuide` (mapped: `goal_guides`)
Admin-created guidelines and rules for goal setting.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| createdById | String? | FK to admin user |
| title | VarChar(255) | Guide title |
| description | Text? | Guide description |
| guideType | VarChar(50) | "role_guide" or "goal_guide" |
| content | Text | JSON: Rules, examples, constraints |
| isDefault | Boolean | Default guide flag |
| isActive | Boolean | Active/archived status |
| appliesToUserId | String? | NULL = applies to all users |

#### `UserGoalSet` (mapped: `user_goal_sets`)
Container for 3-5 goals per user period.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | FK to user |
| status | VarChar(50) | See status values below |
| startDate | Date | Goal set start date |
| endDate | Date? | Goal set end date |
| requiresApproval | Boolean | Admin approval required |
| approvedById | String? | FK to approving admin |
| approvedAt | DateTime? | Approval timestamp |
| adminComment | Text? | Admin feedback |
| editableUntil | Date? | startDate + 14 days |

**Status Values**: `draft` | `pending_review` | `pending_approval` | `active` | `completed` | `abandoned`

#### `Goal` (mapped: `goals`)
Individual goal within a set.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userGoalSetId | String | FK to UserGoalSet |
| goalText | Text | The goal description |
| goalOrder | Int | Position 1-5 |
| validationStatus | VarChar(50) | See validation status below |
| validationFeedback | Text? | LLM validation feedback |
| expertSummary | Text? | Orchestrator's aggregated summary |

**Validation Status**: `pending` | `valid` | `warning` | `rejected`

#### `GoalProgressEstimate` (mapped: `goal_progress_estimates`)
Progress metrics from the Progress Tracker expert.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| goalId | String | FK to Goal |
| unit | VarChar(100) | e.g., "experiments", "hours" |
| estimatedPerDay | Decimal(10,2) | Daily target |
| estimatedPerWeek | Decimal(10,2) | Weekly target |
| setBy | VarChar(50) | "expert", "user", or "admin" |
| modifiedById | String? | FK to modifier |
| modifiedAt | DateTime? | Modification timestamp |

#### `ExpertReview` (mapped: `expert_reviews`)
Individual expert's feedback on a goal.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| goalId | String | FK to Goal |
| expertId | VarChar(50) | e.g., "progress_tracker" |
| expertName | VarChar(100) | Human-readable name |
| reviewContent | Text | Expert's review text |
| actionItems | Text? | JSON array of suggested actions |

#### `GoalExpertSelection` (mapped: `goal_expert_selections`)
User's selected experts for a goal.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| goalId | String | FK to Goal |
| expertId | VarChar(50) | Expert identifier |
| isRequired | Boolean | progress_tracker is always required |

**Constraint**: Unique on (goalId, expertId)

### Daily Updates & Activity Tracking

#### `DailyUpdate` (mapped: `daily_updates`)
User check-ins for progress tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | FK to user |
| userGoalSetId | String | FK to UserGoalSet |
| updateText | Text | User's update content |
| updatePeriod | VarChar(50) | See period values |
| periodDate | Date | Date of the update |

**Update Period Values**: `morning` | `afternoon` | `evening` | `full_day`

#### `ExtractedActivity` (mapped: `extracted_activities`)
LLM-parsed activities from daily updates.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| dailyUpdateId | String | FK to DailyUpdate |
| userId | String | FK to user |
| activityType | VarChar(50) | See activity types |
| quantity | Decimal(10,2) | Quantity of activity |
| summary | Text | Activity description |
| activityDate | Date | When activity occurred |
| period | VarChar(50) | Time period |
| linkedGoalId | String? | Optional FK to Goal |

**Activity Types**: `experiments` | `product_demos` | `mentoring` | `presentations` | `volunteering`

### Gamification

#### `Achievement` (mapped: `achievements`)
System-defined badges and achievements.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| name | VarChar(100) | Unique achievement name |
| description | Text | Achievement description |
| icon | VarChar(100) | Icon identifier |
| category | VarChar(50) | See categories |
| points | Int | Points awarded |
| criteria | Text | JSON: Conditions to unlock |
| isActive | Boolean | Active status |

**Categories**: `streak` | `goals` | `activities` | `special`

#### `UserAchievement` (mapped: `user_achievements`)
Earned achievements per user.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | FK to user |
| achievementId | String | FK to Achievement |
| earnedAt | DateTime | When earned |

**Constraint**: Unique on (userId, achievementId)

### Settings

#### `NotificationSettings` (mapped: `notification_settings`)
Per-user notification preferences.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | String (cuid) | - | Primary key |
| userId | String | - | Unique FK to user |
| progressReminderEnabled | Boolean | true | Enable progress reminders |
| progressThresholdPercent | Int | 50 | Threshold for reminders |
| dailyReminderEnabled | Boolean | true | Enable daily reminders |
| dailyReminderTime | VarChar(5) | "09:00" | Reminder time |
| weeklySummaryEnabled | Boolean | true | Enable weekly summaries |

#### `AdminSettings` (mapped: `admin_settings`)
Key-value store for admin preferences.

| Column | Type | Description |
|--------|------|-------------|
| id | String (cuid) | Primary key |
| adminId | String | FK to admin user |
| settingKey | VarChar(100) | Setting identifier |
| settingValue | Text | JSON value |

**Constraint**: Unique on (adminId, settingKey)

## Indexes

| Table | Columns | Purpose |
|-------|---------|---------|
| user_goal_sets | userId | Fast lookup by user |
| user_goal_sets | status | Filter by status |
| goals | userGoalSetId | Fast lookup within set |
| daily_updates | userId, periodDate | User history queries |
| extracted_activities | userId, activityDate | Activity tracking |
| extracted_activities | activityType | Activity analytics |
| user_achievements | userId | User badges |

## Relationships Summary

| From | To | Type | On Delete |
|------|-----|------|-----------|
| account | user | Many-to-One | Cascade |
| session | user | Many-to-One | Cascade |
| GoalGuide | user (creator) | Many-to-One | NoAction |
| GoalGuide | user (appliesTo) | Many-to-One | NoAction |
| UserGoalSet | user (owner) | Many-to-One | NoAction |
| UserGoalSet | user (approver) | Many-to-One | NoAction |
| Goal | UserGoalSet | Many-to-One | Cascade |
| GoalProgressEstimate | Goal | Many-to-One | NoAction |
| ExpertReview | Goal | Many-to-One | Cascade |
| GoalExpertSelection | Goal | Many-to-One | Cascade |
| DailyUpdate | user | Many-to-One | NoAction |
| DailyUpdate | UserGoalSet | Many-to-One | NoAction |
| ExtractedActivity | DailyUpdate | Many-to-One | NoAction |
| ExtractedActivity | Goal (linked) | Many-to-One | SetNull |
| UserAchievement | user | Many-to-One | Cascade |
| UserAchievement | Achievement | Many-to-One | Cascade |
| NotificationSettings | user | One-to-One | Cascade |
| AdminSettings | user | Many-to-One | Cascade |

## Migration Strategy

### Schema Changes Process
1. Modify `packages/app-main/prisma/schema.prisma`
2. Run `pnpm prisma:generate` to regenerate client
3. Run `pnpm prisma:push` to apply to database
4. Update this documentation

### Breaking Changes Anticipated
- None currently planned

### Backward Compatibility
- All new columns should have defaults where possible
- Use nullable fields for optional new data
- Consider shadow columns for major refactors

---

*Last Updated: 2026-01-07*
