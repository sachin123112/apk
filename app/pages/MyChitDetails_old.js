import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import React from "react";
import StorageService from '../sharedComp/StorageService';
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import Icon from "react-native-vector-icons/Ionicons";
import IconButton from "react-native-vector-icons/AntDesign";
import { SiteTexts } from "../texts/SiteTexts";
import auth from "@react-native-firebase/auth";

const MyChitDetails = ({route, navigation}) => {
  const {id} = route.params;
  const logout = async () => {
    await StorageService.clear();
    await auth().signOut();
    navigation.navigate("Login");
  };

  const RoundBtn = () => {
    return (
      <View style={styles.roundBtnContainer}>
        <View style={styles.roundshape}>
          <Icon name="document-text-outline" size={60} style={styles.item} />
        </View>
      </View>
    );
  };

  const continueToChit = () => {
    navigation.navigate("ChitAgreementForm", {
      chitId: id,
    });
  };

  return (
    <SafeAreaView>
      <Text>This is My Chits Page</Text>
      {/* Pop up start here */}
      <View style={{ backgroundColor: "white", padding: 20 }}>
        <IconButton
          name="close"
          size={24}
          color={CssColors.primaryColor}
          style={styles.closeIcon}
        />
        <RoundBtn />
        <Text style={styles.complete_chit_popup_title}>
          {SiteTexts.chit_agreement_pop_up_title}
        </Text>
        <Text style={styles.complete_chit_popup_sub_title}>
          {SiteTexts.chit_agreement_pop_up_text_one}
        </Text>
        <Text style={[styles.complete_chit_popup_sub_title, styles.marginBottom20]}>
          {SiteTexts.chit_agreement_pop_up_text_two}
        </Text>
        <Pressable
          onPress={() => continueToChit()}
          style={[
            common_styles.button_three,
            common_styles.marginTop20,
            styles.marginBottom20,
          ]}
        >
          <Text style={common_styles.button_three_text}>{SiteTexts.continue_text}</Text>
        </Pressable>
      </View>
      {/* Pop up ends here */}
      <Pressable onPress={() => logout()}>
        <Text style={styles.textStyle}>{SiteTexts.text_logout}</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    textAlign: "center",
    color: "black",
  },
  closeIcon: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  roundBtnContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    alignSelf: "center",
    color: CssColors.textColorSecondary,
  },
  roundshape: {
    backgroundColor: "#004C8F1A",
    height: 120, //any of height
    width: 120, //any of width
    justifyContent: "center",
    borderRadius: 60, // it will be height/2
  },
  complete_chit_popup_title: {
    color: CssColors.primaryColor,
    fontSize: 22,
    textAlign: "center",
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10
  },
  complete_chit_popup_sub_title: {
    textAlign: "center",
    color: CssColors.primaryColor,
    fontSize: 14
  },
  marginBottom20: {
    marginBottom: 20
  }
});

export default MyChitDetails;
