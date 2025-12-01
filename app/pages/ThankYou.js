import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";

const ThankYou = ({ navigation }) => {
  const goToChitDetails = async () => {
    navigation.navigate("TabNavigation", {
      screen: "Home",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Content part */}
      <View style={styles.contentContainer}>
        <Icon name="check-circle" size={72} color={CssColors.green} />
        <Text style={styles.contentTitle}>Thank You</Text>
        <Text style={styles.contetsubTitle}>
          You have successfully register your chit
        </Text>
        <TouchableOpacity
          onPress={() => goToChitDetails()}
          style={common_styles.primary_button}
        >
          <Text style={common_styles.primary_button_text}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.appBackground,
  },
  defaultText: {
    color: CssColors.black,
    fontSize: 14,
  },
  defaultHeading: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 14,
  },
  contetsubTitle: {
    color: CssColors.primaryColor,
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 75,
    textAlign: "center",
  },
  contentDetails: {
    width: "100%",
    height: "auto",
    justifyContent: "space-around",
    alignItems: "space-around",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
  contentContainer: {
    margin: 10,
    paddingBottom: 40,
    borderRadius: 6,
    backgroundColor: CssColors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  headerText: {
    color: CssColors.primaryColor,
    fontSize: 14,
    paddingLeft: 16,
  },
  contentTitle: {
    fontSize: 20,
    paddingVertical: 10,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  moreMoney: {
    fontSize: 14,
    paddingVertical: 10,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  headerContainer: {
    flexDirection: "row",
    paddingTop: 10,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: "transparent",
    borderBottomColor: CssColors.homeDetailsBorder,
    height: 55,
    alignItems: "center",
  },
});

export default ThankYou;
