import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  PanResponder,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_POINTS = {
  closed: SCREEN_HEIGHT,
  half: SCREEN_HEIGHT * 0.5,
  full: 0,
};

/**
 * Bottom sheet component with snap points
 * Supports dragging and multiple positions
 */
const BottomSheet = ({
  visible,
  onClose,
  children,
  title,
  snapPoints = ['half', 'full'],
  initialSnap = 'half',
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastGestureDy = useRef(0);

  useEffect(() => {
    if (visible) {
      // Animate to initial snap point
      Animated.spring(translateY, {
        toValue: SNAP_POINTS[initialSnap],
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Animate to closed
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialSnap]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow dragging down
          translateY.setValue(gestureState.dy + lastGestureDy.current);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        // Determine snap point based on velocity and position
        let snapTo = SNAP_POINTS[initialSnap];

        if (vy > 0.5 || dy > SCREEN_HEIGHT * 0.2) {
          // Close if fast swipe down or dragged significantly
          snapTo = SCREEN_HEIGHT;
          onClose?.();
        } else if (snapPoints.includes('full') && dy < -50) {
          // Snap to full if dragged up
          snapTo = SNAP_POINTS.full;
        } else {
          // Snap back to initial
          snapTo = SNAP_POINTS[initialSnap];
        }

        lastGestureDy.current = snapTo;

        Animated.spring(translateY, {
          toValue: snapTo,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      },
    })
  ).current;

  if (!visible && translateY.__getValue() === SCREEN_HEIGHT) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.backdrop} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1F3A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#00E5FF30',
    maxHeight: SCREEN_HEIGHT * 0.95,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00E5FF20',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00E5FF',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 32,
    color: '#666',
    lineHeight: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default BottomSheet;
