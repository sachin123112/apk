import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
  View,
  StyleSheet,
  BackHandler,
  Linking,
  Alert,
} from "react-native";
import common_styles from "../css/common_styles";
import { SiteTexts } from "../texts/SiteTexts";
import { CssColors } from "../css/css_colors";
import { SiteConstants } from "../SiteConstants";
import HideKeyboard from "../sharedComp/HideKeyboard";
import {
  storeStringData,
  getObjectData,
  storeObjectData,
  getStringData,
} from "../sharedComp/AsyncData";
// Import modular Firebase functions
import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut
} from "@react-native-firebase/auth";
import CommonService from "../services/CommonService";
import BackIconSVG from "./svgs/BackIconSVG";
import Anticons from 'react-native-vector-icons/AntDesign';
import { isInvalidPhoneNumber } from "../sharedComp/Utils";
import DeviceInfo from "react-native-device-info";
import { resetToRootTab } from "../utils/RootNavigation";

// Initialize auth once
const auth = getAuth();

const InvalidPhoneNumber = () => {
  return (
    <View style={common_styles.login_error_container}>
      <Image
        style={common_styles.error_icon}
        source={require("../../assets/error.png")}
      />
      <Text style={common_styles.login_error_text}>
        {SiteTexts.error_phone_invalid}
      </Text>
    </View>
  );
};

const ManyRequests = () => {
  return (
    <View style={common_styles.login_error_container}>
      <Image
        style={common_styles.error_icon}
        source={require("../../assets/error.png")}
      />
      <Text style={common_styles.login_error_text}>
        {SiteTexts.error_too_many_request}
      </Text>
    </View>
  );
};

const OtpInvalid = () => {
  return (
    <View style={common_styles.login_error_container}>
      <Image
        style={common_styles.error_icon}
        source={require("../../assets/error.png")}
      />
      <Text style={common_styles.login_error_text}>
        {SiteTexts.error_invalid_otp}
      </Text>
    </View>
  );
};

const OtpExpired = () => {
  return (
    <View style={common_styles.login_error_container}>
      <Image
        style={common_styles.error_icon}
        source={require("../../assets/error.png")}
      />
      <Text style={common_styles.login_error_text}>
        {SiteTexts.error_otp_expired}
      </Text>
    </View>
  );
};

const UserDisabled = () => {
  return (
    <View style={common_styles.login_error_container}>
      <Image
        style={common_styles.error_icon}
        source={require("../../assets/error.png")}
      />
      <Text style={common_styles.login_error_text}>
        {SiteTexts.error_user_disabled}
      </Text>
    </View>
  );
};

const Login = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoginScreen, setIsLoginScreen] = useState(true);
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [counter, setCounter] = useState(0);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [tooManyRequests, setTooManyRequests] = useState(false);
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [isUserDisabled, setIsUserDisabled] = useState(false);
  const [isResendCodeDisabled, setIsResendCodeDisabled] = useState(true);
  const [count, setCount] = useState(0);
  const [contactNumber, setContactNumber] = useState(9000000000)
  const [message, setMessage] = useState("")
  const [isBlocked, setIsBlocked] = useState(false);
  const appVersion = DeviceInfo.getVersion();
  const checkPlatform = Platform.OS.toUpperCase();

  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  // Handle user state changes
  async function handleAuthStateChanged(user) {
    if (user) {
      const token = await user.getIdToken();
      await storeStringData("token", token);
      await storeStringData("userId", user.uid);
      await storeStringData("mobileNumber", user.phoneNumber);

      setIsLoading(true);
      await updateToken();
      let fetchedUser = await fetchUser();

      if (fetchedUser != null && fetchedUser !== undefined) {
        await storeStringData("memberID", fetchedUser.id ?? "");

        if (fetchedUser === "null" || fetchedUser === undefined) {
          setIsLoading(false);
          setIsOtpScreen(false);
          setIsLoginScreen(true);
          setPhoneNumber("");
          setVerificationCode("");
          navigation.navigate("Profile");
        } else if (fetchedUser?.roles === null) {
          setIsLoading(false);
          navigation.navigate("Profile");
        } else {
          setIsLoading(false);
          setIsOtpScreen(false);
          setIsLoginScreen(true);
          setPhoneNumber("");
          setVerificationCode("");
          resetToRootTab("Home", {});
        }
      } else {
        setIsLoading(false);
        setIsLoginScreen(true);
        setPhoneNumber("");
        setVerificationCode("");
        Alert.alert("Unable to login. Please try again.");
      }
    }
  }

  useEffect(() => {
    // Subscribe to auth state changes
    const subscriber = onAuthStateChanged(auth, handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const enablePhone = async () => {
    setIsLoading(true);
    setIsOtpValid(false);
    setIsOtpExpired(false);
    setIsOtpScreen(false);
    setIsUserDisabled(false);
    try {
      const response = await fetch(
        `${SiteConstants.API_URL}login/enablePhone?phoneNumber=${phoneNumber}`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-App-Version": appVersion,
            "X-Platform": checkPlatform
          },
        }
      );
      const textData = await response.text();
      const json = textData ? JSON.parse(textData) : undefined;
      if (json !== undefined) {
        return json;
      }
    } catch (error) {
      console.error("------", error);
    }
  };

  const checkPhone = async () => {
    setIsLoading(true);
    setIsOtpValid(false);
    setIsOtpExpired(false);
    setIsOtpScreen(false);
    setIsUserDisabled(false);
    try {
      const response = await fetch(
        `${SiteConstants.API_URL}login/checkPhone?phoneNumber=${phoneNumber}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-App-Version": appVersion,
            "X-Platform": checkPlatform
          },
        }
      );
      const textData = await response.text();
      const json = textData ? JSON.parse(textData) : undefined;
      if (json !== undefined) {
        if (json.disabled) {
          const disabledTime = json.disabledOn;
          const then = new Date(disabledTime);
          const now = new Date();
          const msBetweenDates = Math.abs(then.getTime() - now.getTime());
          // 👇️ convert ms to hours                  min  sec   ms
          const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);
          if (hoursBetweenDates < 1) {
            return json.disabled;
          } else {
            const isEnablePhone = await enablePhone();
            if (isEnablePhone) {
              return isEnablePhone.disabled;
            }
          }
        }
        return json.disabled;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkBlockStatus = async () => {
    setIsLoading(true);
    await storeStringData('PhoneNumber', phoneNumber);
    const response = await fetch(
      `${SiteConstants.API_URL}login/check_status/${phoneNumber}`,
      {
        method: 'GET',
        headers: {
          Accept: '*/*',
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      },
    );
    const textData = await response.text();
    const status = textData ? JSON.parse(textData) : undefined;
    setIsBlocked(false);
    const number = status?.customerSupportPhone.length > 10 ? status?.customerSupportPhone.split(" ")[1] : status?.customerSupportPhone;
    const messages = status?.message
    await storeStringData('message', messages);
    await storeStringData('contactPhoneNumber', number);
    setMessage(messages)
    setContactNumber(number)
    setIsLoading(false);
    return status?.locked

  }
  const handleContact = async () => {
    Linking.openURL(`tel:${contactNumber}`);
    BackHandler.exitApp();
  };

  const sendVerification = async () => {
    if (!isInvalidPhoneNumber(phoneNumber)) {
      setIsPhoneNumberValid(true);
      return;
    }
    const status = await checkBlockStatus()
    if (status) {
      setIsBlocked(true);
    } else {
      setIsLoading(true);
      setIsLoginScreen(false);
      setTooManyRequests(false);
      setIsPhoneNumberValid(false);
      setTooManyRequests(false);
      const checkUserDisabled = await checkPhone();
      if (checkUserDisabled) {
        setIsLoginScreen(true);
        setIsUserDisabled(true);
        setIsLoading(false);
        return;
      }
      try {
        let URL = `${SiteConstants.API_URL}sms/v2/generate-login-otp/USER/${phoneNumber}`;
        const confirmation = await CommonService.commonGetOtp(URL);
        if (confirmation) {
          setIsLoading(false);
          setIsLoginScreen(false);
          setIsOtpScreen(true);
          setIsResendCodeDisabled(true);
          setCounter(120);
          resendCount(120);
        } else {
          Alert.alert("Faile to send otp");
          setIsLoading(false);
          setIsLoginScreen(true);
        }
      } catch (error) {
        console.log(error, 'error-->', error.code);
        setIsLoading(false);
        setIsLoginScreen(true);
      }
    }
  };

  const fetchUser = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData("userData", response);
      await storeStringData("memberID", response.id ?? "");
      return response;
    } catch (error) {
      console.log("catch ====>", error);
      return "null";
    }
  };

  const confirmCode = async () => {
    setIsLoading(true);
    setIsOtpValid(false);
    setIsOtpExpired(false);
    setIsOtpScreen(false);
    setIsUserDisabled(false);
    try {
      let URL = `${SiteConstants.API_URL}sms/v2/verify-login-otp?phoneNumber=${phoneNumber}&otp=${verificationCode}&otpType=USER`;
      const response = await CommonService.commonPostOtp(URL);
      const firebaseToken = response?.firebaseToken;
      if (firebaseToken) {
        await storeStringData("mobileNumber", phoneNumber);

        const userCredential = await signInWithCustomToken(auth, firebaseToken);
        onAuthStateChanged(userCredential.user);
      } else {
        console.log(response, "responseresponseresponseresponse");

        if (response.massage == "Invalid OTP") {
          setCount(count + 1);
          setIsOtpScreen(true);
          setIsOtpValid(true);
          if (count >= 3) {
            disableUser();
          }
        } else if (response.massage == "OTP time-limit exceeded") {
          setIsOtpExpired(true);
        } else {
          Alert.alert("Faile to check the OTP");
        }
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log('>>>>>>>>>>', error);
    }
  };

  const updateToken = async () => {
    const url = `${SiteConstants.API_URL}user/v2/updateToken`;
    try {
      const json = await CommonService.commonPost(navigation, url, {});
      console.log(json, "update token after calling updateToken");
      return json;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const disableUser = async () => {
    setIsLoading(true);
    setIsOtpValid(false);
    setIsOtpExpired(false);
    setIsOtpScreen(false);
    setIsUserDisabled(false);
    try {
      const response = await fetch(
        `${SiteConstants.API_URL}login/disablePhone?phoneNumber=${phoneNumber}`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-App-Version": appVersion,
            "X-Platform": checkPlatform
          },
        }
      );
      const textData = await response.text();
      const json = textData ? JSON.parse(textData) : undefined;
      if (json !== undefined) {
        setIsLoading(false);
        setIsUserDisabled(true);
      }
    } catch (error) {
      setIsLoading(false);
      // console.error(error);
    }
  };

  const resendCount = (count) => {
    count > 0 && setTimeout(() => setCounter(count - 1), 1000);
    if (count === 0) {
      setIsResendCodeDisabled(false);
      return;
    }
  };

  const resendCode = () => {
    setVerificationCode("");
    setIsOtpExpired(false);
    setIsOtpValid(false);
    sendVerification();
  };

  const checkUserLoggedIn = async () => {
    let userData = await getObjectData("userData");
    if (userData && userData.data) {
      userData = userData.data;
    }
    if (
      userData !== null &&
      (userData?.individualMemberAccount?.name === null ||
        userData?.individualMemberAccount?.name === "" ||
        userData?.individualMemberAccount?.name === undefined)
    ) {
      navigation.navigate("Profile");
      return;
    }
    if (
      userData !== null &&
      userData?.individualMemberAccount?.name &&
      userData?.individualMemberAccount?.name.length
    ) {
      navigation.navigate("TabNavigation", {
        screen: "Home",
      });
    }
  };

  useEffect(() => {
    // checkUserLoggedIn();
    !isLoginScreen ? resendCount(counter) : "";
  }, [counter]);

  const backToPhoneNumberScreen = () => {
    setIsOtpValid(false);
    setIsOtpExpired(false);
    setIsLoginScreen(true);
    setIsOtpScreen(false);
  };

  return (
    <HideKeyboard>
      <KeyboardAvoidingView style={common_styles.container}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={CssColors.textColorSecondary}
          />
        ) : isLoginScreen && !isOtpScreen ? (
          <>
            <Image
              style={common_styles.login_logo}
              source={require("../../assets/ChitKart_Logo.png")}
            />
            <Text
              style={[common_styles.primary_title, common_styles.paddinglr_45]}
            >
              {SiteTexts.login_2_title}
            </Text>
            <View style={common_styles.Login_input_container}>
              <TextInput
                style={common_styles.Login_input}
                onChangeText={(e) => {
                  if (isPhoneNumberValid) {
                    setIsPhoneNumberValid(false);
                  }
                  setPhoneNumber(e)
                  setIsBlocked(false)
                }}
                value={phoneNumber}
                placeholder={SiteTexts.text_phone_number}
                placeholderTextColor={CssColors.primaryPlaceHolderColor}
                keyboardType="numeric"
                maxLength={10}
                minLength={9}
              />

              <TouchableOpacity onPress={() => {
                setPhoneNumber("")
                setIsBlocked(false);
              }} style={common_styles.Login_input_iconContainer}>
                <Anticons name="close" size={25} color="black" />
              </TouchableOpacity>
            </View>
            {isPhoneNumberValid ? (
              <>
                <InvalidPhoneNumber />
              </>
            ) : null}
            {tooManyRequests ? (
              <>
                <ManyRequests />
              </>
            ) : null}
            {isUserDisabled ? (
              <>
                <UserDisabled />
              </>
            ) : null}
            {isBlocked && <View style={common_styles.login_error_container} >
              <View style={{ marginHorizontal: 2 }}>
                <Anticons name='exclamationcircleo' color={'red'} size={20}></Anticons>
              </View>
              <Text style={{ display: "flex", alignItems: 'center', fontSize: 16, color: 'red' }}>
                {"  "}{message} - <TouchableOpacity onPress={handleContact} >
                  <Text style={{ color: 'red', fontWeight: '600', lineHeight: 13, textDecorationLine: 'underline' }}> {contactNumber}</Text>
                </TouchableOpacity>
              </Text>
            </View>}
            <TouchableOpacity
              onPress={() => sendVerification()}
              style={[
                common_styles.primary_button,
                !phoneNumber.length && common_styles.primary_button_disabled,
                ,
              ]}
              disabled={!phoneNumber.length}
            >
              <Text
                style={[
                  common_styles.primary_button_text,
                  !phoneNumber.length &&
                  common_styles.primary_button_text_disabled,
                  ,
                ]}
              >
                Get Code
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={common_styles.back_icon_container}
              onPress={() => backToPhoneNumberScreen()}
            >
              <BackIconSVG width={48} height={48} />
            </TouchableOpacity>
            <Image
              style={common_styles.login_logo}
              source={require("../../assets/ChitKart_Logo.png")}
            />
            <Text
              style={[common_styles.primary_title, common_styles.paddinglr_45]}
            >
              {SiteTexts.login_1_title}
              {phoneNumber}
            </Text>
            <TouchableWithoutFeedback>
              <TextInput
                style={common_styles.primary_input}
                onChangeText={setVerificationCode}
                value={verificationCode}
                placeholder={SiteTexts.login_1_enter_otp}
                placeholderTextColor={CssColors.primaryPlaceHolderColor}
                maxLength={6}
                keyboardType="numeric"
              />
            </TouchableWithoutFeedback>
            {isOtpValid ? (
              <>
                <OtpInvalid />
              </>
            ) : null}
            {isOtpExpired ? (
              <>
                <OtpExpired />
              </>
            ) : null}
            {isUserDisabled ? (
              <>
                <UserDisabled />
              </>
            ) : null}
            <TouchableOpacity
              onPress={() => confirmCode()}
              style={common_styles.primary_button}
            >
              <Text style={common_styles.primary_button_text}>
                {SiteTexts.login_1_button_title}
              </Text>
            </TouchableOpacity>
            <View style={common_styles.flex_row}>
              <Text style={{ color: "black" }}>
                {SiteTexts.expiry_time_message} {counter} {SiteTexts.text_sec}
              </Text>
              <TouchableOpacity
                onPress={() => resendCode()}
                disabled={isResendCodeDisabled}
              >
                <Text
                  style={[
                    common_styles.secondary_button_text,
                    isResendCodeDisabled &&
                    common_styles.secondary_button_text_disabled,
                    ,
                  ]}
                >
                  {SiteTexts.login_1_resend_code}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </HideKeyboard>
  );
};

export default Login;
