import React from 'react';
import { View, Text } from 'react-native';
import { Slider } from "@miblanchard/react-native-slider";
import { CssColors } from "../css/css_colors";
import ChitIconDisplay from './ChitIconDisplay';
import common_styles from "../css/common_styles";
 
const MyChitTopIconAndSlider = ({ chitAmount, chitName, chitGroupName, runningInstall, numberOfInstallment }) => {
 
  const getSliderColors = () => {
    if (runningInstall === 0) {
      return {
        minimumTrackTintColor: "#8F9BB3",
        maximumTrackTintColor: "#8F9BB3",
      };
    } else if (runningInstall >= numberOfInstallment) {
      return {
        minimumTrackTintColor: "#FF4A00",
        maximumTrackTintColor: "#FF4A00",
      };
    } else {
      return {
        minimumTrackTintColor: "#FF4A00",
        maximumTrackTintColor: "#8F9BB3",
      };
    }
  };
 
  const getThumbStyle = () => {
    const baseStyle = {
      width: 18,
      height: 18,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 30,
      borderColor: CssColors.locationPin,
      backgroundColor: CssColors.white,
      borderWidth: 1,
      transform: [{ rotate: "45deg" }],
      justifyContent: 'center',
      top: -12,
      alignItems: 'center',
    };
    if (runningInstall === 0) {
      return { ...baseStyle, marginLeft: -7 };
    }
    if (runningInstall === numberOfInstallment) {
      return { ...baseStyle, marginRight: -8 };
    }
    return baseStyle;
  };
 
  const sliderColors = getSliderColors();
  const thumbStyle = getThumbStyle();
 
  const containerStyles = {
    container: {
      width: '100%',
      paddingHorizontal: 10,
      flexDirection: 'row',
    },
    leftSection: {
      flexDirection: 'row',
      flex: 0.8,
      marginRight: 10,
    },
    iconColumn: {
      width: 35,
      justifyContent: 'center',
    },
    contentColumn: {
      flex: 1,
      paddingHorizontal: 10,
      paddingTop: 5,
      justifyContent: 'center',
    },
    nameContainer: {
      flexDirection: 'column',
      flex: 1,
    },
    chitGroupRow: {
      flexDirection: 'row',
    },
    sliderSection: {
      flex: 0.2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    sliderContainer: {
      width: 60,
      height: 25,
      marginHorizontal: 4,
      justifyContent: 'center',
    },
    numberText: {
      color: CssColors.primaryColor,
      fontSize: 9,
      textAlign: 'center',
    },
    customThumbTextContainer: {
      transform: [{ rotate: "-45deg" }],
      justifyContent: 'center',
      alignItems: 'center',
    },
    customThumbText: {
      color: CssColors.locationPin,
      fontSize: 8,
      fontWeight: '600',
    },
    new_chits_amount_text_myChitDetails: {
      color: CssColors.primaryColor,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
    },
    new_chits_sub_tags: {
      color: CssColors.primaryPlaceHolderColor,
      fontSize: 10,
      marginTop: 4,
      fontWeight: '400'
    },
  };
 
  const CustomThumb = (currentValue) => (
    <View style={thumbStyle}>
      <View style={containerStyles.customThumbTextContainer}>
        <Text style={containerStyles.customThumbText}>
          {currentValue ?? '0'}
        </Text>
      </View>
    </View>
  );
 
  return (
    <View style={containerStyles.container}>
      <View style={containerStyles.leftSection}>
        <View style={containerStyles.iconColumn}>
          <ChitIconDisplay
            chitValue={chitAmount}
            imageStyle={common_styles.new_chits_logo_icon}
          />
        </View>
 
        <View style={containerStyles.contentColumn}>
          <View style={containerStyles.nameContainer}>
            <Text
              style={containerStyles.new_chits_amount_text_myChitDetails}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {chitName}
            </Text>
            <View style={containerStyles.chitGroupRow}>
              <Text
                style={containerStyles.new_chits_sub_tags}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {chitGroupName}
              </Text>
            </View>
          </View>
        </View>
      </View>
 
      <View style={containerStyles.sliderSection}>
        <Text style={containerStyles.numberText}>01</Text>
        <View style={containerStyles.sliderContainer}>
          <Slider
            value={runningInstall ?? 1}
            minimumValue={1}
            maximumValue={numberOfInstallment}
            step={1}
            minimumTrackTintColor={sliderColors.minimumTrackTintColor}
            maximumTrackTintColor={sliderColors.maximumTrackTintColor}
            disabled
            renderThumbComponent={() => CustomThumb(runningInstall ?? "1")}
          />
        </View>
        <Text style={containerStyles.numberText}>
          {numberOfInstallment}
        </Text>
      </View>
    </View>
  );
};
 
export default MyChitTopIconAndSlider;