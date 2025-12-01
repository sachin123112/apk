import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions, TouchableOpacity, Text } from 'react-native';
import { CssColors } from '../css/css_colors';

const DefaultBottomSheet = ({ visible, onClose, children, height = 'auto' }) => {
  const [slideAnimation] = useState(new Animated.Value(0));
  const screenHeight = Dimensions.get('window').height;
  
  // Calculate the bottom sheet height based on prop or use auto sizing
  const modalHeight = height === 'auto' ? undefined : 
    typeof height === 'number' ? height : 
    height.includes('%') ? screenHeight * (parseInt(height) / 100) : 300;
  
  useEffect(() => {
    if (visible) {
      // Animate the bottom sheet up when visible
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate the bottom sheet down when hiding
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  // Calculate translateY based on the animation value
  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Grey overlay that can be tapped to close the bottom sheet */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Bottom sheet content */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            { transform: [{ translateY }] },
            modalHeight ? { height: modalHeight } : {}
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Grey background overlay
  },
  bottomSheet: {
    backgroundColor: 'white',
    padding: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    // Shadow for Android
    elevation: 6,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'flex-end',
  },
  closeButtonText: {
    fontSize: 16,
    color: CssColors.primaryColor,
    fontWeight: '600',
  },
});

export default DefaultBottomSheet;