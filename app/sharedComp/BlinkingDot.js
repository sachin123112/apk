import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { CssColors } from "../css/css_colors";

const BlinkingDot = ({ size = 4, color = CssColors.green, duration = 500 }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0, // Fade out
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1, // Fade in
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );
    blinkAnimation.start();
  }, [fadeAnim, duration]);

  return (
    <Animated.View style={[styles.blinkingDot, { opacity: fadeAnim }]}>
      <Icon name="circle" size={size} color={color} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  blinkingDot: {
    marginRight: 3,
  },
});

export default BlinkingDot;
