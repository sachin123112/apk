import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";
import React, { useState } from "react";
import { SiteTexts } from "../texts/SiteTexts";
import { CssColors } from "../css/css_colors";
import HideKeyboard from "../sharedComp/HideKeyboard";
import common_styles from "../css/common_styles";
import {
  getStringData,
  storeObjectData,
  getObjectData,
} from "../sharedComp/AsyncData";
import { SiteConstants } from "../SiteConstants";
import ProfileIconSVG from "./svgs/ProfileIconSVG";
import CommonService from "../services/CommonService";
import DeviceInfo from "react-native-device-info";
import { resetToRootTab } from "../utils/RootNavigation";

const Profile = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const appVersion = DeviceInfo.getVersion();
  const checkPlatform = Platform.OS.toUpperCase();

  const logout = async () => {
    await AsyncStorage.clear();
    await auth().signOut();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  }

  const confirmProfile = async () => {
    if (name == "") {
      // show alert
      alert("Please enter name.");
    } else {
      if (!isNameValid) {
        alert("Please enter valid name.");
        setIsLoading(false);
        return;
      } else if (email.length > 0 && emailValidate(email) === false) {
        alert("Please enter valid email address");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const mobileNumber = await getStringData("mobileNumber");
      const number = mobileNumber ? mobileNumber.replace("+91", "") : logout();
      const url = `${SiteConstants.API_URL}user/v2/createUser?phoneNumber=${number}`;
      console.log("Url ", url);
      CommonService.commonPost(navigation, url, {})
        .then(async (data) => {
          if (data != undefined) {
            console.log("jj data ", data);
            await storeObjectData("userData", data);
            const updateUserData = await updateData();
            if (updateUserData !== null) {
              console.log('went inside updateUserData')
              if (updateUserData.phoneNumber != null) {
                await storeObjectData("userData", updateUserData);
                resetToRootTab("Home", {});
              } else {
                console.log("Unable to update ", updateUserData);
              }
            }
          } else {
            alert(
              data?.errorMessage ?? "something went wrong, please try again 1"
            );
          }
        })
        .catch((error) => {
          console.log(error, "something went wrong, please try again");
          alert("something went wrong, please try again 2");
          setIsLoading(false);
        });
    }
  };

  const updateData = async () => {
    let body = await getObjectData("userData");
    if (body && body.data) {
      body = body.data;
    }
    const token = await getStringData("token");
    const memberAcc = body["individualMemberAccount"];
    const memberName = { ...memberAcc, ["name"]: name };
    const memberEmail = {
      ...memberName,
      ["email"]: email ? email : "",
    };
    var finalBoday = {
      ...body,
      ["individualMemberAccount"]: memberEmail,
      token,
    };
    finalBoday = { ...finalBoday, roles: [{ role: "S" }] };
    delete finalBoday["lastModifiedOn"];
    try {
      const response = await fetch(
        `${SiteConstants.API_URL}user/v2/updateUser`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: "Bearer " + token,
            "X-App-Version": appVersion,
            "X-Platform": checkPlatform
          },
          body: JSON.stringify(finalBoday),
        }
      );
      const json = await response.json();
      if (json) {
        setIsLoading(false);
        return json;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const emailValidate = (text) => {
    let reg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (reg.test(text) === false) {
      setIsEmailValid(false);
      return false;
    } else {
      setIsEmailValid(true);
      return true;
    }
  };

  const nameValidate = (text) => {
    let reg = SiteConstants.ALPHABET_WITH_SPACE_REGEX;
    if (reg.test(text) === false) {
      setName(text);
      setIsNameValid(false);
      return false;
    } else {
      setName(text);
      setIsNameValid(true);
    }
  };

  return (
    <View
      style={
        !isLoading
          ? common_styles.container_document
          : common_styles.center_align
      }
    >
      <HideKeyboard>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={CssColors.textColorSecondary}
          />
        ) : (
          <KeyboardAvoidingView style={common_styles.container}>
            <ProfileIconSVG width={82} height={82} />
            <Text
              style={[common_styles.primary_title, common_styles.paddinglr_45]}
            >
              {SiteTexts.profile_welcome}
            </Text>
            <Text
              style={[common_styles.primary_title, common_styles.paddinglr_45]}
            >
              {SiteTexts.profile_title}
            </Text>
            <Text
              style={[
                common_styles.profile_sub_title,
                common_styles.paddinglr_45,
              ]}
            >
              {SiteTexts.profile_subTitle}
            </Text>
            <TouchableWithoutFeedback>
              <TextInput
                style={common_styles.primary_input}
                onChangeText={(text) => nameValidate(text)}
                value={name}
                placeholder={SiteTexts.profile_name}
                placeholderTextColor={CssColors.primaryPlaceHolderColor}
              />
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback>
              <TextInput
                style={common_styles.primary_input}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder={SiteTexts.profile_email}
                placeholderTextColor={CssColors.primaryPlaceHolderColor}
                keyboardType="email-address"
              />
            </TouchableWithoutFeedback>

            <TouchableOpacity
              onPress={() => confirmProfile()}
              // disabled={!name.length}
              style={[
                common_styles.primary_button,
                // !name.length && common_styles.primary_button_disabled,
              ]}
            >
              <Text
                style={[
                  common_styles.primary_button_text,
                  // !name.length && common_styles.primary_button_text_disabled,
                ]}
              >
                {SiteTexts.profile_button_title}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}
      </HideKeyboard>
    </View>
  );
};

export default Profile;
