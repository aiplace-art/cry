import React, { useState, useEffect } from 'react';
import ChatInterface from './components/chat/ChatInterface';
import AgentVisualization from './components/agents/AgentVisualization';
import MetricsPanel from './components/agents/MetricsPanel';
import { useAgentData } from './hooks/useAgentData';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to HYPEAI! I\'m your AI assistant. Type `/help` to see available commands or ask me anything.',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeView, setActiveView] = useState('chat'); // chat, agents, metrics

  const {
    agents,
    connections,
    activeAgents,
    metrics,
    initializeAgents,
    activateAgent,
    updateTaskCompletion
  } = useAgentData();

  useEffect(() => {
    // Initialize demo agents
    initializeAgents([
      { name: 'Coordinator', type: 'coordinator', status: 'active' },
      { name: 'Code Analyzer', type: 'coder', status: 'idle' },
      { name: 'Researcher', type: 'researcher', status: 'idle' },
      { name: 'Test Engineer', type: 'tester', status: 'idle' },
      { name: 'Code Reviewer', type: 'reviewer', status: 'idle' }
    ]);
  }, [initializeAgents]);

  const handleSendMessage = async (content) => {
    // Add user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Handle commands
    if (content.startsWith('/swarm')) {
      agents.forEach((agent) => {
        setTimeout(() => activateAgent(agent.id), Math.random() * 1000);
      });
    }

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: generateResponse(content),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      updateTaskCompletion('completed');
    }, 1500);
  };

  const generateResponse = (input) => {
    if (input.startsWith('/help')) {
      return `## Available Commands

- \`/swarm\` - Initialize agent swarm
- \`/analyze\` - Analyze code
- \`/test\` - Run tests
- \`/deploy\` - Deploy application
- \`/sparc\` - Run SPARC workflow

Type any question or command to get started!`;
    }

    if (input.startsWith('/swarm')) {
      return `🚀 Initializing agent swarm...

✅ Coordinator agent activated
✅ Code Analyzer ready
✅ Researcher standing by
✅ Test Engineer online
✅ Code Reviewer ready

All agents are now active and ready to collaborate!`;
    }

    return `I received your message: "${input}"\n\nI'm a demo assistant. Try using commands like \`/swarm\` or \`/help\` to see what I can do!`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl">⚡</div>
            <div>
              <h1 className="text-xl font-bold text-white">HYPEAI</h1>
              <p className="text-xs text-gray-400">Infinite Intelligence</p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('chat')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveView('agents')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'agents'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              🤖 Agents
            </button>
            <button
              onClick={() => setActiveView('metrics')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'metrics'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              📊 Metrics
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeView === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
          />
        )}
        {activeView === 'agents' && (
          <AgentVisualization
            agents={agents}
            connections={connections}
            activeAgents={activeAgents}
          />
        )}
        {activeView === 'metrics' && <MetricsPanel metrics={metrics} />}
      </main>
    </div>
  );
}

export default App;
