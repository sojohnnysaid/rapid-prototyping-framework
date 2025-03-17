# Rapid Prototyping Framework

A lightweight, story-driven framework for rapidly prototyping business processes and user interfaces with multi-actor workflows.

## 🌟 Overview

This framework enables designers and developers to quickly build functional prototypes that demonstrate end-to-end business processes. It focuses on:

- **Story-driven development**: Define processes as a series of intuitive steps
- **Rapid UI prototyping**: Quickly create interfaces with minimal boilerplate
- **Mock API integration**: Simulate backend services without real infrastructure
- **Multi-actor workflows**: Model complex interactions between different user roles

## 📋 Core Features

- **Guided workflows**: Step-by-step process guides with progress tracking
- **Role-based access**: Simulated authentication and authorization
- **Mock data services**: In-memory data models with MSW (Mock Service Worker)
- **Responsive UI**: Clean, accessible interfaces built with React
- **Scaffolding CLI**: Command-line tools to generate new components

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- npm (v6+)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/rapid-prototyping-framework.git
cd rapid-prototyping-framework

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to see the application running.

### Deployment to Netlify

You can deploy this application to Netlify using one of the following methods:

#### Option 1: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify as a draft (generates a preview URL)
netlify deploy

# Once you're satisfied, deploy to production
netlify deploy --prod
```

#### Option 2: Netlify Drag and Drop

1. Run `npm run build` to build the project
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `dist` folder to deploy

#### Option 3: Connect to GitHub

1. Push your code to a GitHub repository
2. Sign in to Netlify
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

## 📚 Framework Concepts

### Stories

A "story" in this framework represents a complete business process or user journey. Each story:

- Defines a sequence of steps in a business process
- Has corresponding UI components for each step
- Provides a guided experience for users

### Components

The framework includes several specialized components:

- **StoryGuide**: Displays the process steps and tracks progress
- **StepSection**: Highlights the current step in the process
- **Table**: Displays data with sorting and selection capabilities
- **Modal**: Shows contextual information or actions
- **Form**: Handles user input with validation

### Mock Services

The framework uses MSW to intercept API requests and provide mock responses:

- Define data models in `src/mocks/db.js`
- Create API handlers in `src/mocks/handlers.js`
- Simulate network latency and error conditions

## 🛠️ Creating Your Own Story

### 1. Generate the Boilerplate

Use the included CLI tool to scaffold a new story:

```bash
npm run create-entity story YourProcessName
```

This creates:
- `src/stories/your-process-name/your-process-name.story.js`: Story definition
- `src/stories/your-process-name/YourProcessNamePage.jsx`: UI component

### 2. Define the Story Steps

Edit the generated story file:

```javascript
// src/stories/your-process-name/your-process-name.story.js
export const YourProcessNameStory = {
  title: 'Your Process Title',
  steps: [
    'Step 1: First action description',
    'Step 2: Second action description',
    'Step 3: Third action description',
    'Step 4: Final action description'
  ]
};
```

### 3. Implement the UI Components

Edit the page component to implement each step:

```jsx
// In YourProcessNamePage.jsx
import React, { useState, useContext } from 'react';
import { ProcessStepContext } from '../../context/ProcessStepContext';
import StepSection, { StepHeader } from '../../components/StepSection';
import { YourProcessNameStory } from './your-process-name.story';

export default function YourProcessNamePage() {
  const { currentStep, setCurrentStep } = useContext(ProcessStepContext);
  
  // Implement your step logic here
  
  return (
    <div>
      <h2>Your Process Title</h2>
      
      {/* Step 1 */}
      <StepSection stepNumber={0}>
        <StepHeader stepNumber={1} title={YourProcessNameStory.steps[0]} />
        {/* Step 1 content */}
      </StepSection>
      
      {/* Additional steps */}
    </div>
  );
}
```

### 4. Add Routes and Navigation

Update the router configuration in `src/App.jsx`:

```jsx
// In App.jsx
<Route path="/your-process-name" element={<YourProcessNamePage />} />
```

Update the sidebar navigation in `src/components/Sidebar.jsx`.

### 5. Create Mock Data (Optional)

If your story needs backend data, create a business rule:

```bash
npm run create-entity businessrule YourDataModel
```

## 🧪 Best Practices

1. **Progressive Disclosure**: Show only the relevant steps to users
2. **Visual Feedback**: Provide clear indications of state changes
3. **Error Handling**: Gracefully handle edge cases and errors
4. **Role Consistency**: Maintain consistent experiences across user roles
5. **Modular Components**: Build reusable components for common patterns

## 🧩 Project Structure

```
rapid-prototyping-framework/
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── mocks/             # Mock API services
│   ├── stories/           # Business process implementations
│   │   ├── auth/          # Authentication flows
│   │   ├── change-request/# Change request process
│   │   └── ...            # Other processes
│   ├── router/            # Application routing
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
└── package.json           # Project dependencies
```

## 🔍 Example Stories

The framework includes several example stories:

1. **Change Request Process**: Submit and approve change requests
2. **Reviewer Assignment**: Match reviewers to applications based on expertise
3. **Multi-Actor Approval**: Coordinate approval workflows across roles

Explore these examples to understand how to implement your own stories.

## 📞 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.