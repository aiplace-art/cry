import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1920,
};

const MobileChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [screenSize, setScreenSize] = useState('mobile');
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  // Responsive breakpoint detection
  useEffect(() => {
    const updateScreenSize = () => {
      const width = Dimensions.get('window').width;
      if (width < BREAKPOINTS.mobile) {
        setScreenSize('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setScreenSize('tablet');
      } else if (width < BREAKPOINTS.desktop) {
        setScreenSize('desktop');
      } else {
        setScreenSize('ultrawide');
      }
    };

    const subscription = Dimensions.addEventListener('change', updateScreenSize);
    updateScreenSize();

    return () => subscription?.remove();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((text) => {
      // Implement search logic
      console.log('Search:', text);
    }, 300),
    []
  );

  // Handle send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiMessage = {
        id: Date.now() + 1,
        text: 'This is a response from the AI assistant.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show/hide bottom sheet
  const toggleBottomSheet = () => {
    const toValue = showBottomSheet ? 0 : 1;

    Animated.spring(bottomSheetAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    setShowBottomSheet(!showBottomSheet);
  };

  // Swipe gesture for message deletion
  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleDeleteMessage(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Render message item
  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        enabled={isUser}
      >
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.aiMessage,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.aiBubble,
              getResponsiveMessageStyle(),
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              {item.text}
            </Text>
            <Text style={styles.timestamp}>
              {item.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  // Get responsive message styles
  const getResponsiveMessageStyle = () => {
    switch (screenSize) {
      case 'mobile':
        return { maxWidth: '85%' };
      case 'tablet':
        return { maxWidth: '70%' };
      case 'desktop':
      case 'ultrawide':
        return { maxWidth: '60%' };
      default:
        return { maxWidth: '85%' };
    }
  };

  // Get responsive columns
  const getNumColumns = () => {
    switch (screenSize) {
      case 'mobile':
        return 1;
      case 'tablet':
        return 2;
      case 'desktop':
        return 3;
      case 'ultrawide':
        return 3;
      default:
        return 1;
    }
  };

  // Bottom sheet transform
  const bottomSheetTransform = bottomSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <TouchableOpacity
                onPress={toggleBottomSheet}
                style={styles.visualizeButton}
              >
                <Text style={styles.visualizeText}>Visualize</Text>
              </TouchableOpacity>
            </View>

            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#00E5FF"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Start a conversation with your AI assistant
                  </Text>
                </View>
              }
            />

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00E5FF" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            )}

            {/* Input Container - Fixed at bottom */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor="#666"
                value={input}
                onChangeText={text => {
                  setInput(text);
                  debouncedSearch(text);
                }}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                disabled={!input.trim() || loading}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          {/* Bottom Sheet for Agent Visualization */}
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: bottomSheetTransform }],
              },
            ]}
          >
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle}>Agent Network</Text>
              <TouchableOpacity
                onPress={toggleBottomSheet}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomSheetContent}>
              <Text style={styles.placeholderText}>
                Agent visualization will appear here
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1F3A',
    borderBottomWidth: 1,
    borderBottomColor: '#00E5FF20',
    ...Platform.select({
      ios: {
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00E5FF',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'Roboto' },
    }),
  },
  visualizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00E5FF',
    borderRadius: 20,
  },
  visualizeText: {
    color: '#0A0E27',
    fontWeight: '600',
    fontSize: 14,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: '#00E5FF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1A1F3A',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#00E5FF30',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#0A0E27',
  },
  aiText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginVertical: 4,
    borderRadius: 20,
  },
  deleteButton: {
    height: '100%',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loadingText: {
    color: '#00E5FF',
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1F3A',
    borderTopWidth: 1,
    borderTopColor: '#00E5FF20',
  },
  input: {
    flex: 1,
    backgroundColor: '#0A0E27',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#00E5FF30',
    marginRight: 8,
  },
  sendButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: '#00E5FF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#0A0E27',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#1A1F3A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#00E5FF30',
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
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00E5FF20',
  },
  bottomSheetHandle: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00E5FF',
    marginTop: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: '#666',
    lineHeight: 32,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default MobileChatInterface;
