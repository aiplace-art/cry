import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text
} from 'react-native';
import ChatWindow from '../ChatWindow';
import AgentGraph from '../AgentGraph';
import MetricsPanel from '../MetricsPanel';

const DesktopLayout = ({
  messages,
  agents,
  metrics,
  onSendMessage,
  onAgentSelect
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Chat Section */}
        <View style={styles.chatSection}>
          <ChatWindow
            messages={messages}
            onSendMessage={onSendMessage}
          />
        </View>

        {/* Agent Graph Section */}
        <View style={styles.graphSection}>
          <AgentGraph
            agents={agents}
            onAgentSelect={onAgentSelect}
            enableZoom
            enablePan
            showMinimap
          />
        </View>
      </View>

      {/* Metrics Sidebar */}
      {!sidebarCollapsed && (
        <View style={styles.sidebar}>
          <MetricsPanel metrics={metrics} />
        </View>
      )}

      {/* Sidebar Toggle */}
      <View style={styles.sidebarToggle}>
        <Text
          style={styles.toggleButton}
          onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? '◀' : '▶'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  chatSection: {
    flex: 6,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  graphSection: {
    flex: 4,
    padding: 16,
  },
  sidebar: {
    width: 280,
    backgroundColor: '#0a0a0a',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
    padding: 16,
  },
  sidebarToggle: {
    position: 'absolute',
    right: 280,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: '#333',
    borderRadius: 4,
    padding: 8,
    zIndex: 10,
  },
  toggleButton: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DesktopLayout;
