# Agent Graph Visualization System - Usage Guide

## Overview

Advanced interactive AI agent visualization system with real-time updates, animations, and comprehensive monitoring capabilities.

## Features

✨ **Interactive Graph**
- Drag & drop nodes
- Zoom & pan controls
- Real-time updates
- Dynamic topology

🎨 **Visual Effects**
- Node pulsation for active agents
- Animated data flow lines
- Particle effects
- Status-based color coding

🤖 **Node Types**
- **Coordinator**: Central orchestrator (👑)
- **Worker**: Individual agents (🤖)
- **Task**: Task execution nodes (📋)
- **Data Flow**: Data processing (📊)

📊 **Monitoring**
- Real-time metrics
- Performance tracking
- Status indicators
- Interactive details panel

## Installation

```bash
npm install reactflow framer-motion
```

## Basic Usage

```jsx
import { AgentGraph } from './components/visualization';

const initialNodes = [
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

const initialEdges = [
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
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      onNodeClick={(node) => console.log('Node clicked:', node)}
      enableAnimations={true}
      enableParticles={true}
      autoLayout={true}
    />
  );
}
```

## Advanced Examples

### Adding Nodes Dynamically

```jsx
import { useRef } from 'react';
import { AgentGraph } from './components/visualization';

function App() {
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

  return (
    <>
      <button onClick={addWorkerAgent}>Add Worker</button>
      <AgentGraph ref={graphRef} />
    </>
  );
}
```

### Real-time Status Updates

```jsx
import { useState, useEffect } from 'react';
import { AgentGraph } from './components/visualization';

function App() {
  const [nodes, setNodes] = useState(initialNodes);

  useEffect(() => {
    // Simulate real-time updates from API
    const interval = setInterval(() => {
      fetch('/api/agents/status')
        .then(res => res.json())
        .then(data => {
          setNodes(prevNodes =>
            prevNodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                status: data[node.id]?.status || node.data.status,
                load: data[node.id]?.load || node.data.load,
              },
            }))
          );
        });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <AgentGraph initialNodes={nodes} />;
}
```

### Custom Node Configuration

```jsx
const customNodes = [
  {
    id: 'custom-1',
    type: 'worker',
    position: { x: 300, y: 300 },
    data: {
      label: 'ML Developer',
      description: 'Training neural networks',
      status: 'working',
      load: 85,
      capability: 'ml-developer',
      metrics: {
        taskCompleted: 45,
        avgDuration: '2.3s',
        successRate: '98%',
      },
    },
  },
];
```

### Interactive Callbacks

```jsx
function App() {
  const handleNodeClick = (node) => {
    console.log('Selected node:', node);
    // Open detail modal, update UI, etc.
  };

  const handleEdgeClick = (edge) => {
    console.log('Selected edge:', edge);
    // Show data flow metrics, etc.
  };

  return (
    <AgentGraph
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
    />
  );
}
```

## Node Types & Properties

### Coordinator Node

```javascript
{
  id: 'coordinator-1',
  type: 'coordinator',
  data: {
    label: 'OMEGA',          // Display name
    status: 'active',         // active | working | idle | error | success
    agentCount: 8,            // Number of managed agents
    taskCount: 24,            // Active tasks
    description: 'Central orchestrator',
    metrics: { ... }          // Custom metrics
  }
}
```

### Worker Node

```javascript
{
  id: 'worker-1',
  type: 'worker',
  data: {
    label: 'Research Agent',
    status: 'working',
    load: 75,                 // CPU/Load percentage
    capability: 'researcher', // Agent type
    description: 'Analyzing requirements',
    metrics: { ... }
  }
}
```

### Task Node

```javascript
{
  id: 'task-1',
  type: 'task',
  data: {
    label: 'Build API',
    status: 'working',
    progress: 65,             // 0-100
    assignedTo: 'worker-2',
    description: 'REST API development',
  }
}
```

### Data Flow Node

```javascript
{
  id: 'data-1',
  type: 'dataFlow',
  data: {
    label: 'API Response',
    status: 'active',
    throughput: '1.2k',       // Requests/messages per second
    dataSize: '2.4 MB',
    dataType: 'JSON',
  }
}
```

## Edge Types

### Animated Edge

```javascript
{
  id: 'e1',
  source: 'node1',
  target: 'node2',
  type: 'animated',
  animated: true,
  data: {
    label: 'Task Assignment',
    color: '#00E5FF',
  }
}
```

### Data Edge

```javascript
{
  id: 'e2',
  source: 'node1',
  target: 'node2',
  type: 'data',
  data: {
    active: true,
    bandwidth: 150,
    metrics: {
      bandwidth: '150 MB/s',
      latency: '12ms',
      packets: '1.2k/s',
    }
  }
}
```

## Graph Controls

### Filters

- **All Nodes**: Show all nodes
- **By Type**: coordinator, worker, task, dataFlow
- **By Status**: active, working, idle, success, error

### Layout Algorithms

- **Circular**: Arrange nodes in a circle
- **Hierarchical**: Tree-like structure
- **Force-Directed**: Physics-based layout
- **Grid**: Uniform grid arrangement

### View Options

- **Particles**: Toggle particle effects
- **Animations**: Enable/disable animations
- **Mini Map**: Show/hide overview

## Styling & Theming

### Status Colors

```javascript
const STATUS_COLORS = {
  active: '#00E5FF',   // Cyan
  idle: '#666666',     // Gray
  working: '#00AAFF',  // Blue
  error: '#FF4444',    // Red
  success: '#00FF88',  // Green
};
```

### Custom Styles

Override CSS classes in your stylesheet:

```css
.custom-node {
  /* Your custom styles */
}

.custom-node.coordinator-node {
  /* Coordinator-specific styles */
}

.edge-label {
  /* Edge label styles */
}
```

## API Reference

### AgentGraph Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialNodes` | `Array` | `[]` | Initial node configuration |
| `initialEdges` | `Array` | `[]` | Initial edge configuration |
| `onNodeClick` | `Function` | - | Callback when node is clicked |
| `onEdgeClick` | `Function` | - | Callback when edge is clicked |
| `enableAnimations` | `Boolean` | `true` | Enable/disable animations |
| `enableParticles` | `Boolean` | `true` | Enable/disable particle effects |
| `autoLayout` | `Boolean` | `true` | Auto-arrange nodes |

### Methods (via ref)

```javascript
const graphRef = useRef();

// Add new node
graphRef.current.addNode(nodeConfig);

// Update node status
graphRef.current.updateNodeStatus(nodeId, 'active');

// Remove node
graphRef.current.removeNode(nodeId);

// Add animated edge
graphRef.current.addAnimatedEdge(sourceId, targetId, data);

// Filter nodes
graphRef.current.filterNodes('active');
```

## Integration Examples

### With Claude Flow

```javascript
import { useEffect } from 'react';
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
          data: {
            label: data.name,
            status: 'active',
            capability: data.type,
          },
        }]);
      }

      if (data.type === 'agent_status_update') {
        setNodes(prev =>
          prev.map(node =>
            node.id === data.agentId
              ? { ...node, data: { ...node.data, status: data.status } }
              : node
          )
        );
      }
    };

    return () => ws.close();
  }, []);

  return <AgentGraph initialNodes={nodes} />;
}
```

### With SPARC Workflow

```javascript
function SPARCVisualization() {
  const sparcNodes = [
    {
      id: 'spec',
      type: 'task',
      data: { label: 'Specification', status: 'success', progress: 100 },
    },
    {
      id: 'pseudo',
      type: 'task',
      data: { label: 'Pseudocode', status: 'success', progress: 100 },
    },
    {
      id: 'arch',
      type: 'task',
      data: { label: 'Architecture', status: 'working', progress: 65 },
    },
    {
      id: 'refine',
      type: 'task',
      data: { label: 'Refinement', status: 'idle', progress: 0 },
    },
  ];

  const sparcEdges = [
    { id: 'e1', source: 'spec', target: 'pseudo', type: 'animated' },
    { id: 'e2', source: 'pseudo', target: 'arch', type: 'animated' },
    { id: 'e3', source: 'arch', target: 'refine', type: 'animated' },
  ];

  return <AgentGraph initialNodes={sparcNodes} initialEdges={sparcEdges} />;
}
```

## Performance Optimization

### Large Graphs (100+ nodes)

```javascript
<AgentGraph
  enableAnimations={false}  // Disable for better performance
  enableParticles={false}   // Reduce canvas operations
  autoLayout={false}        // Manual positioning
/>
```

### Debounce Updates

```javascript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback(
  (nodeId, status) => {
    updateNodeStatus(nodeId, status);
  },
  300
);
```

## Troubleshooting

### React Flow not rendering

Make sure to import the CSS:

```javascript
import 'reactflow/dist/style.css';
```

### Animations not working

Install Framer Motion:

```bash
npm install framer-motion
```

### Nodes overlapping

Enable auto-layout or adjust positions:

```javascript
<AgentGraph autoLayout={true} />
```

## Examples

See the demo page: `/src/components/visualization/demo.html`

## Support

For issues and questions:
- GitHub Issues: [project-repo]/issues
- Documentation: `/docs/visualization/`
- Examples: `/examples/visualization/`
