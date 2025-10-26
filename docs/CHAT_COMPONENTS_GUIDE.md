# HYPEAI Chat Components Guide

## Overview

Modern React-based chat interface with real-time agent visualization and performance metrics.

## Components

### 1. ChatInterface.jsx
**Location:** `/src/components/chat/ChatInterface.jsx`

**Features:**
- ChatGPT-style modern interface
- Markdown rendering with syntax highlighting
- Auto-complete commands (type `/`)
- Typing indicators with animations
- Message history with timestamps
- Smooth scroll behavior

**Usage:**
```jsx
<ChatInterface
  messages={messages}
  onSendMessage={handleSendMessage}
  isTyping={isTyping}
/>
```

### 2. AgentVisualization.jsx
**Location:** `/src/components/agents/AgentVisualization.jsx`

**Features:**
- Interactive agent graph using React Flow
- Real-time agent status updates
- Animated connections between agents
- Click agents for detailed view
- Mini-map and controls
- Auto-layout in circular topology

**Usage:**
```jsx
<AgentVisualization
  agents={agents}
  connections={connections}
  activeAgents={activeAgents}
/>
```

### 3. AgentNode.jsx
**Location:** `/src/components/agents/AgentNode.jsx`

**Features:**
- Custom node component for React Flow
- Status indicators (active, idle, working)
- Animated pulse for active agents
- Agent metrics display
- Icon-based agent types
- Hover effects

**Props:**
```javascript
{
  data: {
    label: string,
    type: string,
    status: 'active' | 'idle' | 'working',
    metrics: {
      tasks: number,
      uptime: string
    },
    onClick: () => void
  }
}
```

### 4. MetricsPanel.jsx
**Location:** `/src/components/agents/MetricsPanel.jsx`

**Features:**
- Real-time performance charts
- Token usage tracking
- Response time monitoring
- Agent distribution pie chart
- Task completion rate
- Animated stat cards

**Usage:**
```jsx
<MetricsPanel metrics={metrics} />
```

## Hooks

### useAgentData.js
**Location:** `/src/hooks/useAgentData.js`

**Purpose:** Manages agent state and metrics

**API:**
```javascript
const {
  agents,           // Array of agent objects
  connections,      // Array of connections
  activeAgents,     // Array of active agent IDs
  metrics,          // Performance metrics object
  initializeAgents, // Initialize agent list
  activateAgent,    // Activate an agent
  deactivateAgent,  // Deactivate an agent
  updateTaskCompletion // Update task metrics
} = useAgentData();
```

## Styling

### TailwindCSS Configuration
- Dark theme as primary
- Glassmorphism effects
- Custom gradient colors
- Smooth animations

### Color Palette
```css
primary-cyan: #00E5FF
primary-blue: #00AAFF
primary-dark: #0077FF
```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Dependencies

- **react-flow**: Agent graph visualization
- **framer-motion**: Smooth animations
- **recharts**: Performance charts
- **react-markdown**: Markdown rendering
- **react-syntax-highlighter**: Code syntax highlighting

## Integration with HYPEAI

### Connecting to Backend

Replace demo data in `useAgentData.js` with real API calls:

```javascript
// Example: Connect to WebSocket for real-time updates
useEffect(() => {
  const ws = new WebSocket('wss://api.hypeai.io/agents');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateAgents(data.agents);
    updateMetrics(data.metrics);
  };

  return () => ws.close();
}, []);
```

### Commands

Available chat commands:
- `/swarm` - Initialize agent swarm
- `/analyze` - Run code analysis
- `/test` - Execute tests
- `/deploy` - Deploy application
- `/sparc` - Run SPARC workflow
- `/help` - Show all commands

## Performance

- Lazy loading for components
- Memoized agent nodes
- Throttled updates
- Virtual scrolling for large message lists

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT License - HYPEAI Project
