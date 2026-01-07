# Claude Code Autonomous Development Setup

This configuration provides state-of-the-art autonomous coding practices for Claude Code, optimizing for:
- **Maximum autonomy** without using `--dangerously-skip-permissions`
- **High-quality code** through enforced best practices
- **Concise commits** via conventional commit guidelines
- **Safety** through strategic permission boundaries

## Files Overview

```
.claude/
├── settings.json          # Permission configuration
└── commands/
    ├── implement.md       # /project:implement - Feature implementation
    ├── fix-issue.md       # /project:fix-issue - GitHub issue fixing
    ├── refactor.md        # /project:refactor - Safe refactoring
    └── review.md          # /project:review - Code review

CLAUDE.md                  # Project-wide instructions
```

## Installation

### 1. Copy the CLAUDE.md
```bash
cp CLAUDE.md /path/to/your/project/CLAUDE.md
```

### 2. Set up project permissions
```bash
mkdir -p /path/to/your/project/.claude
cp settings.json /path/to/your/project/.claude/settings.json
```

### 3. Add custom commands
```bash
mkdir -p /path/to/your/project/.claude/commands
cp commands/*.md /path/to/your/project/.claude/commands/
```

### 4. Git ignore local settings (optional)
```bash
echo ".claude/settings.local.json" >> /path/to/your/project/.gitignore
```

## Permission Strategy

### Fully Allowed (No Prompts)
- **File Operations**: Read, Edit, Write, MultiEdit, Glob, Grep, LS
- **Git Operations**: All common git commands (status, diff, add, commit, etc.)
- **Package Management**: pnpm, npm, npx
- **Development Tools**: TypeScript, ESLint, Prettier, Jest, Vitest
- **Unix Utilities**: cat, grep, find, sort, jq, etc.
- **GitHub CLI**: gh issue, gh pr, gh repo

### Denied (Blocked)
- Environment files (.env, .env.*, secrets/)
- Git credentials
- Destructive commands (rm -rf /, sudo)
- Dangerous shell patterns (curl|sh, eval)

### Ask First (Requires Confirmation)
- `rm` (file deletion)
- `git push` (especially force push)
- `docker` commands
- `curl`/`wget` (network requests)

## Custom Commands

### `/project:implement <description>`
Structured feature implementation workflow with planning, research, and verification.

```
/project:implement add user avatar upload to profile page
```

### `/project:fix-issue <number>`
GitHub issue resolution workflow with automatic issue fetching.

```
/project:fix-issue 123
```

### `/project:refactor <target>`
Safe refactoring with incremental verification.

```
/project:refactor src/components/UserProfile.tsx
```

### `/project:review [target]`
Comprehensive code review with categorized feedback.

```
/project:review src/lib/auth.ts
/project:review pr
```

## Tips for Maximum Autonomy

### 1. Use Extended Thinking
Prompt Claude to think before acting:
- "Think hard about the best approach, then implement..."
- "Ultrathink about the architecture, then..."

### 2. Be Specific in Requests
```
❌ "fix the bug"
✅ "fix the login form validation bug in src/components/auth/LoginForm.tsx - users can submit empty emails"
```

### 3. Let Claude Self-Verify
Claude will automatically:
- Run lint/build after changes
- Fix issues before committing
- Create atomic commits with good messages

### 4. Use Plan Mode First
For complex tasks, start in plan mode (Shift+Tab twice):
```
"Plan how you would implement OAuth with Google, including all files that need changes"
```
Then switch to normal mode to execute.

### 5. Batch Related Work
Instead of:
```
"add a button" → "now style it" → "now add the handler"
```

Do:
```
"implement a submit button with Tailwind styling and a click handler that calls the API"
```

## Sandboxing (Optional, Recommended)

For additional security, enable sandboxing in Claude Code:
```
/sandbox
```

This provides:
- Filesystem isolation (write only to project directory)
- Network isolation (approved hosts only)
- 84% reduction in permission prompts (per Anthropic)

## Customization

### Add Project-Specific Commands
Create new `.md` files in `.claude/commands/` for your workflows.

### Adjust Permissions
Edit `.claude/settings.json` or use `/permissions` interactively:
```
/permissions add Bash(docker build:*)
/permissions remove Bash(curl:*)
```

### Local Overrides
Create `.claude/settings.local.json` for personal settings that aren't committed:
```json
{
  "permissions": {
    "allow": ["Bash(my-custom-script:*)"]
  }
}
```

## Comparison: This Setup vs. `--dangerously-skip-permissions`

| Aspect | This Setup | YOLO Mode |
|--------|-----------|-----------|
| Safety | ✅ Blocked dangerous commands | ❌ No protection |
| Autonomy | ✅ High (minimal prompts) | ✅ Complete |
| Audit Trail | ✅ Ask for risky ops | ❌ None |
| Team Sharing | ✅ Committed to repo | ❌ Per-session |
| Env Security | ✅ .env files protected | ❌ Exposed |

## Best Practices Encoded

The CLAUDE.md enforces:

1. **Conventional Commits**: `type(scope): description`
2. **Verification Before Commit**: lint → build → test → commit
3. **Incremental Changes**: Small, focused modifications
4. **Pattern Following**: Match existing codebase style
5. **Documentation**: JSDoc for public APIs
6. **Self-Correction**: Fix failures autonomously

---

This setup has been optimized based on Anthropic's official best practices and community experience with Claude Code.