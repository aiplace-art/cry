# Agent Graph Visualization - Demo Examples

## 🎯 Quick Start Examples

### Example 1: Simple Agent Network

```jsx
import { AgentGraph } from './components/visualization';

function SimpleExample() {
  const nodes = [
    {
      id: '1',
      type: 'coordinator',
      position: { x: 400, y: 100 },
      data: {
        label: 'OMEGA Coordinator',
        status: 'active',
        agentCount: 3,
        taskCount: 5,
      },
    },
    {
      id: '2',
      type: 'worker',
      position: { x: 200, y: 300 },
      data: {
        label: 'Researcher',
        status: 'working',
        load: 65,
        capability: 'researcher',
      },
    },
    {
      id: '3',
      type: 'worker',
      position: { x: 400, y: 300 },
      data: {
        label: 'Coder',
        status: 'active',
        load: 45,
        capability: 'coder',
      },
    },
    {
      id: '4',
      type: 'worker',
      position: { x: 600, y: 300 },
      data: {
        label: 'Tester',
        status: 'idle',
        load: 0,
        capability: 'tester',
      },
    },
  ];

  const edges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'animated',
      animated: true,
      data: { label: 'Research Task' },
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      type: 'animated',
      animated: true,
      data: { label: 'Code Task' },
    },
    {
      id: 'e1-4',
      source: '1',
      target: '4',
      type: 'animated',
      animated: true,
      data: { label: 'Test Task' },
    },
  ];

  return (
    <div style={{ height: '100vh' }}>
      <AgentGraph
        initialNodes={nodes}
        initialEdges={edges}
        enableAnimations={true}
        enableParticles={true}
      />
    </div>
  );
}
```

### Example 2: SPARC Workflow Visualization

```jsx
function SPARCWorkflow() {
  const nodes = [
    {
      id: 'spec',
      type: 'task',
      position: { x: 100, y: 200 },
      data: {
        label: 'Specification',
        status: 'success',
        progress: 100,
        assignedTo: 'Spec Writer',
        description: 'Requirements analysis complete',
      },
    },
    {
      id: 'pseudo',
      type: 'task',
      position: { x: 300, y: 200 },
      data: {
        label: 'Pseudocode',
        status: 'success',
        progress: 100,
        assignedTo: 'Architect',
        description: 'Algorithm design complete',
      },
    },
    {
      id: 'arch',
      type: 'task',
      position: { x: 500, y: 200 },
      data: {
        label: 'Architecture',
        status: 'working',
        progress: 75,
        assignedTo: 'System Architect',
        description: 'Designing system components',
      },
    },
    {
      id: 'refine',
      type: 'task',
      position: { x: 700, y: 200 },
      data: {
        label: 'Refinement',
        status: 'idle',
        progress: 0,
        assignedTo: 'TDD Agent',
        description: 'Waiting for architecture',
      },
    },
    {
      id: 'complete',
      type: 'task',
      position: { x: 900, y: 200 },
      data: {
        label: 'Completion',
        status: 'idle',
        progress: 0,
        assignedTo: 'Integrator',
        description: 'Final integration pending',
      },
    },
  ];

  const edges = [
    {
      id: 'e1',
      source: 'spec',
      target: 'pseudo',
      type: 'animated',
      animated: true,
    },
    {
      id: 'e2',
      source: 'pseudo',
      target: 'arch',
      type: 'animated',
      animated: true,
    },
    {
      id: 'e3',
      source: 'arch',
      target: 'refine',
      type: 'animated',
      animated: false,
    },
    {
      id: 'e4',
      source: 'refine',
      target: 'complete',
      type: 'animated',
      animated: false,
    },
  ];

  return (
    <div style={{ height: '100vh' }}>
      <AgentGraph
        initialNodes={nodes}
        initialEdges={edges}
        enableAnimations={true}
      />
    </div>
  );
}
```

### Example 3: Full-Stack Development Team

```jsx
function FullStackTeam() {
  const nodes = [
    {
      id: 'coordinator',
      type: 'coordinator',
      position: { x: 500, y: 100 },
      data: {
        label: 'Project Coordinator',
        status: 'active',
        agentCount: 6,
        taskCount: 15,
      },
    },
    {
      id: 'backend',
      type: 'worker',
      position: { x: 200, y: 300 },
      data: {
        label: 'Backend Dev',
        status: 'working',
        load: 80,
        capability: 'backend-dev',
        description: 'Building REST API',
      },
    },
    {
      id: 'frontend',
      type: 'worker',
      position: { x: 400, y: 300 },
      data: {
        label: 'Frontend Dev',
        status: 'working',
        load: 70,
        capability: 'coder',
        description: 'React components',
      },
    },
    {
      id: 'database',
      type: 'worker',
      position: { x: 600, y: 300 },
      data: {
        label: 'DB Architect',
        status: 'active',
        load: 50,
        capability: 'code-analyzer',
        description: 'Schema design',
      },
    },
    {
      id: 'tester',
      type: 'worker',
      position: { x: 800, y: 300 },
      data: {
        label: 'QA Engineer',
        status: 'working',
        load: 60,
        capability: 'tester',
        description: 'Writing tests',
      },
    },
    {
      id: 'devops',
      type: 'worker',
      position: { x: 300, y: 500 },
      data: {
        label: 'DevOps',
        status: 'idle',
        load: 20,
        capability: 'cicd-engineer',
        description: 'CI/CD setup',
      },
    },
    {
      id: 'security',
      type: 'worker',
      position: { x: 700, y: 500 },
      data: {
        label: 'Security',
        status: 'active',
        load: 40,
        capability: 'reviewer',
        description: 'Security audit',
      },
    },
  ];

  const edges = [
    { id: 'e1', source: 'coordinator', target: 'backend', animated: true },
    { id: 'e2', source: 'coordinator', target: 'frontend', animated: true },
    { id: 'e3', source: 'coordinator', target: 'database', animated: true },
    { id: 'e4', source: 'coordinator', target: 'tester', animated: true },
    { id: 'e5', source: 'coordinator', target: 'devops', animated: false },
    { id: 'e6', source: 'coordinator', target: 'security', animated: true },
    { id: 'e7', source: 'backend', target: 'database', animated: true },
    { id: 'e8', source: 'frontend', target: 'backend', animated: true },
    { id: 'e9', source: 'tester', target: 'backend', animated: true },
    { id: 'e10', source: 'tester', target: 'frontend', animated: true },
  ];

  return <AgentGraph initialNodes={nodes} initialEdges={edges} />;
}
```

### Example 4: Data Pipeline

```jsx
function DataPipeline() {
  const nodes = [
    {
      id: 'source',
      type: 'dataFlow',
      position: { x: 100, y: 300 },
      data: {
        label: 'Data Source',
        status: 'active',
        throughput: '5k',
        dataSize: '10 MB',
        dataType: 'JSON',
      },
    },
    {
      id: 'transform',
      type: 'dataFlow',
      position: { x: 300, y: 300 },
      data: {
        label: 'Transformer',
        status: 'working',
        throughput: '4.8k',
        dataSize: '9.5 MB',
        dataType: 'JSON',
      },
    },
    {
      id: 'filter',
      type: 'dataFlow',
      position: { x: 500, y: 300 },
      data: {
        label: 'Filter',
        status: 'active',
        throughput: '3.2k',
        dataSize: '6 MB',
        dataType: 'JSON',
      },
    },
    {
      id: 'aggregate',
      type: 'dataFlow',
      position: { x: 700, y: 300 },
      data: {
        label: 'Aggregator',
        status: 'working',
        throughput: '1.5k',
        dataSize: '3 MB',
        dataType: 'JSON',
      },
    },
    {
      id: 'sink',
      type: 'dataFlow',
      position: { x: 900, y: 300 },
      data: {
        label: 'Data Sink',
        status: 'success',
        throughput: '1.5k',
        dataSize: '3 MB',
        dataType: 'Database',
      },
    },
  ];

  const edges = [
    {
      id: 'e1',
      source: 'source',
      target: 'transform',
      type: 'data',
      data: {
        active: true,
        bandwidth: 100,
        metrics: {
          bandwidth: '100 MB/s',
          latency: '5ms',
          packets: '5k/s',
        },
      },
    },
    {
      id: 'e2',
      source: 'transform',
      target: 'filter',
      type: 'data',
      data: {
        active: true,
        bandwidth: 95,
        metrics: {
          bandwidth: '95 MB/s',
          latency: '8ms',
          packets: '4.8k/s',
        },
      },
    },
    {
      id: 'e3',
      source: 'filter',
      target: 'aggregate',
      type: 'data',
      data: {
        active: true,
        bandwidth: 60,
        metrics: {
          bandwidth: '60 MB/s',
          latency: '12ms',
          packets: '3.2k/s',
        },
      },
    },
    {
      id: 'e4',
      source: 'aggregate',
      target: 'sink',
      type: 'data',
      data: {
        active: true,
        bandwidth: 30,
        metrics: {
          bandwidth: '30 MB/s',
          latency: '10ms',
          packets: '1.5k/s',
        },
      },
    },
  ];

  return <AgentGraph initialNodes={nodes} initialEdges={edges} />;
}
```

### Example 5: Dynamic Real-Time Updates

```jsx
import { useState, useEffect } from 'react';

function RealTimeUpdates() {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: 'coordinator',
      position: { x: 400, y: 100 },
      data: { label: 'Coordinator', status: 'active' },
    },
  ]);

  const [edges, setEdges] = useState([]);

  // Simulate adding agents dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      const agentId = `agent-${Date.now()}`;
      const agentTypes = ['worker', 'task', 'dataFlow'];
      const randomType = agentTypes[Math.floor(Math.random() * agentTypes.length)];

      setNodes((prev) => [
        ...prev,
        {
          id: agentId,
          type: randomType,
          position: {
            x: Math.random() * 800,
            y: Math.random() * 400 + 200,
          },
          data: {
            label: `Agent ${prev.length}`,
            status: 'active',
            load: Math.floor(Math.random() * 100),
          },
        },
      ]);

      setEdges((prev) => [
        ...prev,
        {
          id: `e-${agentId}`,
          source: '1',
          target: agentId,
          type: 'animated',
          animated: true,
        },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === '1') return node;

          const statuses = ['active', 'working', 'idle', 'success'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

          return {
            ...node,
            data: {
              ...node.data,
              status: randomStatus,
              load: Math.floor(Math.random() * 100),
            },
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

## 🎨 Styling Examples

### Custom Theme

```css
/* Dark theme with custom colors */
.agent-graph-container {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

.custom-node {
  background: rgba(16, 18, 27, 0.95);
  border-color: #00E5FF;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.2);
}

.node-label {
  color: #00E5FF;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}
```

### Glassmorphism Style

```css
.custom-node {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

## 🚀 Performance Tips

### Optimize for Large Graphs

```jsx
function OptimizedGraph() {
  return (
    <AgentGraph
      enableAnimations={false}      // Disable for 100+ nodes
      enableParticles={false}       // Reduce canvas operations
      autoLayout={false}            // Manual positioning
      // ... other props
    />
  );
}
```

### Virtualization for 1000+ Nodes

```jsx
import { memo } from 'react';

const MemoizedNode = memo(({ data }) => {
  // Your node component
});

// Use memoized components to prevent unnecessary re-renders
```

## 📊 Integration Examples

### With WebSocket

```jsx
function WebSocketGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/agents');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'node_update') {
        setNodes((prev) =>
          prev.map((node) =>
            node.id === message.id
              ? { ...node, data: { ...node.data, ...message.data } }
              : node
          )
        );
      }
    };

    return () => ws.close();
  }, []);

  return <AgentGraph initialNodes={nodes} initialEdges={edges} />;
}
```

### With Redux

```jsx
import { useSelector, useDispatch } from 'react-redux';

function ReduxGraph() {
  const nodes = useSelector((state) => state.agents.nodes);
  const edges = useSelector((state) => state.agents.edges);
  const dispatch = useDispatch();

  const handleNodeClick = (node) => {
    dispatch({ type: 'SELECT_NODE', payload: node });
  };

  return (
    <AgentGraph
      initialNodes={nodes}
      initialEdges={edges}
      onNodeClick={handleNodeClick}
    />
  );
}
```

## 🎯 Complete Dashboard Example

```jsx
import { useState } from 'react';
import { AgentGraph, GraphControls } from './components/visualization';

function AgentDashboard() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>AI Agent Swarm Dashboard</h1>
        <div className="stats">
          <div>Nodes: {nodes.length}</div>
          <div>Active: {nodes.filter(n => n.data.status === 'active').length}</div>
          <div>Tasks: {edges.length}</div>
        </div>
      </header>

      <div className="dashboard-content">
        <AgentGraph
          initialNodes={nodes}
          initialEdges={edges}
          onNodeClick={setSelectedNode}
          enableAnimations={true}
          enableParticles={true}
        />
      </div>

      {selectedNode && (
        <aside className="node-details">
          <h2>{selectedNode.data.label}</h2>
          <p>Status: {selectedNode.data.status}</p>
          <p>Type: {selectedNode.type}</p>
          {/* More details */}
        </aside>
      )}
    </div>
  );
}
```

---

**Note**: All examples require React 18+, React Flow, and Framer Motion to be installed.

For more examples, see the interactive demo: `npm run demo`
