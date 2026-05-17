# Screen Redesign Routine

## Purpose

Every remaining Phase 4 screen must be redesigned and verified using the same process that worked for Dashboard.

## Routine

1. Audit current screen
   - file size
   - mixed responsibilities
   - existing data hooks
   - navigation contracts
   - modals/sheets
   - empty/loading/error states
   - keyboard/safe-area risks

2. Refactor if needed
   - extract presentational components
   - keep route as orchestrator
   - preserve data contracts
   - do not change business logic during extraction

3. Premium redesign
   - apply current design system tokens
   - use Dashboard quality as benchmark
   - improve visual hierarchy
   - design for light and dark mode
   - keep primary action obvious

4. Screenshot audit
   - review screenshot manually
   - identify hierarchy, spacing, contrast, density, and CTA issues
   - create a polish prompt from screenshot findings

5. Polish pass
   - fix screenshot issues
   - fix interaction issues
   - fix validation / keyboard / safe area issues

6. Verification
   - npm run lint
   - happy path
   - empty state
   - loading state
   - error state
   - dark mode
   - Android nav/keyboard
   - navigation return path
   - no broken modal contracts

7. Closeout
   - update docs/flows for the screen
   - update docs/STATUS.md
   - only mark done after screenshot audit and verification

## Rules

- Do not mark any screen `✅ Done` after first implementation.
- Use sub-tasks: audit/refactor, redesign, screenshot polish.
- Keep Customer / Entry / Payment nouns.
- Preserve DB/RPC/offline queue unless the task explicitly targets data.
