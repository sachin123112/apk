/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native';
import React from "react";
import { CssColors } from '../css/css_colors';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeHeader = () => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 12}}>
      <Icon name="notifications-outline" size={24} color={CssColors.primaryColor} />
    </View>
  );
};

export default HomeHeader;
