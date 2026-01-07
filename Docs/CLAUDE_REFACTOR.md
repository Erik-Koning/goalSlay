Refactor the specified code following safe refactoring practices:

1. **Understand what needs refactoring**
   - Read the target file(s) thoroughly
   - Identify what improvements are needed
   - Think hard about the refactoring strategy

2. **Ensure tests exist**
   - Check for existing tests covering this code
   - If no tests exist, consider adding them first
   - Tests are your safety net for refactoring

3. **Verify current state**
   - Run `pnpm lint` to establish baseline
   - Run `pnpm build` to ensure everything compiles
   - Run any relevant tests to confirm they pass

4. **Plan the refactoring**
   - Break down into small, safe steps
   - Each step should keep the code working
   - Avoid changing behavior, only structure

5. **Refactor incrementally**
   - Make one small change at a time
   - Verify after each change with lint/build
   - Commit frequently with descriptive messages

6. **Common refactoring patterns**
   - Extract functions/components for reusability
   - Rename for clarity
   - Remove duplication
   - Simplify complex conditionals
   - Improve type definitions

7. **Final verification**
   - Run full test suite if available
   - Run `pnpm lint && pnpm build`
   - Review the diff to ensure no accidental behavior changes

8. **Commit the refactoring**
   - Use commit message: `refactor(scope): description`
   - Include what was improved and why

Target for refactoring: $ARGUMENTS