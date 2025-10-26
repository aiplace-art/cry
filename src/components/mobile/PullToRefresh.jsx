import React, { useRef, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Animated,
  Platform,
} from 'react-native';

/**
 * Pull-to-refresh wrapper component
 * Works with ScrollView and custom refresh logic
 */
const PullToRefresh = ({
  children,
  onRefresh,
  refreshing = false,
  customIndicator,
  tintColor = '#00E5FF',
  ...props
}) => {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const pullAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = async () => {
    setInternalRefreshing(true);

    try {
      await onRefresh?.();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setInternalRefreshing(false);
    }
  };

  const isRefreshing = refreshing || internalRefreshing;

  // Custom refresh indicator
  const CustomIndicator = () => {
    if (customIndicator) {
      return customIndicator(isRefreshing);
    }

    return (
      <View style={styles.customIndicator}>
        <ActivityIndicator color={tintColor} size="small" />
        <Text style={[styles.refreshText, { color: tintColor }]}>
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      {...props}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
          progressBackgroundColor="#1A1F3A"
          title="Pull to refresh"
          titleColor={tintColor}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  customIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PullToRefresh;
