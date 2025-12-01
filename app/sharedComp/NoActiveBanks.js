/* eslint-disable react-native/no-inline-styles */
import { View, StyleSheet, Text, Pressable } from "react-native";
import React from "react";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import { useNavigation } from "@react-navigation/native";
import NoBanksIconSVG from '../pages/svgs/NoBanksIconSVG';

const NoActiveBanks = ({ contentTitle, contetsubTitle, buttonTitle }) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.contentContainer, common_styles.shadowProp]}>
      <NoBanksIconSVG width={130} height={130} />
      <Text style={styles.contentTitle}>{contentTitle}</Text>
      <Text style={styles.contetsubTitle}>{contetsubTitle}</Text>
      <Pressable
        onPress={() => navigation.navigate("AddBank")}
        style={common_styles.primary_button}
      >
        <Text style={common_styles.primary_button_text}>{buttonTitle}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 10,
    borderRadius: 12,
    backgroundColor: CssColors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  contentTitle: {
    fontSize: 22,
    paddingVertical: 10,
    color: CssColors.primaryColor,
    fontWeight: "600",
  },
  contetsubTitle: {
    color: CssColors.primaryColor,
    fontSize: 16,
    paddingHorizontal: 75,
    textAlign: "center",
  },
});

export default NoActiveBanks;
