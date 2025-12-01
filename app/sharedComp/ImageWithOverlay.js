import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";

import QuickActionsBg from '../../assets/images/quickActionsBg.png';

const ImageWithOverlay = () => {
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={QuickActionsBg}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
        <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Text
                style={{
                  color: CssColors.white,
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  borderColor: CssColors.white,
                  borderWidth: 1,
                  fontSize: 8,
                  lineHeight: 10,
                  borderRadius: 4,
                }}
              >
                Pending
              </Text>
            </View>
            <Text
              style={{
                color: CssColors.white,
                fontSize: 12,
                lineHeight: 20,
                fontWeight: "bold",
                marginTop: 6,
              }}
            >
              Complete KYC
            </Text>
            <Text
              style={{
                color: CssColors.white,
                fontSize: 10,
                lineHeight: 12,
                fontWeight: "normal",
              }}
            >
              Mandatory step
            </Text>
            <Text
              style={{
                color: CssColors.white,
                fontSize: 8,
                lineHeight: 12,
                fontWeight: "normal",
                marginTop: 10,
              }}
            >
              Personal information
            </Text>
            <Text
              style={{
                color: CssColors.white,
                fontSize: 8,
                lineHeight: 12,
                fontWeight: "normal",
              }}
            >
              Gov. approved document only
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Document")}
              style={{
                backgroundColor: CssColors.primaryColor,
                paddingVertical: 4,
                width: 72,
                marginTop: 5,
                marginBottom: 5,
              }}
            >
              <Text
                style={{
                  color: CssColors.white,
                  fontSize: 12,
                  lineHeight: 12,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Upload
              </Text>
            </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 153,
    height: 133,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    borderRadius: 10,
  },
  overlay: {
    padding: 10,
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

export default ImageWithOverlay;
