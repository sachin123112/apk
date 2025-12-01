import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { CssColors } from "../css/css_colors";

const NameTitle = ({ title, color, fontSize }) => {
  const dynamicStyle = {
    ...(color && { color }),
    ...(fontSize && { fontSize }), // Only adds fontSize if it's provided
  };

  return (
    <Text style={[styles.chit_container_row2_inner_header, dynamicStyle]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  chit_container_row2_inner_header: {
    color: CssColors.lightGreyFour,
    fontSize: 9,
    fontWeight: '400'
  },
});

export default NameTitle;