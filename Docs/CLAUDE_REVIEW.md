Review the code and provide actionable feedback:

1. **Identify what to review**
   - If a file path is provided, review that file
   - If no path, review recent changes with `git diff`
   - If "pr" is specified, review the current PR

2. **Review checklist**

   **Code Quality**
   - [ ] Code follows existing patterns in the codebase
   - [ ] No unnecessary complexity
   - [ ] No code duplication
   - [ ] Clear naming (variables, functions, components)
   - [ ] Appropriate comments for complex logic

   **TypeScript**
   - [ ] Proper types (no unnecessary `any`)
   - [ ] Interfaces for object shapes
   - [ ] Type exports alongside implementations
   - [ ] Discriminated unions where appropriate

   **React (if applicable)**
   - [ ] Functional components only
   - [ ] Hooks follow rules of hooks
   - [ ] No unnecessary re-renders
   - [ ] Proper dependency arrays
   - [ ] Keys for list items

   **Security**
   - [ ] No hardcoded secrets
   - [ ] Input validation where needed
   - [ ] No sensitive data in logs
   - [ ] Proper error handling

   **Performance**
   - [ ] No obvious performance issues
   - [ ] Appropriate memoization
   - [ ] No unnecessary computations

3. **Provide structured feedback**
   - 🔴 **Critical**: Must fix before merge
   - 🟡 **Suggestion**: Consider improving
   - 🟢 **Praise**: Good practices observed

4. **Offer fixes**
   - For each issue, suggest a specific fix
   - Offer to implement fixes if requested

Target for review: $ARGUMENTS