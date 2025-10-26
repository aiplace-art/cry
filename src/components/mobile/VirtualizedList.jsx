import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

/**
 * Optimized virtualized list with lazy loading
 * Renders only visible items for better performance
 */
const VirtualizedList = ({
  data,
  renderItem,
  onEndReached,
  loading = false,
  hasMore = true,
  emptyMessage = 'No items found',
  itemHeight = 80,
  ...props
}) => {
  // Memoize keyExtractor
  const keyExtractor = useCallback((item, index) => {
    return item.id?.toString() || index.toString();
  }, []);

  // Optimize item layout with getItemLayout
  const getItemLayout = useCallback(
    (data, index) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  // Render footer loading indicator
  const renderFooter = useCallback(() => {
    if (!loading) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#00E5FF" />
      </View>
    );
  }, [loading]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }, [loading, emptyMessage]);

  // Handle end reached with threshold
  const handleEndReached = useCallback(() => {
    if (!loading && hasMore && onEndReached) {
      onEndReached();
    }
  }, [loading, hasMore, onEndReached]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VirtualizedList;
