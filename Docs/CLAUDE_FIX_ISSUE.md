Fix the GitHub issue following this structured workflow:

Get issue details

bash   gh issue view $ARGUMENTS

Analyze the problem

Understand what the issue is describing
Identify the root cause
Search the codebase for relevant files


Research the codebase

Read the files mentioned in or related to the issue
Understand the current implementation
Think hard about the best fix


Implement the fix

Make targeted changes to resolve the issue
Follow existing code patterns
Add or update tests if applicable


Verify the fix

Run pnpm lint to check for linting issues
Run pnpm build to ensure compilation succeeds
Test the specific functionality that was broken


Create a focused commit

Stage only the relevant changes
Write a commit message: fix(scope): description (fixes #$ARGUMENTS)


Push and create PR (if requested)

Push the branch
Create a PR with a clear description linking to the issue



Issue number: $ARGUMENTS