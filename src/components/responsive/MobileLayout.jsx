import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import ChatWindow from '../ChatWindow';
import MobileAgentDrawer from './MobileAgentDrawer';

const MobileLayout = ({
  messages,
  agents,
  metrics,
  onSendMessage,
  onAgentSelect
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Main Chat Area */}
      <View style={styles.chatContainer}>
        <ChatWindow
          messages={messages}
          onSendMessage={onSendMessage}
          mobile
          onAgentButtonPress={() => setDrawerOpen(true)}
        />
      </View>

      {/* Bottom Agent Drawer */}
      <MobileAgentDrawer
        agents={agents}
        metrics={metrics}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAgentSelect={(agent) => {
          onAgentSelect(agent);
          setDrawerOpen(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  chatContainer: {
    flex: 1,
  },
});

export default MobileLayout;
