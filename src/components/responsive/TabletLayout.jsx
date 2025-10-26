import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated
} from 'react-native';
import ChatWindow from '../ChatWindow';
import AgentGraph from '../AgentGraph';
import MetricsPanel from '../MetricsPanel';
import TabletTabs from './TabletTabs';

const TabletLayout = ({
  messages,
  agents,
  metrics,
  onSendMessage,
  onAgentSelect,
  orientation
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [metricsExpanded, setMetricsExpanded] = useState(false);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'metrics', label: 'Metrics', icon: '📊' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatWindow
            messages={messages}
            onSendMessage={onSendMessage}
            compact
          />
        );
      case 'agents':
        return (
          <AgentGraph
            agents={agents}
            onAgentSelect={onAgentSelect}
            compact
            enableTouch
          />
        );
      case 'metrics':
        return (
          <MetricsPanel
            metrics={metrics}
            compact
          />
        );
      default:
        return null;
    }
  };

  // Landscape mode: Split view
  if (orientation === 'landscape') {
    return (
      <View style={styles.landscapeContainer}>
        <View style={styles.landscapeLeft}>
          <ChatWindow
            messages={messages}
            onSendMessage={onSendMessage}
          />
        </View>
        <View style={styles.landscapeRight}>
          <TabletTabs
            tabs={[
              { id: 'agents', label: 'Agents', icon: '🤖' },
              { id: 'metrics', label: 'Metrics', icon: '📊' }
            ]}
            activeTab={activeTab === 'chat' ? 'agents' : activeTab}
            onTabChange={setActiveTab}
          />
          <View style={styles.landscapeContent}>
            {activeTab === 'agents' ? (
              <AgentGraph
                agents={agents}
                onAgentSelect={onAgentSelect}
                compact
              />
            ) : (
              <MetricsPanel metrics={metrics} compact />
            )}
          </View>
        </View>
      </View>
    );
  }

  // Portrait mode: Tabbed interface
  return (
    <View style={styles.container}>
      <TabletTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Collapsible Metrics Panel */}
      {activeTab === 'chat' && (
        <View style={styles.metricsDrawer}>
          <TouchableOpacity
            style={styles.metricsToggle}
            onPress={() => setMetricsExpanded(!metricsExpanded)}
          >
            <Text style={styles.metricsToggleText}>
              📊 {metricsExpanded ? '▼' : '▲'} Quick Metrics
            </Text>
          </TouchableOpacity>

          {metricsExpanded && (
            <View style={styles.metricsContent}>
              <MetricsPanel metrics={metrics} minimal />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
  },
  landscapeLeft: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  landscapeRight: {
    flex: 1,
  },
  landscapeContent: {
    flex: 1,
  },
  metricsDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  metricsToggle: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  metricsToggleText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricsContent: {
    maxHeight: 200,
    padding: 12,
  },
});

export default TabletLayout;
