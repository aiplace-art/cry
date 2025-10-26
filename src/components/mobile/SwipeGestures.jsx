import React, { useRef } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

/**
 * Swipe gesture handler component
 * Supports left/right swipe actions
 */
const SwipeGestures = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  style,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const lastSwipeDirection = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return enabled && Math.abs(gestureState.dx) > 10;
      },

      onPanResponderMove: (_, gestureState) => {
        if (!enabled) return;

        // Only allow horizontal movement
        pan.setValue({ x: gestureState.dx, y: 0 });
      },

      onPanResponderRelease: (_, gestureState) => {
        if (!enabled) return;

        const { dx, vx } = gestureState;

        // Determine if swipe threshold was met
        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5) {
          if (dx > 0) {
            // Swipe right
            lastSwipeDirection.current = 'right';
            onSwipeRight?.();
          } else {
            // Swipe left
            lastSwipeDirection.current = 'left';
            onSwipeLeft?.();
          }
        }

        // Reset position with animation
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              translateX: pan.x.interpolate({
                inputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
                outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

export default SwipeGestures;
