import React, { useEffect, useRef } from 'react';
import { Animated, Keyboard, Dimensions, Platform } from 'react-native';
 
const KeyboardAwareFooter = ({
  children,
  style,
  enabled = true,
  customOffset = 0,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
 
  useEffect(() => {
    if (!enabled) {
      return;
    }
 
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
 
    const showSub = Keyboard.addListener(showEvent, e => {
      const keyboardHeight = e.endCoordinates?.height || 0;
 
      // Base offset: directly above keyboard
      let baseOffset = 0;
 
      // Optional small tweak per platform if you still want it
      if (!customOffset) {
        if (Platform.OS === 'ios') {
          // very small nudge only if keyboard is really tall
          if (keyboardHeight > screenHeight * 0.4) {
            baseOffset = -10;
          }
        } else {
          // Android: avoid big magic numbers, just a slight lift for big keyboards
          const ratio = keyboardHeight / screenHeight;
          if (ratio > 0.35) {
            baseOffset = -12;
          } else if (ratio > 0.25) {
            baseOffset = -6;
          }
        }
      }
 
      const finalOffset = customOffset || baseOffset;
 
      Animated.timing(translateY, {
        toValue: -keyboardHeight + finalOffset,
        duration: 220,
        useNativeDriver: false, // layout transform on non‑composited view
      }).start();
    });
 
    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    });
 
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [enabled, customOffset, screenHeight, translateY]);
 
  return (
<Animated.View
      style={[
        style,
        enabled && { transform: [{ translateY }] },
      ]}
>
      {children}
</Animated.View>
  );
};
 
export default KeyboardAwareFooter;