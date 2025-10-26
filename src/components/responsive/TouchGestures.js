import { useRef, useCallback } from 'react';
import { Animated, PanResponder } from 'react-native';

/**
 * Custom hook for touch gesture handling
 * Supports pinch-to-zoom, pan, and swipe gestures
 */
export const useTouchGestures = ({
  onPinch,
  onPan,
  onSwipe,
  onDoubleTap,
  minScale = 0.5,
  maxScale = 3
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTapTime = useRef(0);
  const touches = useRef([]);

  const getDistance = (touch1, touch2) => {
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        // Track touches for pinch detection
        touches.current = evt.nativeEvent.touches;

        // Double tap detection
        const now = Date.now();
        if (now - lastTapTime.current < 300) {
          onDoubleTap?.();
        }
        lastTapTime.current = now;
      },

      onPanResponderMove: (evt, gestureState) => {
        const currentTouches = evt.nativeEvent.touches;

        // Pinch-to-zoom (two fingers)
        if (currentTouches.length === 2 && touches.current.length === 2) {
          const currentDistance = getDistance(
            currentTouches[0],
            currentTouches[1]
          );
          const initialDistance = getDistance(
            touches.current[0],
            touches.current[1]
          );

          let newScale = (currentDistance / initialDistance) * lastScale.current;
          newScale = Math.max(minScale, Math.min(maxScale, newScale));

          scale.setValue(newScale);
          onPinch?.(newScale);
        }
        // Pan (one finger)
        else if (currentTouches.length === 1) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
          onPan?.(gestureState.dx, gestureState.dy);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        // Update last scale for next pinch gesture
        lastScale.current = scale._value;
        touches.current = [];

        // Detect swipe (fast movement in one direction)
        const velocityThreshold = 0.5;
        const distanceThreshold = 50;

        if (Math.abs(gestureState.vx) > velocityThreshold ||
            Math.abs(gestureState.vy) > velocityThreshold) {

          const direction = {
            x: Math.abs(gestureState.dx) > distanceThreshold
              ? (gestureState.dx > 0 ? 'right' : 'left')
              : null,
            y: Math.abs(gestureState.dy) > distanceThreshold
              ? (gestureState.dy > 0 ? 'down' : 'up')
              : null
          };

          if (direction.x || direction.y) {
            onSwipe?.(direction);
          }
        }

        // Reset translation with spring animation
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true
        }).start();

        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    })
  ).current;

  const resetTransform = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true
      })
    ]).start();

    lastScale.current = 1;
  }, []);

  return {
    panResponder,
    transform: {
      scale,
      translateX,
      translateY
    },
    resetTransform
  };
};

/**
 * Hook for swipe-to-dismiss drawer/modal
 */
export const useSwipeToDismiss = ({
  threshold = 100,
  onDismiss
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

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
        if (lastGestureDy.current > threshold) {
          // Dismiss
          Animated.timing(translateY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            onDismiss?.();
          });
        } else {
          // Spring back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11
          }).start();
        }
      }
    })
  ).current;

  return {
    panResponder,
    translateY
  };
};

/**
 * Hook for horizontal tab swipe navigation
 */
export const useTabSwipe = ({
  tabs,
  activeIndex,
  onSwipeLeft,
  onSwipeRight
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },

      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 50;

        if (gestureState.dx > swipeThreshold && activeIndex > 0) {
          onSwipeRight?.();
        } else if (gestureState.dx < -swipeThreshold && activeIndex < tabs.length - 1) {
          onSwipeLeft?.();
        }

        // Reset position
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    })
  ).current;

  return {
    panResponder,
    translateX
  };
};

export default {
  useTouchGestures,
  useSwipeToDismiss,
  useTabSwipe
};
