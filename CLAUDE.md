# CLAUDE.md - Rapid Prototyping Framework

## Build & Development Commands
- **Start Dev**: `npm run dev` (http://localhost:5173)
- **Build**: `npm run build` 
- **Preview**: `npm run preview`
- **Create Entity**: `npm run create-entity <type> <name>`
  - Story: `npm run create-entity story ReviewerRanking`
  - Business Rule: `npm run create-entity businessrule EligibilityCheck`
- **Testing**: No test configuration yet (placeholder in package.json)
  - When implemented: `npm run test` (all tests), `npm run test:unit <path>` (single test)
- **Lint/Format**: Not configured yet - consider adding ESLint/Prettier

## Code Style Guidelines
- **React Patterns**: Functional components with hooks; composition over inheritance
- **State Management**: React Context (global), useState/useEffect (local)
- **TypeScript**: Not currently used, but preferred for new features if added
- **Formatting**: 2-space indent; single quotes; semicolons; 80-char line limit
- **Naming**: camelCase (variables/functions); PascalCase (components/types); kebab-case (files)
- **Imports**: Order: React/libraries → components → utils/hooks → styles
- **Error Handling**: Try/catch with specific messages; component error boundaries
- **JSX**: One component per file; destructure props; conditional rendering

## Project Structure
- **Routing**: React Router v6+ in `src/router/routes.jsx`
- **Stories**: Feature organization in `src/stories/` (main UI flows)
- **Components**: Reusable UI in `src/components/`
- **API Mocking**: MSW with handlers in `src/mocks/`
- **Context**: ProcessStepContext (workflow), UserContext (auth)

## Step Flow Framework
- **Step Management**: `useProcessSteps()` hook accesses global step state
- **Step Triggers**: Steps only become actionable when their triggers are activated
- **Trigger Components**:
  - `<ActionableTrigger stepNumber={n}>`: Wraps clickable elements (buttons, links)
  - `<Form stepTrigger={n}>`: Links form submission/validation to step activation
- **Validation**: Steps can require validation before becoming actionable
- **Visual Indicators**: StoryGuide shows trigger status and step readiness

Always follow existing patterns and update routes when creating new stories.