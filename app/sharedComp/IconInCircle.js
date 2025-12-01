/* eslint-disable react-native/no-inline-styles */
import {View} from 'react-native';
import React from 'react';
import Icon from "react-native-vector-icons/FontAwesome";
import IconTwo from "react-native-vector-icons/AntDesign";
import { CssColors } from "../css/css_colors";

const IconInCircle = ({name, circleSize, bgColor, borderWidth = 2, borderColor = "black", antDesign}) => (
    <View
      style={{
        width: circleSize,
        height: circleSize,
        backgroundColor: bgColor,
        borderRadius: .5 * circleSize,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderColor,
        borderWidth,
      }}
    >
      {antDesign ? 
      <IconTwo
      name={name}
      size={50}
      color={CssColors.primaryTitleColor}
    /> :
    <Icon
        name={name}
        size={50}
        color={CssColors.primaryTitleColor}
      />
      }
    </View>
  )

  export default IconInCircle;