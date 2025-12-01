import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';

/**
 * ErrorView - A reusable component for displaying error messages
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {Function} props.onBackPress - Function to execute when back button is pressed
 * @param {string} props.icon - Icon name (defaults to 'alert-circle-outline')
 * @param {string} props.buttonText - Text for the back button (defaults to 'Go Back')
 * @param {string} props.iconColor - Color for the icon (defaults to textColorSecondary)
 */

const ErrorView = ({ 
  message, 
  onBackPress, 
  icon = 'alert-circle-outline',
  buttonText = 'Go Back',
  iconColor = CssColors.textColorSecondary
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, common_styles.shadowProp]}>
        <Icon
          name={icon}
          size={60}
          color={iconColor}
          style={styles.icon}
        />
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity
          onPress={onBackPress}
          style={[common_styles.primary_button, styles.button]}
        >
          <Text style={common_styles.primary_button_text}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CssColors.appBackground,
  },
  contentContainer: {
    width: '90%',
    borderRadius: 12,
    backgroundColor: CssColors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  icon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: CssColors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  }
});

export default ErrorView;
