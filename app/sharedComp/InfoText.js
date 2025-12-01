import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { CssColors } from "../css/css_colors";

const InfoText = ({
  content,
  isCurrency = false,
  isBold = false,
  colorStyle = null,
  customStyle = [],
  reducedFontText = null, // Text that should have reduced font size
  reducedFontSizeStyle = null, // Style for reduced font text
  numberOfLines = null, // Optional numberOfLines prop
  ellipsizeMode = null, // Optional ellipsizeMode prop
}) => {
  const baseStyle = [styles.baseText];

  // Add optional styles dynamically
  if (isBold) baseStyle.push(styles.fontWeight600);
  if (colorStyle) baseStyle.push(colorStyle);

  // Merge base style with any additional custom styles passed as props
  const finalStyle = [...baseStyle, ...customStyle];

  return (
    <Text
      style={finalStyle}
      numberOfLines={numberOfLines} // Apply numberOfLines if provided
      ellipsizeMode={ellipsizeMode} // Apply ellipsizeMode if provided
    >
      {isCurrency && "\u20B9 "}
      {isCurrency ? content?.toString().split('.')[0] : content}
      {reducedFontText && (
        <Text style={reducedFontSizeStyle}>{" "}{reducedFontText}</Text>
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  baseText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 12,
    fontWeight: "400",
    paddingTop: 5,
  },
  fontWeight600: {
    fontWeight: '600',
  },
});

export default InfoText;