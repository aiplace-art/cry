import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1920,
};

const ResponsiveGrid = ({ data, renderItem, ...props }) => {
  const [numColumns, setNumColumns] = useState(1);
  const [itemWidth, setItemWidth] = useState(SCREEN_WIDTH);

  useEffect(() => {
    const updateLayout = () => {
      const width = Dimensions.get('window').width;

      let columns = 1;
      if (width >= BREAKPOINTS.desktop) {
        columns = 3; // Desktop: 3 columns
      } else if (width >= BREAKPOINTS.tablet) {
        columns = 2; // Tablet: 2 columns
      } else {
        columns = 1; // Mobile: 1 column
      }

      setNumColumns(columns);

      // Calculate item width with proper spacing
      const spacing = 16;
      const totalSpacing = spacing * (columns + 1);
      const availableWidth = width - totalSpacing;
      const calculatedWidth = availableWidth / columns;

      setItemWidth(calculatedWidth);
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    updateLayout();

    return () => subscription?.remove();
  }, []);

  const renderGridItem = ({ item, index }) => {
    return (
      <View
        style={[
          styles.gridItem,
          {
            width: itemWidth,
            marginLeft: index % numColumns === 0 ? 16 : 8,
            marginRight: index % numColumns === numColumns - 1 ? 16 : 8,
          },
        ]}
      >
        {renderItem({ item, index, itemWidth })}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderGridItem}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 16,
  },
  columnWrapper: {
    marginVertical: 8,
  },
  gridItem: {
    marginVertical: 8,
  },
});

export default ResponsiveGrid;
