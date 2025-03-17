#!/usr/bin/env node

/**
 * CLI for rapid prototyping.
 *
 * Commands:
 *   story <Name>         : Creates a new story (UI page + story definition) under src/stories.
 *   businessrule <Name>  : Creates a new business rule (model and API handler) in the mocks.
 */

const fs = require('fs')
const path = require('path')

// Utility: Convert to kebab-case (e.g., "EligibilityCheck" -> "eligibility-check")
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log("Usage: node create-entity.js <command> <Name>")
  console.log("Commands:")
  console.log("  story         - Create a new story (UI page + story definition)")
  console.log("  businessrule  - Create a new business rule (model + API handler)")
  process.exit(1)
}

const command = args[0]
const name = args[1]

// Paths relative to the CLI file (located in src/cli/)
const rootDir = path.join(__dirname, '..')
const storiesDir = path.join(rootDir, 'stories')
const mocksDir = path.join(rootDir, 'mocks')

switch (command) {
  case 'story': {
    // Create a new story: new folder in src/stories/<kebab-case-name>
    const storyFolder = toKebabCase(name)
    const storyDir = path.join(storiesDir, storyFolder)
    if (fs.existsSync(storyDir)) {
      console.error(`Error: Story folder already exists: ${storyDir}`)
      process.exit(1)
    }
    fs.mkdirSync(storyDir, { recursive: true })

    // Create the page component file: <Name>Page.jsx
    const pageFile = path.join(storyDir, `${name}Page.jsx`)
    const pageContent = `import React from 'react'
import StoryGuide from '../../components/StoryGuide'
import { ${name}Story } from './${storyFolder}.story'

export default function ${name}Page() {
  return (
    <div>
      <h2>${name} Page</h2>
      <StoryGuide story={${name}Story} />
      {/* TODO: Implement the UI for ${name} */}
    </div>
  )
}
`
    fs.writeFileSync(pageFile, pageContent, 'utf8')

    // Create the story definition file: <kebab-case-name>.story.js
    const storyDefFile = path.join(storyDir, `${storyFolder}.story.js`)
    const storyDefContent = `export const ${name}Story = {
  title: '${name}',
  steps: [
    'Step 1: Describe the first step for ${name}.',
    'Step 2: Describe the next step for ${name}.',
    // Add additional steps as needed.
  ]
}
`
    fs.writeFileSync(storyDefFile, storyDefContent, 'utf8')

    console.log(`✅ Story "${name}" created successfully in folder: ${storyDir}`)
    break
  }
  case 'businessrule': {
    // Create a new business rule by appending a model and API handler.
    // Update the mock data file: src/mocks/db.js
    const dbFile = path.join(mocksDir, 'db.js')
    if (!fs.existsSync(dbFile)) {
      console.error(`Error: ${dbFile} does not exist.`)
      process.exit(1)
    }

    // Append a new model definition to db.js.
    const modelName = toKebabCase(name)
    const modelTemplate = `

/* Business Rule Model: ${name} */
export const ${modelName} = db.factory({
  ${modelName}: {
    id: primaryKey(Number),
    description: String,
    status: String // e.g., "Pending", "Approved", "Rejected"
  }
})

// Seed sample data for ${name}
db.${modelName}.create({ id: Date.now(), description: "Sample ${name} rule", status: "Pending" })
`
    fs.appendFileSync(dbFile, modelTemplate, 'utf8')
    console.log(`✅ Model for business rule "${name}" appended to ${dbFile}`)

    // Update the mock handlers file: src/mocks/handlers.js
    const handlersFile = path.join(mocksDir, 'handlers.js')
    if (!fs.existsSync(handlersFile)) {
      console.error(`Error: ${handlersFile} does not exist.`)
      process.exit(1)
    }
    const handlerTemplate = `

/* API Handlers for Business Rule: ${name} */
...db.${modelName}.toHandlers('rest', '/api'),
`
    fs.appendFileSync(handlersFile, handlerTemplate, 'utf8')
    console.log(`✅ API handlers for business rule "${name}" appended to ${handlersFile}`)

    break
  }
  default:
    console.error("Unknown command. Use 'story' or 'businessrule'.")
    process.exit(1)
}