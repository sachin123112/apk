import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  BackHandler
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuth, signOut } from "@react-native-firebase/auth";
import StorageService from '../sharedComp/StorageService';
import { CacheService } from '../sharedComp/CacheService';
import { storeObjectData, storeStringData } from "../sharedComp/AsyncData";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import LogoutIconTwoSVG from '../pages/svgs/LogoutIconTwoSVG';
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import BottomPopUp from "../sharedComp/BottomSheet";
import { useIsFocused, CommonActions, useNavigation } from "@react-navigation/native";

// Initialize auth once
const auth = getAuth();

const MyAccountDetails = () => {
  const insets = useSafeAreaInsets();
  const [memberID, setMemberID] = useState("");
  const [memberData, setMemberData] = useState("");
  const [userImage, setUserImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addressData, setAddressData] = useState([]);
  const [documentData, setDocumentData] = useState({});
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetData, setBottomSheetData] = useState({});
  const [languageData, setLanguageData] = useState({});
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    (async () => {
      if(isFocused) {
        setIsLoading(true);
        let userData = await fetchUserData();
        if (userData && userData.data) {
          userData = userData.data;
        }
        console.log(userData);
        setUserDocData(userData?.individualMemberAccount?.document);
        setAddressData(userData?.individualMemberAccount?.address && userData?.individualMemberAccount?.address[0]);
        const userPhoto = await getUserPhotoLocation(userData?.individualMemberAccount?.document);
        await getUserImage(userPhoto?.location || null);
        setMemberID(userData?.id);
        setMemberData(userData);
        setIsLoading(false);
      }
    })();
    
    return () => {
      // this now gets called when the component unmounts
    };
  }, [isFocused]);

  useEffect(() => {
    // setIsLoading(true);
    // getLanguageData();
  }, []);

  const fetchUserData = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData("userData", response);
      await storeStringData("memberID", response.id ?? "");
      return response;
    } catch (error) {
      console.log("catch ====>", error);
      return null;
    }
  };

  const getLanguageData = async () => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}page/getResourceBundle?pageName=PROFILE_DETAILS&language=en&serviceType=MOBILE`;
    const myLanguageData = await CommonService.commonGet(navigation, url);
    if (myLanguageData !== undefined) {
      if (myLanguageData && myLanguageData?.resourceBundle) {
        setLanguageData(myLanguageData.resourceBundle);
      }
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const getUserPhotoLocation = async (documents) => {
    const isPhotoData = documents && documents.length && documents.find(doc => doc.type === 'PHOTO');
    return isPhotoData || null;
  }

  const setUserDocData = async (documents) => {
    const isPhotoData = documents && documents.length && documents.find(doc => doc.type === 'AADHAR');
    setDocumentData(isPhotoData || null);
  }

  const logoutpopup = async () => {
    setBottomSheetData({
      title: languageData?.logoutTitle?.label || "Log out?",
      titleColor: "#072E77",
      description: languageData?.logoutDesc?.label || "Are you sure you want to log-out?",
      sendButtonTitle: languageData?.logout?.label || "Logout",
      sendButtonBGColor: "#FF3830",
      cancelButtonTitle: languageData?.cancel?.label || "Cancel",
      cancelButtonBGColor: "#F7F9FC",
      totalButtons: 2,
      showIcon: false,
      showIconName: 'logout',
      showSVG: true
    });
    setShowBottomSheet(true);
  };

  const logout = async () => {
    try {
      // Clear all cache (in-memory and persisted cache keys)
      await CacheService.clearAllCache();
      // Clear any remaining stored data (tokens, flags, etc.)
      await StorageService.clear();
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (e) {
      console.log('Logout cleanup error:', e);
      // Proceed with navigation even if cleanup partially fails
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }
  };

  const getUserImage = async (documents) => {
    // setIsLoading(true);
    const location = documents;
    const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;
    return CommonService.commonBlobGet(navigation, url, location).then(
      async (image) => {
        if (image !== undefined) {
          let binary = "";
          const bytes = new Uint8Array(image);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const finaldata = binary;
          setUserImage(finaldata);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  const UserImage = () => {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: userImage }}
          resizeMode="cover" // fill, contain, cover, none, scale-down
          style={{
            width: 120,
            height: 120,
            borderColor: CssColors.homeDetailsBorder,
            borderWidth: 1,
          }}
        />
      </View>
    );
  };

  const showAadhar = (str) => {
    if (!str) return;
    const updatedString = str.replace(/.(?=.{4})/g, '');
    return `XXXX XXXX ${updatedString}`;
  }

  return (
    <SafeAreaView style={[
      !isLoading ? [
        styles.container, 
        insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}
      ] : common_styles.center_align
    ]}>
      {isLoading && isFocused ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.scrollView}>
            {userImage &&
            <UserImage />
            }
            <View style={common_styles.margin_bottom_20}>
              <Text style={styles.titleText}>{languageData?.name?.label || 'Name'}</Text>
              <Text style={styles.titleTextMain}>
                {memberData?.individualMemberAccount?.name}
              </Text>
            </View>
            <View style={common_styles.margin_bottom_20}>
              <Text style={styles.titleText}>{languageData?.phoneNumber?.label || 'Phone number'}</Text>
              <Text style={styles.titleTextMain}>{memberData?.phoneNumber}</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <View>
                <Text style={styles.titleText}>{languageData?.documentType?.label || 'Document type'}</Text>
                <Text style={styles.titleTextMain}>{documentData?.type || "-"}</Text>
              </View>
              <View>
                <Text style={styles.titleText}>
                  {languageData?.aadharNumber?.label || 'Aadhar Number'}
                </Text>
                <Text style={styles.titleTextMain}>
                  {showAadhar(documentData?.number) || "-"}
                </Text>
              </View>
            </View>
            <View style={common_styles.margin_bottom_20}>
              <Text style={styles.titleText}>{languageData?.gender?.label || 'Gender'}</Text>
              <Text style={styles.titleTextMain}>
                {memberData?.individualMemberAccount?.gender}
              </Text>
            </View>
            <View style={common_styles.margin_bottom_20}>
              <Text style={styles.titleText}>{languageData?.address?.label || 'Address'}</Text>
              <Text style={styles.titleTextMain}>
                {addressData?.address || "-"}
              </Text>
              <Text style={styles.titleTextMain}>
                {addressData?.city || "-"}
              </Text>
              <Text style={styles.titleTextMain}>
                {addressData?.pincode || "-"}
              </Text>
              <Text style={styles.titleTextMain}>
                {addressData?.state || "-"}
              </Text>
              <Text style={styles.titleTextMain}>
                {addressData?.country || "-"}
              </Text>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.logoutContainer}
            onPress={() => logoutpopup()}
          >
            <LogoutIconTwoSVG width={24} height={24} />
            <Text style={styles.logoutText}>{languageData?.logout?.label || 'Logout'}</Text>
          </TouchableOpacity>
          {showBottomSheet && (
            <BottomPopUp
              data={bottomSheetData}
              onClose={() => {
                setShowBottomSheet(false);
              }}
              onSubmit={() => {
                setShowBottomSheet(false);
                logout();
              }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.white,
    width: "100%",
  },
  scrollView: {
    backgroundColor: CssColors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    marginBottom: 20
  },
  titleText: {
    fontSize: 12,
    lineHeight: 24,
    color: CssColors.primaryBorder,
  },
  titleTextMain: {
    fontSize: 14,
    color: CssColors.primaryPlaceHolderColor,
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
    paddingLeft: 20,
    margin: 20,
    height: 56,
    borderRadius: 4,
    backgroundColor: CssColors.white,
  },
  logoutText: {
    color: CssColors.errorTextColor,
    fontSize: 14,
    fontWeight: "600",
    paddingLeft: 10,
  },
});

export default MyAccountDetails;
