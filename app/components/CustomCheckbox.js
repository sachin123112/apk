import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

/**
 * CustomCheckBox - A simple, reliable checkbox implementation for React Native
 * that doesn't rely on native modules.
 *
 * @param {boolean} value - Current state of the checkbox (checked/unchecked)
 * @param {function} onValueChange - Function to call when checkbox is toggled
 * @param {object} style - Additional styles for the checkbox container
 * @param {boolean} disabled - Whether the checkbox is disabled
 * @param {object} boxType - Optional box shape ('square' or 'circle')
 */
const CustomCheckBox = ({
  value = false,
  onValueChange,
  style,
  disabled = false,
  boxType = 'square',
}) => {
  // Animation for the check mark
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  // Calculate border radius based on box type
  const borderRadius = boxType === 'square' ? 3 : 12;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !disabled && onValueChange(!value)}
      style={[styles.container, style]}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderRadius,
            backgroundColor: value ? '#2196F3' : 'transparent',
            borderColor: disabled ? '#CCCCCC' : value ? '#2196F3' : '#AAAAAA',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {value && (
          <Animated.View
            style={[
              styles.checkmark,
              {
                opacity: animatedValue,
                transform: [{ scale: animatedValue }],
              },
            ]}
          >
            <Text style={styles.checkmarkText}>✓</Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2, // Extra padding for touch area
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CustomCheckBox;