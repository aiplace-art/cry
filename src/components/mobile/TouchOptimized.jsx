import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';

/**
 * Touch-optimized button component
 * Ensures minimum 44x44 tap target as per iOS/Android guidelines
 */
const TouchOptimized = ({
  children,
  onPress,
  style,
  minSize = 44,
  hapticFeedback = true,
  ...props
}) => {
  const handlePress = () => {
    if (hapticFeedback && Platform.OS === 'ios') {
      // Trigger haptic feedback on iOS
      const ReactNativeHapticFeedback = require('react-native-haptic-feedback');
      ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }

    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.touchTarget,
        {
          minWidth: minSize,
          minHeight: minSize,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchTarget: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        // iOS specific styles
      },
      android: {
        // Android specific styles
      },
    }),
  },
});

export default TouchOptimized;
