import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  Platform
} from 'react-native';
import DesktopLayout from './DesktopLayout';
import TabletLayout from './TabletLayout';
import MobileLayout from './MobileLayout';

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: Infinity
};

const ResponsiveLayout = ({
  messages = [],
  agents = [],
  metrics = {},
  onSendMessage,
  onAgentSelect
}) => {
  const { width } = useWindowDimensions();
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    updateLayout();

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', updateLayout);

    return () => subscription?.remove();
  }, [width]);

  const updateLayout = () => {
    const { width, height } = Dimensions.get('window');

    // Determine device type
    if (width < BREAKPOINTS.mobile) {
      setDeviceType('mobile');
    } else if (width < BREAKPOINTS.tablet) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }

    // Determine orientation
    setOrientation(width > height ? 'landscape' : 'portrait');
  };

  const layoutProps = {
    messages,
    agents,
    metrics,
    onSendMessage,
    onAgentSelect,
    orientation
  };

  // Render appropriate layout based on device type
  switch (deviceType) {
    case 'mobile':
      return <MobileLayout {...layoutProps} />;
    case 'tablet':
      return <TabletLayout {...layoutProps} />;
    case 'desktop':
    default:
      return <DesktopLayout {...layoutProps} />;
  }
};

export default ResponsiveLayout;
