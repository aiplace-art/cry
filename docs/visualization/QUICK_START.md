# ⚡ Agent Graph Visualization - Quick Start

Get up and running in 5 minutes!

## 🚀 Step 1: Install (30 seconds)

```bash
cd /Users/ai.place/Crypto
npm install reactflow framer-motion
```

## 📝 Step 2: Copy Code (1 minute)

Create `src/App.jsx`:

```jsx
import React from 'react';
import { AgentGraph } from './components/visualization';
import 'reactflow/dist/style.css';

const nodes = [
  {
    id: '1',
    type: 'coordinator',
    position: { x: 400, y: 100 },
    data: { label: 'OMEGA', status: 'active', agentCount: 3 },
  },
  {
    id: '2',
    type: 'worker',
    position: { x: 200, y: 300 },
    data: { label: 'Researcher', status: 'working', load: 75 },
  },
  {
    id: '3',
    type: 'worker',
    position: { x: 600, y: 300 },
    data: { label: 'Coder', status: 'active', load: 50 },
  },
];

const edges = [
  { id: 'e1', source: '1', target: '2', animated: true },
  { id: 'e2', source: '1', target: '3', animated: true },
];

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AgentGraph initialNodes={nodes} initialEdges={edges} />
    </div>
  );
}
```

## ▶️ Step 3: Run (10 seconds)

```bash
npm start
```

Open http://localhost:3000

## 🎉 Done!

You should see:
- ✅ OMEGA coordinator node at the top
- ✅ Two worker agents below
- ✅ Animated connections between them
- ✅ Pulsating effects on active nodes

## 🎯 Next Steps

### Add More Nodes

```jsx
const addWorkerAgent = () => {
  // Code to add new node dynamically
};
```

### Real-time Updates

```jsx
useEffect(() => {
  // Update node statuses every second
}, []);
```

### Custom Styling

```css
.custom-node {
  /* Your styles */
}
```

## 📚 Learn More

- [Full Documentation](./AGENT_GRAPH_USAGE.md)
- [Examples](./DEMO_EXAMPLES.md)
- [Installation Guide](./INSTALLATION.md)

## 🐛 Issues?

Common fixes:

```bash
# Missing reactflow
npm install reactflow

# Missing styles
import 'reactflow/dist/style.css';

# Component not found
ls src/components/visualization/
```

---

**Ready to build? Start coding! 🚀**
