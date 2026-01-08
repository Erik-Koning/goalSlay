# User Flows

## Primary User Journeys

### 1. New User Onboarding

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Landing    │───▶│   Signup    │───▶│   Verify    │───▶│   First     │
│   Page      │    │   Form      │    │   Email     │    │   Goals     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Steps**:
1. User visits landing page (`/`)
2. Clicks "Get Started" or "Sign Up"
3. Fills signup form (`/signup`) with name, email, password
4. Receives verification email via Azure
5. Clicks verification link
6. Auto-signed in, redirected to home (`/home`)
7. Prompted to create first goal set

**Entry Points**: `/`, `/signup`
**Exit Points**: `/home`, `/goals/new`

**Error States**:
- Invalid email domain -> Error message on signup form
- Email already registered -> Error message with login link
- Verification expired -> Resend verification option

### 2. Goal Creation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  New Goal   │───▶│   Write     │───▶│   Expert    │───▶│   Review    │
│   Page      │    │   Goals     │    │   Selection │    │   Results   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                                                         │
      │                  ┌─────────────┐                       │
      └─────────────────▶│   Revise    │◀──────────────────────┘
                         │   (if needed)│
                         └─────────────┘
```

**Steps**:
1. User navigates to `/goals/new`
2. Enters 3-5 goals with descriptions
3. Each goal validated in real-time (optional)
4. Selects start date
5. Chooses optional experts (Progress Tracker auto-selected)
6. Submits for expert review
7. Views expert feedback and recommendations
8. Revises goals if any rejected
9. Confirms and activates goal set

**Entry Points**: `/goals/new`, `/home` (CTA button)
**Exit Points**: `/dashboard`, `/home`

**Permissions**: Authenticated users only

**Error States**:
- Less than 3 goals -> Validation error
- Goal too short -> Inline validation
- All goals rejected -> Must revise before proceeding

### 3. Daily Check-in Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │───▶│   Update    │───▶│   Activity  │───▶│   Streak    │
│   Home      │    │   Form      │    │   Summary   │    │   Updated   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Steps**:
1. User visits dashboard (`/dashboard`)
2. Sees prompt for daily update (or check-in button)
3. Selects update period (morning/afternoon/evening/full day)
4. Writes update describing progress
5. Submits update
6. System extracts activities automatically
7. Streak counter updates
8. Points awarded

**Entry Points**: `/dashboard`, `/home`
**Exit Points**: `/dashboard`

**Permissions**: Authenticated users with active goal set

**Error States**:
- No active goal set -> Prompt to create one
- Already submitted full_day update -> Show existing update

### 4. Progress Review Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │───▶│   Goal      │───▶│   Activity  │
│   Overview  │    │   Details   │    │   History   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Steps**:
1. User views dashboard with progress overview
2. Clicks on specific goal for details
3. Views expert recommendations and action items
4. Reviews extracted activities linked to goal
5. Checks progress against estimates

**Entry Points**: `/dashboard`
**Exit Points**: `/dashboard`, `/goals/[id]`

### 5. Leaderboard & Achievements Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │───▶│ Leaderboard │───▶│ Achievement │
│   Sidebar   │    │   Page      │    │   Details   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Steps**:
1. User sees streak/points in dashboard sidebar
2. Clicks to view full leaderboard
3. Views rankings by points or streak
4. Clicks to view earned/available achievements
5. Sees progress toward next achievements

## Admin Journeys

### 6. User Management Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │───▶│   User      │───▶│   User      │
│  Dashboard  │    │   List      │    │   Detail    │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Steps**:
1. Admin accesses admin section
2. Views list of all users
3. Filters/searches for specific user
4. Views user details (goals, updates, achievements)
5. Can edit user role or settings

**Permissions**: Admin role only

### 7. Goal Approval Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │───▶│   Pending   │───▶│   Approve/  │
│  Dashboard  │    │   Queue     │    │   Reject    │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Steps**:
1. Admin sees pending approvals count
2. Clicks to view pending goal sets
3. Reviews goal set and expert feedback
4. Approves or rejects with comment
5. User notified of decision

**Permissions**: Admin role only

### 8. Guide Management Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │───▶│   Guide     │───▶│   Create/   │
│  Dashboard  │    │   List      │    │   Edit      │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Steps**:
1. Admin navigates to guide management
2. Views existing guides
3. Creates new guide with content
4. Assigns to all users or specific user
5. Activates/deactivates guides

**Permissions**: Admin role only

## Entry/Exit Points Summary

| Page | Entry From | Exit To |
|------|-----------|---------|
| `/` (Landing) | Direct URL, external links | `/login`, `/signup` |
| `/login` | Landing, any unauthenticated page | `/home`, `/dashboard` |
| `/signup` | Landing | `/verify-email`, `/login` |
| `/verify-email` | Email link | `/home` (success), `/signup` (error) |
| `/home` | Login, navigation | `/goals/new`, `/dashboard` |
| `/goals/new` | Home, dashboard | `/dashboard`, `/home` |
| `/dashboard` | Login, navigation | `/goals/*`, `/settings` |
| `/dashboard/account` | Dashboard navigation | `/dashboard` |
| `/dashboard/setting` | Dashboard navigation | `/dashboard` |

## Permission Matrix

| Page | Unauthenticated | User | Admin |
|------|-----------------|------|-------|
| `/` | View | Redirect to `/home` | Redirect to `/home` |
| `/login` | View | Redirect to `/home` | Redirect to `/home` |
| `/signup` | View | Redirect to `/home` | Redirect to `/home` |
| `/home` | Redirect to `/login` | View | View |
| `/goals/*` | Redirect to `/login` | View/Edit own | View/Edit all |
| `/dashboard` | Redirect to `/login` | View own | View all |
| `/admin/*` | Redirect to `/login` | Redirect to `/home` | View |

## Error Recovery

### Session Expired
- Automatic redirect to `/login`
- Return URL preserved for post-login redirect
- Session refresh attempted before redirect

### Network Error
- Toast notification with retry option
- Automatic retry with exponential backoff
- Offline indicator in header

### Validation Error
- Inline field-level error messages
- Focus moved to first error field
- Clear error on field change

### Server Error (500)
- User-friendly error page
- "Try again" button
- Link to support/contact

---

*Last Updated: 2026-01-07*
