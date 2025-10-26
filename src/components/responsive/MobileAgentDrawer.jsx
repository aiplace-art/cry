import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  PanResponder,
  TouchableOpacity,
  Text,
  FlatList,
  Dimensions
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = 50;

const MobileAgentDrawer = ({
  agents = [],
  metrics = {},
  isOpen,
  onClose,
  onAgentSelect
}) => {
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const lastGestureDy = useRef(0);

  useEffect(() => {
    if (isOpen) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [isOpen]);

  const openDrawer = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: DRAWER_HEIGHT,
      duration: 250,
      useNativeDriver: true
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          lastGestureDy.current = gestureState.dy;
        }
      },
      onPanResponderRelease: () => {
        if (lastGestureDy.current > SWIPE_THRESHOLD) {
          onClose();
        } else {
          openDrawer();
        }
      }
    })
  ).current;

  const renderAgentItem = ({ item: agent }) => (
    <TouchableOpacity
      style={[
        styles.agentItem,
        agent.status === 'active' && styles.agentItemActive
      ]}
      onPress={() => onAgentSelect(agent)}
    >
      <View style={styles.agentHeader}>
        <View style={[
          styles.statusDot,
          { backgroundColor: getStatusColor(agent.status) }
        ]} />
        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentRole}>{agent.type}</Text>
      </View>

      {agent.currentTask && (
        <Text style={styles.agentTask} numberOfLines={1}>
          {agent.currentTask}
        </Text>
      )}

      <View style={styles.agentMetrics}>
        <Text style={styles.metricText}>
          ⚡ {agent.performance || 0}%
        </Text>
        <Text style={styles.metricText}>
          📊 {agent.tasksCompleted || 0} tasks
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00E5FF';
      case 'idle': return '#FFD700';
      case 'error': return '#FF4444';
      default: return '#666';
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateY }]
          }
        ]}
      >
        {/* Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Active Agents</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Metrics */}
        <View style={styles.quickMetrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active</Text>
            <Text style={styles.metricValue}>
              {agents.filter(a => a.status === 'active').length}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total</Text>
            <Text style={styles.metricValue}>{agents.length}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Performance</Text>
            <Text style={styles.metricValue}>
              {metrics.avgPerformance || 0}%
            </Text>
          </View>
        </View>

        {/* Agent List */}
        <FlatList
          data={agents}
          renderItem={renderAgentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  handleContainer: {
    padding: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  quickMetrics: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00E5FF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  agentItem: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  agentItemActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#001a1f',
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  agentRole: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  agentTask: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  agentMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricText: {
    fontSize: 12,
    color: '#00E5FF',
  },
});

export default MobileAgentDrawer;
