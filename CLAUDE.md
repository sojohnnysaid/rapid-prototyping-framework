# CLAUDE.md - NSF GRFP Rapid Prototyping Framework

## Build & Development Commands
- Dev server: `npm run dev` (http://localhost:5173)
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: *Not yet configured* (Future: `npm run lint`, `npm run lint:fix`)
- Test: *Not yet configured* (Future: `npm run test`, `npm run test:unit src/path/to/test.js`)
- Create entity: `npm run create-entity <command> <name>`
  - Example: `npm run create-entity story ReviewerRanking`
  - Example: `npm run create-entity businessrule EligibilityCheck`

## Code Style Guidelines
- **Structure**: Functional components with hooks; component composition over inheritance
- **State**: React Context API for global state; useState/useEffect locally
- **Error Handling**: Try/catch with specific error messages; component error boundaries
- **Typing**: PropTypes for component props (TypeScript migration planned)
- **Naming**: 
  - camelCase: variables, functions, instances
  - PascalCase: components, classes, types
  - kebab-case: files, directories
- **Imports**: Ordered as: React/libraries → components → utils/hooks → styles
- **Formatting**: 2-space indent; single quotes; semicolons; max 80 chars per line
- **Component Props**: Document purpose; provide defaults when sensible; validate with PropTypes

## Project Architecture
- **Routing**: React Router v6+ with routes in `src/router/` and `App.jsx`
- **Components**: Reusable UI in `src/components/`; pages in `src/stories/*Page.jsx`
- **Business Logic**: Story-driven structure in `src/stories/`
- **API Mocking**: MSW with handlers in `src/mocks/`
- **State**: ProcessStepContext for workflow state; UserContext for authentication
- **Styling**: Sakura CSS with component-specific inline styling
- **Patterns**: StoryGuide pattern for multi-step processes; useScrollPreservation and useTransitions hooks

Always update routes and navigation after creating new stories. Follow existing patterns when creating components.