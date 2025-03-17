# Rapid Prototyping CLI Tools

This directory contains command-line tools to help you quickly create new components for the rapid prototyping framework.

## Available Commands

### 1. Create Entity (`create-entity.js`)

A utility to generate boilerplate code for new business processes and rules.

#### Creating a New Story (User Interface Process)

```bash
npm run create-entity -- story MyProcessName
```

This command:
- Creates a directory `src/stories/my-process-name/`
- Generates a component file `MyProcessNamePage.jsx`
- Generates a story definition file `my-process-name.story.js`

After creating a story, you need to:
1. Add a route in `src/App.jsx` or your router file
2. Add a link in the Sidebar component
3. Implement the business process UI

#### Creating a New Business Rule

```bash
npm run create-entity -- businessrule MyRuleName
```

This command:
- Adds a model definition to `src/mocks/db.js`
- Adds API handlers to `src/mocks/handlers.js`
- Creates sample data for testing

## Examples

### Example: Creating an Eligibility Screening Process

```bash
# Create the story and UI components
npm run create-entity -- story EligibilityScreening

# Create related business rules
npm run create-entity -- businessrule EligibilityCheck
```

### Example: Creating a Reviewer Assignment Process

```bash
# Create the story and UI components
npm run create-entity -- story ReviewerAssignment

# Create related business rules
npm run create-entity -- businessrule ReviewerMatching
```

## Best Practices

1. **Naming Convention**: Use PascalCase for entity names in commands
2. **Process Steps**: Keep story steps clear and concise
3. **Integration**: Always update routes and navigation after creating new stories
4. **Context**: Use the ProcessStepContext to track user progress
5. **API Design**: Design mock APIs to mimic real-world endpoints

## Next Steps for Improvement

- Add command to generate tests for stories
- Add command to create mock data with relationships
- Add scaffolding for different UI patterns (wizard, dashboard, etc.)