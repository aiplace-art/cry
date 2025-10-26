import React, { useState } from 'react';
import {
  Image,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';

/**
 * Optimized image component with lazy loading
 * Uses FastImage for better performance
 */
const ImageOptimized = ({
  source,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  placeholder,
  onLoad,
  onError,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = (e) => {
    setLoading(false);
    setError(true);
    onError?.(e);
  };

  // Convert priority to FastImage priority
  const getFastImagePriority = () => {
    switch (priority) {
      case 'low':
        return FastImage.priority.low;
      case 'high':
        return FastImage.priority.high;
      default:
        return FastImage.priority.normal;
    }
  };

  if (Platform.OS === 'web') {
    // Use regular Image for web
    return (
      <View style={style}>
        <Image
          source={source}
          style={[StyleSheet.absoluteFill, style]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#00E5FF" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={style}>
      <FastImage
        source={{
          uri: typeof source === 'string' ? source : source.uri,
          priority: getFastImagePriority(),
        }}
        style={[StyleSheet.absoluteFill, style]}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      {loading && !error && (
        <View style={styles.loadingContainer}>
          {placeholder || <ActivityIndicator color="#00E5FF" />}
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
});

export default ImageOptimized;
