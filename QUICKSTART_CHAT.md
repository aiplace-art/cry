# 🚀 HYPEAI Chat - 5-Minute Quick Start

## ⚡ Super Fast Setup

### 1. Install (Already Done ✅)
```bash
npm install  # Already completed
```

### 2. Run Development Server
```bash
npm run chat:dev
```

### 3. Open Browser
Navigate to: **http://localhost:3000**

## 🎯 What You'll See

### Three Tabs:
1. **💬 Chat** - ChatGPT-style interface
2. **🤖 Agents** - Interactive agent graph
3. **📊 Metrics** - Performance dashboard

## 🎮 Try These Commands

Type in the chat:

```
/swarm      → Activate all agents
/analyze    → Run code analysis
/test       → Execute tests
/help       → Show all commands
```

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/ChatInterface.jsx        ← Main chat UI
│   └── agents/
│       ├── AgentVisualization.jsx    ← Agent graph
│       ├── AgentNode.jsx             ← Agent nodes
│       └── MetricsPanel.jsx          ← Metrics charts
├── hooks/useAgentData.js             ← State management
└── App.jsx                           ← Main app
```

## 🎨 Key Features

### Chat Interface
- Markdown rendering
- Syntax highlighting
- Auto-complete (type `/`)
- Typing indicators
- Message history

### Agent Graph
- Interactive nodes
- Real-time updates
- Click for details
- Animated connections
- Status indicators

### Metrics Panel
- Token usage charts
- Response times
- Agent distribution
- Task completion
- Live updates

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    cyan: '#00E5FF',  // Your color here
    blue: '#00AAFF',
    dark: '#0077FF'
  }
}
```

### Add Agent Types
Edit `src/components/agents/AgentNode.jsx`:
```javascript
const agentIcons = {
  coder: '💻',
  yourAgent: '🎯',  // Add yours
  // ...
};
```

## 🌐 Connect to Backend

### WebSocket Integration
Edit `src/hooks/useAgentData.js`:

```javascript
useEffect(() => {
  const ws = new WebSocket('wss://your-api.com/agents');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setAgents(data.agents);
    setMetrics(data.metrics);
  };
  
  return () => ws.close();
}, []);
```

### REST API
Edit `src/App.jsx`:

```javascript
const handleSendMessage = async (content) => {
  const response = await fetch('https://your-api.com/chat', {
    method: 'POST',
    body: JSON.stringify({ message: content })
  });
  
  const data = await response.json();
  // Handle response
};
```

## 📦 Production Build

```bash
# Build for production
npm run chat:build

# Preview build
npm run chat:preview
```

Output in `/dist` folder (~265KB total).

## 🐛 Troubleshooting

### Port in use?
```bash
npm run chat:dev -- --port 3001
```

### Build errors?
```bash
rm -rf node_modules
npm install
npm run chat:build
```

## 📚 Documentation

- **Full Guide**: `docs/CHAT_COMPONENTS_GUIDE.md`
- **Summary**: `docs/CHAT_INTERFACE_SUMMARY.md`
- **Main README**: `README-CHAT.md`

## 🎉 You're All Set!

The chat interface is ready to use. Start the dev server and explore!

```bash
npm run chat:dev
```

---

**Need help?** Check the full documentation in `/docs/`

**Built with ⚡ by HYPEAI**
