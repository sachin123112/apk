import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import common_styles from "../css/common_styles";
// Import modular Firebase functions
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import CommonService from "../services/CommonService";
import { CssColors } from "../css/css_colors";
import { SiteConstants } from "../SiteConstants";
import { useEffect, useState } from "react";
import { storeObjectData, storeStringData } from "../sharedComp/AsyncData";

// Initialize auth once
const auth = getAuth();

const SplashView = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    setIsLoading(true);
    await storeObjectData("userDataP", "");
    await storeObjectData("userDataA", "");
    // Use onAuthStateChanged directly with auth instance
    const subscriber = onAuthStateChanged(auth, handleAuthStateChanged);
    return subscriber;
  };

  async function handleAuthStateChanged(user) {
    if (user) {
      const unikKey =`${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const token = await user.getIdToken();
      await storeStringData("unikKey", unikKey);
      await storeStringData("token", token);
      await storeStringData("userId", user.uid);
      await storeStringData("mobileNumber", user.phoneNumber);
      setIsLoading(true);
      var tokenResp = await updateToken();
      let roles = tokenResp?.roles;
      if (
        tokenResp !== undefined &&
        tokenResp?.phoneNumber &&
        roles &&
        roles[0]?.role == "S"
      ) {
        setIsLoading(false);
        navigation.navigate("TabNavigation", {
          screen: "Home",
        });
      } else if (
        tokenResp !== undefined && tokenResp !== null &&
        tokenResp?.phoneNumber &&
        roles === null
      ) {
        navigation.navigate("Profile");
      } else {
        console.log('going to login page in splashview');
        setIsLoading(false);
        navigation.navigate("Login");
      }
    } else {
      setIsLoading(false);
      navigation.navigate("Login");
    }
  }

  const updateToken = async () => {
    const url = `${SiteConstants.API_URL}user/v2/updateToken`;
    try {
      const response = await CommonService.commonPost(navigation, url, {});
      return response;
    } catch (error) {
      console.error(error);
      console.log("Hello error");
      return undefined;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Image
          style={common_styles.login_logo}
          source={require("../../assets/ChitKart_Logo.png")}
        />
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={CssColors.textColorSecondary}
          />
        ) : (
          <></>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 280,
    height: 260,
  },
});

export default SplashView;
