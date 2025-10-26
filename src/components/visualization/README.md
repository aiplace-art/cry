# 🎨 Agent Graph Visualization System

Advanced interactive AI agent visualization system with real-time updates, animations, and comprehensive monitoring capabilities.

## ✨ Features

### 🎯 Interactive Graph
- **Drag & Drop**: Freely position nodes
- **Zoom & Pan**: Smooth navigation controls
- **Real-time Updates**: Dynamic node and edge updates
- **Auto Layout**: Automatic graph arrangement algorithms

### 🎨 Visual Effects
- **Node Pulsation**: Active agents pulse with animated glow
- **Animated Edges**: Data flow visualization with particles
- **Particle System**: Canvas-based particle effects for data transmission
- **Status Colors**: Dynamic color coding based on agent status
  - `#00E5FF` - Active (cyan)
  - `#00AAFF` - Working (blue)
  - `#666666` - Idle (gray)
  - `#00FF88` - Success (green)
  - `#FF4444` - Error (red)

### 🤖 Node Types

| Type | Icon | Description | Use Case |
|------|------|-------------|----------|
| **Coordinator** | 👑 | Central orchestrator | OMEGA, Master coordinator |
| **Worker** | 🤖 | Individual agents | Research, Coder, Tester |
| **Task** | 📋 | Task execution | SPARC phases, Jobs |
| **Data Flow** | 📊 | Data processing | Pipelines, Streams |

### 📊 Monitoring & Metrics
- Real-time status indicators
- Performance metrics display
- Agent load monitoring
- Task progress tracking
- Interactive detail panels

## 📦 Installation

```bash
# Install dependencies
npm install react react-dom reactflow framer-motion

# Or with yarn
yarn add react react-dom reactflow framer-motion
```

## 🚀 Quick Start

### Basic Example

```jsx
import { AgentGraph } from './components/visualization';

const nodes = [
  {
    id: 'coordinator-1',
    type: 'coordinator',
    position: { x: 400, y: 200 },
    data: {
      label: 'OMEGA Coordinator',
      status: 'active',
      agentCount: 5,
      taskCount: 12,
    },
  },
  {
    id: 'worker-1',
    type: 'worker',
    position: { x: 200, y: 400 },
    data: {
      label: 'Research Agent',
      status: 'working',
      load: 75,
      capability: 'researcher',
    },
  },
];

const edges = [
  {
    id: 'e1-2',
    source: 'coordinator-1',
    target: 'worker-1',
    type: 'animated',
    animated: true,
  },
];

function App() {
  return (
    <AgentGraph
      initialNodes={nodes}
      initialEdges={edges}
      enableAnimations={true}
      enableParticles={true}
    />
  );
}
```

## 📚 Documentation

- **[Usage Guide](../../docs/visualization/AGENT_GRAPH_USAGE.md)** - Complete API reference and usage patterns
- **[Demo Examples](../../docs/visualization/DEMO_EXAMPLES.md)** - Interactive examples and code samples
- **[Demo Page](./demo.html)** - Live interactive demo

## 🎯 Use Cases

### 1. AI Agent Swarm Monitoring
Visualize multi-agent systems with real-time status updates and task coordination.

### 2. SPARC Workflow Visualization
Track SPARC methodology phases (Specification → Pseudocode → Architecture → Refinement → Completion).

### 3. Data Pipeline Monitoring
Monitor data flow through processing stages with throughput metrics.

### 4. Development Team Coordination
Visualize full-stack development teams with multiple specialized agents.

## 🎨 Components

### Core Components

| Component | Description | File |
|-----------|-------------|------|
| `AgentGraph` | Main graph component | `AgentGraph.jsx` |
| `NodeRenderer` | Custom node types | `NodeRenderer.jsx` |
| `EdgeRenderer` | Custom edge types | `EdgeRenderer.jsx` |
| `GraphControls` | Interactive controls | `GraphControls.jsx` |
| `GraphAnimations` | Particle effects | `GraphAnimations.jsx` |

### Component Structure

```
src/components/visualization/
├── AgentGraph.jsx          # Main graph component
├── NodeRenderer.jsx        # Node type definitions
├── EdgeRenderer.jsx        # Edge type definitions
├── GraphControls.jsx       # Control panel
├── GraphAnimations.jsx     # Animation system
├── AgentGraph.css          # Styles
├── index.js                # Exports
├── demo.html               # Demo page
└── README.md               # This file
```

## 🛠️ API Reference

### AgentGraph Props

```typescript
interface AgentGraphProps {
  initialNodes?: Node[];          // Initial nodes configuration
  initialEdges?: Edge[];          // Initial edges configuration
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
  enableAnimations?: boolean;     // Default: true
  enableParticles?: boolean;      // Default: true
  autoLayout?: boolean;           // Default: true
}
```

### Node Configuration

```typescript
interface Node {
  id: string;
  type: 'coordinator' | 'worker' | 'task' | 'dataFlow';
  position: { x: number; y: number };
  data: {
    label: string;
    status: 'active' | 'idle' | 'working' | 'success' | 'error';
    // Type-specific properties
    agentCount?: number;      // Coordinator
    taskCount?: number;       // Coordinator
    load?: number;            // Worker (0-100)
    capability?: string;      // Worker
    progress?: number;        // Task (0-100)
    assignedTo?: string;      // Task
    throughput?: string;      // Data Flow
    dataSize?: string;        // Data Flow
    dataType?: string;        // Data Flow
  };
}
```

### Edge Configuration

```typescript
interface Edge {
  id: string;
  source: string;              // Source node ID
  target: string;              // Target node ID
  type?: 'animated' | 'data' | 'gradient' | 'pulse';
  animated?: boolean;
  data?: {
    label?: string;
    color?: string;
    active?: boolean;
    bandwidth?: number;
    metrics?: {
      bandwidth: string;
      latency: string;
      packets: string;
    };
  };
}
```

## 🎬 Examples

### Adding Nodes Dynamically

```jsx
const graphRef = useRef();

const addWorkerAgent = () => {
  graphRef.current?.addNode({
    type: 'worker',
    label: 'New Worker',
    status: 'idle',
    data: {
      capability: 'coder',
      load: 0,
    },
  });
};
```

### Real-time Status Updates

```jsx
const updateAgentStatus = (nodeId, status) => {
  graphRef.current?.updateNodeStatus(nodeId, status);
};

// Example: Update agent status every second
useEffect(() => {
  const interval = setInterval(() => {
    updateAgentStatus('worker-1', 'active');
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### Filtering Nodes

```jsx
// Filter by type
<GraphControls onFilterChange={(filter) => {
  graphRef.current?.filterNodes(filter);
}} />

// Available filters:
// 'all', 'coordinator', 'worker', 'task', 'dataFlow'
// 'active', 'working', 'idle', 'success', 'error'
```

## 🎨 Customization

### Custom Styles

Override CSS classes in your stylesheet:

```css
.custom-node {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
}

.custom-node.coordinator-node {
  box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
}
```

### Custom Node Types

```jsx
import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = memo(({ data }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

// Register custom node type
const nodeTypes = {
  custom: CustomNode,
  ...defaultNodeTypes,
};

<AgentGraph nodeTypes={nodeTypes} />
```

## 🔧 Configuration

### Layout Algorithms

```jsx
<AgentGraph
  autoLayout={true}
  layoutAlgorithm="circular" // circular, hierarchical, force, grid
/>
```

### Performance Optimization

For large graphs (100+ nodes):

```jsx
<AgentGraph
  enableAnimations={false}    // Disable animations
  enableParticles={false}     // Disable particle effects
  autoLayout={false}          // Manual positioning
/>
```

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# Run demo
npm run demo
```

## 📈 Performance

- Optimized for 100+ nodes
- Canvas-based particle system for smooth animations
- RequestAnimationFrame for 60 FPS animations
- Memoized components to prevent unnecessary re-renders

## 🤝 Integration

### With Claude Flow

```jsx
import { useEffect, useState } from 'react';
import { AgentGraph } from './components/visualization';

function ClaudeFlowDashboard() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Connect to Claude Flow MCP
    const ws = new WebSocket('ws://localhost:3000/claude-flow');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'agent_spawned') {
        setNodes(prev => [...prev, {
          id: data.agentId,
          type: 'worker',
          data: { label: data.name, status: 'active' },
        }]);
      }
    };

    return () => ws.close();
  }, []);

  return <AgentGraph initialNodes={nodes} />;
}
```

### With SPARC Workflow

```jsx
function SPARCVisualization() {
  const sparcPhases = ['spec', 'pseudo', 'arch', 'refine', 'complete'];

  const nodes = sparcPhases.map((phase, i) => ({
    id: phase,
    type: 'task',
    position: { x: i * 200, y: 200 },
    data: {
      label: phase.charAt(0).toUpperCase() + phase.slice(1),
      status: i < 2 ? 'success' : i === 2 ? 'working' : 'idle',
      progress: i < 2 ? 100 : i === 2 ? 65 : 0,
    },
  }));

  return <AgentGraph initialNodes={nodes} />;
}
```

## 🐛 Troubleshooting

### React Flow not rendering

Make sure to import the CSS:

```jsx
import 'reactflow/dist/style.css';
```

### Animations not working

Ensure Framer Motion is installed:

```bash
npm install framer-motion
```

### Nodes overlapping

Enable auto-layout:

```jsx
<AgentGraph autoLayout={true} />
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please see contribution guidelines.

## 📞 Support

- **Documentation**: `/docs/visualization/`
- **Examples**: `/docs/visualization/DEMO_EXAMPLES.md`
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## 🎓 Credits

Built with:
- [React Flow](https://reactflow.dev/) - Graph visualization
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [React](https://react.dev/) - UI framework

---

**Made with ⚡ by HYPEAI**
