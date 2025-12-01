import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  BackHandler
} from "react-native";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CssColors } from "../css/css_colors";
import { storeObjectData, storeStringData, getStringData, getObjectData } from "../sharedComp/AsyncData";
import common_styles from "../css/common_styles";
import IconThree from "react-native-vector-icons/Ionicons";
import NoActiveBanks from "../sharedComp/NoActiveBanks";
import CommonService from "../services/CommonService";
import { SiteConstants } from "../SiteConstants";
import BottomPopUp from "../sharedComp/BottomSheet";

const BankDetails = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [bankData, setBankData] = useState([]);
  const [selectedBank, setSelectedBank] = useState([]);
  const [bottomSheetData, setBottomSheetData] = useState({});
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const isFocused = useIsFocused();

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
      if(isFocused){
        setIsLoading(true);
        let userData = await getObjectData('userData');
        if (!userData) {
          userData = await fetchUserData();
        }
    
        if (userData && userData.data) {
          userData = userData.data;
        }
        const isBank = userData?.bankDetailsList;
        setMemberId(userData?.id);
        if (isBank !== undefined) {
          setBankData(isBank);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, [isFocused]);

  const fetchUserData = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData("userData", response);
      await storeStringData("memberID", response.id ?? "");
      setIsLoading(false);
      return response;
    } catch (error) {
      console.log("catch ====>", error);
      setIsLoading(false);
      return "null";
    }
  };

  const setAsPrimaryPopup = async (item) => {
    setBottomSheetData({
      title: "Are you sure?",
      titleColor: "#FF3830",
      description: "Are you sure you want to change your default bank account?",
      sendButtonTitle: "Confirm",
      sendButtonBGColor: "#072E77",
      cancelButtonTitle: "Cancel",
      cancelButtonBGColor: "#072E77",
      totalButtons: 2,
      showIcon: true,
      showIconName: 'question',
    });
    setSelectedBank(item);
    setShowBottomSheet(true);
  };

  const setAsPrimary = async (bankData) => {
    if (bankData.primary) return;
    setIsLoading(true);
    const memberIds = await getStringData("memberID");
    CommonService.commonPost(
        navigation,
        `${SiteConstants.API_URL}user/v2/bankPrimary/${memberIds}/${bankData.uuid}`,
        {}
      ).then(async (data) => {
        if (data !== undefined) {
            let userData = await fetchUserData();
            if (userData && userData.data) {
              userData = userData.data;
            }
            setBankData(userData?.bankDetailsList);
            setSelectedBank([]);
            setIsLoading(false);
        }
      });
  }

  return (
    <View style={[styles.container, insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}]}>
      {isLoading ? (
        <View style={common_styles.center_align}>
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        </View>
      ) : bankData && bankData.length ? (
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View
              style={{
                flex: 1,
                position: "relative",
                backgroundColor: CssColors.appBackground,
              }}
            >
              {bankData.map((item) => {
                return (
                  <View style={styles.bankDataContainer} key={item.uuid}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <Text style={styles.titleText}>Ac name - </Text>
                      <Text style={styles.titleTextMain}>
                        {item.holderName}
                      </Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <Text style={styles.titleText}>Bank name - </Text>
                      <Text style={styles.titleTextMain}>{item.bankName}</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <Text style={styles.titleText}>Ac. number - </Text>
                      <Text style={styles.titleTextMain}>
                        {item.accountNumber}
                      </Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <Text style={styles.titleText}>IFSC - </Text>
                      <Text style={styles.titleTextMain}>{item.ifscCode}</Text>
                    </View>
                    <View style={styles.setPrimaryContainer}>
                      <Text style={styles.titleText}>Set as a Primary </Text>
                      <IconThree
                          onPress={() => setAsPrimaryPopup(item)}
                          name={item.primary ? "radio-button-on" : "radio-button-off"}
                          size={30}
                          style={item.primary ? styles.radioButtonActive : styles.radioButtonInActive}
                        />
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.logoutContainer}
            onPress={() => navigation.navigate("AddBank")}
          >
            <Text style={styles.logoutText}>Add bank</Text>
          </TouchableOpacity>
          {showBottomSheet && (
            <BottomPopUp
              data={bottomSheetData}
              onClose={() => {
                setShowBottomSheet(false);
              }}
              onSubmit={() => {
                setShowBottomSheet(false);
                setAsPrimary(selectedBank);
              }}
            />
          )}
        </View>
      ) : (
        <NoActiveBanks
          contentTitle="No active bank is available"
          contetsubTitle="Add new bank"
          buttonTitle="Add new bank"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.appBackground,
    padding: 20,
  },
  titleText: {
    fontSize: 14,
    lineHeight: 22,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "500",
  },
  titleTextMain: {
    fontSize: 14,
    lineHeight: 22,
    color: CssColors.primaryPlaceHolderColor,
  },
  bankDataContainer: {
    paddingVertical: 10,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderLeftColor: "transparent",
    borderBottomColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: CssColors.primaryColor,
    borderWidth: 1,
    marginVertical: 20,
    height: 56,
    borderRadius: 4,
    backgroundColor: CssColors.white,
  },
  logoutText: {
    color: CssColors.primaryColor,
    fontSize: 14,
    fontWeight: "600",
  },
  radioButtonActive: {
    color: CssColors.green,
  },
  radioButtonInActive: {
    color: CssColors.grey,
  },
  setPrimaryContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10
  }
});

export default BankDetails;
