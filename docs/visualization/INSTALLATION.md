# 🚀 Agent Graph Visualization - Installation Guide

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0 or yarn >= 1.22.0
- React >= 18.0.0

## Quick Install

### 1. Install Dependencies

```bash
cd /Users/ai.place/Crypto

# Install React Flow and Framer Motion
npm install reactflow@11.10.3 framer-motion@10.16.16

# Or with yarn
yarn add reactflow@11.10.3 framer-motion@10.16.16
```

### 2. Verify Installation

```bash
# Check if packages are installed
npm list reactflow framer-motion

# Expected output:
# ├── reactflow@11.10.3
# └── framer-motion@10.16.16
```

### 3. Import Components

```jsx
// In your React application
import { AgentGraph } from './src/components/visualization';
import 'reactflow/dist/style.css';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <AgentGraph />
    </div>
  );
}
```

## Installation Steps (Detailed)

### Step 1: Project Setup

If you don't have a React project yet:

```bash
# Create new React app
npx create-react-app my-agent-dashboard
cd my-agent-dashboard

# Copy visualization components
cp -r /Users/ai.place/Crypto/src/components/visualization ./src/components/
```

### Step 2: Install Required Packages

```bash
# Core dependencies
npm install react@18.2.0 react-dom@18.2.0

# Visualization libraries
npm install reactflow@11.10.3
npm install framer-motion@10.16.16

# Optional: TypeScript support
npm install --save-dev @types/react @types/react-dom
```

### Step 3: Copy Component Files

```bash
# From the project root
mkdir -p src/components/visualization

# Copy all visualization files
cp /Users/ai.place/Crypto/src/components/visualization/* src/components/visualization/

# Verify files
ls -la src/components/visualization/
```

### Step 4: Import Styles

Add to your `src/index.js` or `src/App.js`:

```jsx
import 'reactflow/dist/style.css';
import './components/visualization/AgentGraph.css';
```

## Usage Examples

### Example 1: Basic Setup

```jsx
// src/App.js
import React from 'react';
import { AgentGraph } from './components/visualization';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'coordinator',
    position: { x: 400, y: 100 },
    data: {
      label: 'OMEGA Coordinator',
      status: 'active',
      agentCount: 3,
    },
  },
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AgentGraph initialNodes={initialNodes} />
    </div>
  );
}

export default App;
```

### Example 2: With State Management

```jsx
import React, { useState } from 'react';
import { AgentGraph } from './components/visualization';

function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
  };

  return (
    <AgentGraph
      initialNodes={nodes}
      initialEdges={edges}
      onNodeClick={handleNodeClick}
      enableAnimations={true}
      enableParticles={true}
    />
  );
}

export default Dashboard;
```

## Verification

### Test the Installation

Create a test file: `src/test-visualization.jsx`

```jsx
import React from 'react';
import { AgentGraph } from './components/visualization';
import 'reactflow/dist/style.css';

const testNodes = [
  {
    id: 'test-1',
    type: 'coordinator',
    position: { x: 250, y: 100 },
    data: {
      label: 'Test Coordinator',
      status: 'active',
      agentCount: 2,
    },
  },
  {
    id: 'test-2',
    type: 'worker',
    position: { x: 100, y: 250 },
    data: {
      label: 'Test Worker',
      status: 'working',
      load: 50,
    },
  },
];

const testEdges = [
  {
    id: 'e1',
    source: 'test-1',
    target: 'test-2',
    animated: true,
  },
];

export default function TestVisualization() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <AgentGraph
        initialNodes={testNodes}
        initialEdges={testEdges}
        enableAnimations={true}
      />
    </div>
  );
}
```

Run the test:

```bash
npm start
# Navigate to the test component
```

## Troubleshooting

### Error: Cannot find module 'reactflow'

**Solution:**
```bash
npm install reactflow@11.10.3
```

### Error: Cannot find module 'framer-motion'

**Solution:**
```bash
npm install framer-motion@10.16.16
```

### Error: React Flow styles not applied

**Solution:** Make sure to import the CSS:
```jsx
import 'reactflow/dist/style.css';
```

### Error: Module not found: Can't resolve './components/visualization'

**Solution:** Verify file paths:
```bash
ls -la src/components/visualization/
```

### Canvas rendering issues

**Solution:** Ensure proper height is set:
```jsx
<div style={{ height: '100vh' }}>
  <AgentGraph />
</div>
```

## Next Steps

1. ✅ Installation complete
2. 📖 Read the [Usage Guide](./AGENT_GRAPH_USAGE.md)
3. 🎨 Check [Demo Examples](./DEMO_EXAMPLES.md)
4. 🚀 Build your dashboard

## Development Server

### Run Demo

```bash
cd src/components/visualization
npx serve .
# Open http://localhost:3000/demo.html
```

### Watch Mode

```bash
# If using webpack
npm start

# If using vite
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Optimize bundle size
npm run build --production
```

## Advanced Configuration

### Custom Build Setup

Create `webpack.config.js`:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
```

### Environment Variables

Create `.env`:

```bash
REACT_APP_ENABLE_ANIMATIONS=true
REACT_APP_ENABLE_PARTICLES=true
REACT_APP_AUTO_LAYOUT=true
```

Use in code:

```jsx
<AgentGraph
  enableAnimations={process.env.REACT_APP_ENABLE_ANIMATIONS === 'true'}
  enableParticles={process.env.REACT_APP_ENABLE_PARTICLES === 'true'}
  autoLayout={process.env.REACT_APP_AUTO_LAYOUT === 'true'}
/>
```

## Integration with Existing Projects

### With Create React App

```bash
cd your-cra-project
npm install reactflow framer-motion
cp -r /path/to/visualization/components ./src/components/
```

### With Next.js

```bash
cd your-nextjs-project
npm install reactflow framer-motion

# Create dynamic import (client-side only)
# pages/dashboard.js
import dynamic from 'next/dynamic';

const AgentGraph = dynamic(
  () => import('../components/visualization/AgentGraph'),
  { ssr: false }
);
```

### With Vite

```bash
cd your-vite-project
npm install reactflow framer-motion
cp -r /path/to/visualization/components ./src/components/
```

### With TypeScript

```bash
npm install --save-dev @types/react @types/react-dom

# Create types file: src/types/visualization.d.ts
declare module './components/visualization' {
  export const AgentGraph: React.FC<any>;
  export const NodeRenderer: any;
  export const EdgeRenderer: any;
}
```

## Docker Setup

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_ENABLE_ANIMATIONS=true
      - REACT_APP_ENABLE_PARTICLES=true
    volumes:
      - ./src:/app/src
```

Run with Docker:

```bash
docker-compose up -d
```

## Performance Optimization

### Code Splitting

```jsx
import React, { lazy, Suspense } from 'react';

const AgentGraph = lazy(() => import('./components/visualization/AgentGraph'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentGraph />
    </Suspense>
  );
}
```

### Bundle Analysis

```bash
npm install --save-dev webpack-bundle-analyzer

# Add to webpack config
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};

npm run build
```

## Support

For installation issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/your-repo/issues)
3. Read [Documentation](./AGENT_GRAPH_USAGE.md)

## Resources

- **React Flow Docs**: https://reactflow.dev/
- **Framer Motion Docs**: https://www.framer.com/motion/
- **React Docs**: https://react.dev/

---

**Installation complete! 🎉 Start building your AI agent dashboard.**
