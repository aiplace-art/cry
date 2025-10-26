# HYPEAI Chat Interface

Modern React-based AI chat interface with real-time agent visualization and performance metrics.

![HYPEAI Chat](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.0-cyan.svg)

## Features

### 💬 Chat Interface
- **ChatGPT-style design** - Modern, clean, professional
- **Markdown support** - Full markdown rendering with syntax highlighting
- **Auto-complete** - Command suggestions (type `/`)
- **Typing indicators** - Animated typing bubbles
- **Message history** - Persistent chat history with timestamps

### 🤖 Agent Visualization
- **Interactive graph** - Built with React Flow
- **Real-time updates** - Live agent status changes
- **Agent details** - Click any agent for detailed metrics
- **Connection tracking** - See agent communication flow
- **Status indicators** - Active, idle, working states

### 📊 Performance Metrics
- **Token usage tracking** - Monitor API consumption
- **Response time charts** - Analyze performance
- **Agent distribution** - See agent allocation
- **Task completion rate** - Track success metrics
- **Real-time updates** - Live data every 2 seconds

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run chat:dev

# Build for production
npm run chat:build

# Preview production build
npm run chat:preview
```

### Development Server

```bash
npm run chat:dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   └── ChatInterface.jsx       # Main chat UI
│   ├── agents/
│   │   ├── AgentVisualization.jsx  # Agent graph
│   │   ├── AgentNode.jsx           # Agent node component
│   │   └── MetricsPanel.jsx        # Metrics dashboard
├── hooks/
│   └── useAgentData.js             # Agent state management
├── App.jsx                          # Main app component
├── main.jsx                         # Entry point
└── index.css                        # Global styles

docs/
└── CHAT_COMPONENTS_GUIDE.md        # Detailed documentation
```

## Components

### ChatInterface

Modern chat interface with command support.

```jsx
import ChatInterface from './components/chat/ChatInterface';

<ChatInterface
  messages={messages}
  onSendMessage={handleSendMessage}
  isTyping={isTyping}
/>
```

**Props:**
- `messages` - Array of message objects
- `onSendMessage` - Callback for sending messages
- `isTyping` - Boolean for typing indicator

### AgentVisualization

Interactive agent network graph.

```jsx
import AgentVisualization from './components/agents/AgentVisualization';

<AgentVisualization
  agents={agents}
  connections={connections}
  activeAgents={activeAgents}
/>
```

**Props:**
- `agents` - Array of agent objects
- `connections` - Array of connection objects
- `activeAgents` - Array of active agent IDs

### MetricsPanel

Performance metrics dashboard.

```jsx
import MetricsPanel from './components/agents/MetricsPanel';

<MetricsPanel metrics={metrics} />
```

**Props:**
- `metrics` - Object containing performance data

## Available Commands

Type these in the chat interface:

| Command | Description |
|---------|-------------|
| `/swarm` | Initialize agent swarm |
| `/analyze` | Run code analysis |
| `/test` | Execute tests |
| `/deploy` | Deploy application |
| `/sparc` | Run SPARC workflow |
| `/help` | Show all commands |

## Customization

### Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        cyan: '#00E5FF',
        blue: '#00AAFF',
        dark: '#0077FF'
      }
    }
  }
}
```

### Agent Types

Add new agent types in `AgentNode.jsx`:

```javascript
const agentIcons = {
  coder: '💻',
  researcher: '🔬',
  tester: '🧪',
  yourAgent: '🎯',  // Add your icon here
  // ...
};
```

## Integration

### Connect to Backend API

Replace demo data in `useAgentData.js`:

```javascript
useEffect(() => {
  // WebSocket connection
  const ws = new WebSocket('wss://api.hypeai.io/agents');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setAgents(data.agents);
    setMetrics(data.metrics);
  };

  return () => ws.close();
}, []);
```

### REST API Integration

```javascript
const handleSendMessage = async (content) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: content })
  });

  const data = await response.json();
  setMessages(prev => [...prev, data.response]);
};
```

## Styling

### TailwindCSS

All components use TailwindCSS with custom configuration:

- **Dark theme** - Gray-900 background
- **Glassmorphism** - Backdrop blur effects
- **Gradients** - Cyan/blue gradient accents
- **Animations** - Framer Motion powered

### Custom Scrollbar

Styled scrollbar for better UX:

```css
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #374151 transparent;
}
```

## Performance

### Optimizations

- **Memoized components** - AgentNode uses React.memo
- **Lazy loading** - Code splitting with dynamic imports
- **Throttled updates** - Metrics update every 2 seconds
- **Virtual scrolling** - For large message lists

### Bundle Size

Production build optimizations:

```bash
npm run chat:build

# Output size (estimated):
# - JS: ~250KB (gzipped)
# - CSS: ~15KB (gzipped)
# - Total: ~265KB
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

### Core
- React 18.2.0
- React DOM 18.2.0
- Vite 5.0.8

### UI Libraries
- Framer Motion 10.16.16
- React Flow 11.10.3
- Recharts 2.10.3
- TailwindCSS 3.4.0

### Markdown
- react-markdown 9.0.1
- react-syntax-highlighter 15.5.0

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run chat:dev -- --port 3001
```

### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run chat:build
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - HYPEAI Project

## Support

- Documentation: `/docs/CHAT_COMPONENTS_GUIDE.md`
- Issues: [GitHub Issues](https://github.com/hypeai/issues)
- Discord: [HYPEAI Community](https://discord.gg/hypeai)

---

**Built with ⚡ by HYPEAI - Infinite Intelligence**
