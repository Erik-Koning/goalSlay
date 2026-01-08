# API Specification

## Overview

All API endpoints are located under `/api/*` and use Next.js App Router route handlers.

**Base URL**: `/api`

**Authentication**: All endpoints (except auth routes) require an authenticated session via Better Auth.

## Authentication

### `GET/POST /api/auth/[...all]`
Catch-all route for Better Auth. Handles:
- `POST /api/auth/sign-up/email` - Email signup
- `POST /api/auth/sign-in/email` - Email login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/verify-email` - Email verification callback

**Domain Restriction**: Only `koning.ca` email domains are allowed for signup.

---

## Goal Sets

### `GET /api/goal-sets`
Get user's goal sets.

**Query Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | No | Filter by status |

**Response** (200):
```json
{
  "goalSets": [
    {
      "id": "cuid",
      "userId": "string",
      "status": "draft|pending_review|pending_approval|active|completed|abandoned",
      "startDate": "2026-01-01",
      "endDate": "2026-03-31",
      "editableUntil": "2026-01-15",
      "goals": [
        {
          "id": "cuid",
          "goalText": "string",
          "goalOrder": 1,
          "validationStatus": "pending|valid|warning|rejected",
          "validationFeedback": "string",
          "expertSummary": "string",
          "progressEstimates": [...],
          "expertReviews": [...]
        }
      ]
    }
  ]
}
```

### `POST /api/goal-sets`
Create a new goal set.

**Request Body**:
```json
{
  "goals": [
    { "goalText": "string (min 10 chars)", "goalOrder": 1 },
    { "goalText": "string", "goalOrder": 2 },
    { "goalText": "string", "goalOrder": 3 }
  ],
  "startDate": "2026-01-01"
}
```

**Validation**:
- `goals`: Array of 3-5 items
- `goals[].goalText`: Minimum 10 characters
- `goals[].goalOrder`: 1-5
- `startDate`: Valid date string

**Response** (201):
```json
{
  "id": "cuid",
  "status": "draft",
  "goals": [...],
  "editableUntil": "2026-01-15"
}
```

### `GET /api/goal-sets/[id]`
Get a specific goal set by ID.

### `PATCH /api/goal-sets/[id]`
Update a goal set.

### `DELETE /api/goal-sets/[id]`
Delete a goal set (if allowed by status).

---

## Goals

### `POST /api/goals/validate`
Validate a single goal using LLM.

**Request Body**:
```json
{
  "goalText": "string (min 10 chars)"
}
```

**Response** (200):
```json
{
  "status": "valid|warning|rejected",
  "feedback": "string",
  "isValid": true,
  "needsRevision": false
}
```

### `GET /api/goals/experts`
Get available expert information.

**Response** (200):
```json
{
  "experts": [
    {
      "id": "progress_tracker",
      "name": "Progress Tracker",
      "description": "Defines metrics and estimates daily/weekly progress targets",
      "icon": "chart-line",
      "isRequired": true
    }
  ]
}
```

### `POST /api/goals/experts/review`
Request expert council review for a goal set.

**Request Body**:
```json
{
  "goalSetId": "cuid",
  "goals": [
    {
      "goalId": "cuid",
      "goalText": "string",
      "goalOrder": 1,
      "selectedExperts": ["progress_tracker", "motivator"]
    }
  ]
}
```

**Response** (200):
```json
{
  "goalSetId": "cuid",
  "goals": [
    {
      "goalId": "cuid",
      "validationStatus": "valid",
      "validationFeedback": "string",
      "expertSummary": "string",
      "expertReviews": [
        {
          "expertId": "progress_tracker",
          "expertName": "Progress Tracker",
          "reviewContent": "string",
          "actionItems": ["string"]
        }
      ],
      "progressEstimate": {
        "goalId": "cuid",
        "unit": "experiments",
        "estimatedPerDay": 2.5,
        "estimatedPerWeek": 12.5
      }
    }
  ],
  "overallFeedback": "string"
}
```

---

## Daily Updates

### `GET /api/daily-updates`
Get user's daily updates.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| goalSetId | string | Filter by goal set |
| startDate | string | Start of date range |
| endDate | string | End of date range |

### `POST /api/daily-updates`
Submit a daily update.

**Request Body**:
```json
{
  "goalSetId": "cuid",
  "updateText": "string",
  "updatePeriod": "morning|afternoon|evening|full_day",
  "periodDate": "2026-01-07"
}
```

### `POST /api/daily-updates/extract`
Extract activities from a daily update using LLM.

**Request Body**:
```json
{
  "updateId": "cuid"
}
```

**Response** (200):
```json
{
  "updateId": "cuid",
  "activities": [
    {
      "activityType": "experiments",
      "quantity": 3,
      "summary": "Ran 3 A/B tests on checkout flow",
      "linkedGoalId": "cuid"
    }
  ]
}
```

---

## Achievements

### `GET /api/achievements`
Get user's achievements and available badges.

**Response** (200):
```json
{
  "earned": [
    {
      "id": "cuid",
      "name": "First Goal",
      "description": "Created your first goal set",
      "icon": "target",
      "category": "goals",
      "points": 10,
      "earnedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "available": [...]
}
```

---

## Leaderboard

### `GET /api/leaderboard`
Get leaderboard data.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | "points" | "points" or "streak" |
| limit | number | 10 | Number of entries |

**Response** (200):
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "cuid",
      "name": "John Doe",
      "value": 1250,
      "isCurrentUser": false
    }
  ],
  "currentUserRank": 15
}
```

---

## Admin Endpoints

### `GET /api/admin/users`
Get all users (admin only).

### `GET /api/admin/users/[id]`
Get specific user details (admin only).

### `PATCH /api/admin/users/[id]`
Update user (admin only).

### `GET /api/admin/guides`
Get goal guides (admin only).

### `POST /api/admin/guides`
Create a goal guide (admin only).

### `POST /api/admin/approve`
Approve/reject a goal set pending approval.

**Request Body**:
```json
{
  "goalSetId": "cuid",
  "action": "approve|reject",
  "comment": "string"
}
```

---

## Export

### `GET /api/export/user`
Export current user's data.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| format | string | "json" or "csv" |

### `GET /api/export/team`
Export team data (admin only).

---

## Notifications

### `GET /api/notifications/settings`
Get user's notification settings.

### `PATCH /api/notifications/settings`
Update notification settings.

**Request Body**:
```json
{
  "progressReminderEnabled": true,
  "progressThresholdPercent": 50,
  "dailyReminderEnabled": true,
  "dailyReminderTime": "09:00",
  "weeklySummaryEnabled": true
}
```

### `POST /api/notifications/check-progress`
Trigger progress check (called by scheduled job).

---

## Users

### `GET /api/users/getUserSafeColumns`
Get current user's safe (non-sensitive) data.

**Response** (200):
```json
{
  "id": "cuid",
  "name": "string",
  "email": "string",
  "role": "user|admin",
  "timezone": "UTC",
  "streakCurrent": 5,
  "streakLongest": 10,
  "totalPoints": 250
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message",
  "details": [...] // Optional, for validation errors
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

*Last Updated: 2026-01-07*
