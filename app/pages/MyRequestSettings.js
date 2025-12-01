import React, { useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import RequestHistoryIconSVG from "./svgs/RequestHistoryIconSVG";
import Icon from "react-native-vector-icons/FontAwesome";
 
const MyRequestSettings = ({ navigation }) => {
  const isMountedRef = useRef(true);
  const navigationLocked = useRef(false);
 
  useLayoutEffect(() => {
    navigation.setOptions({ freezeOnBlur: false });
  }, [navigation]);
 
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
 
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);
 
  const requestTypes = [
    {
      id: "2",
      name: "Transfer chit",
      desc: "Request to transfer chit",
      url: "RequestNavigator",
      params: { screen: "RequestTransferChit" },
    },
    {
      id: "3",
      name: "Chit Pledge release",
      desc: "Request pledge release",
      url: "RequestNavigator",
      params: { screen: "RequestChitPledgeRelease" },
    },
    {
      id: "4",
      name: "Phone number change",
      desc: "Update your phone number",
      url: "RequestNavigator",
      params: { screen: "RequestPhoneNumberChange" },
    },
    {
      id: "5",
      name: "Chit cancel",
      desc: "Request to cancel chit",
      url: "RequestNavigator",
      params: { screen: "RequestChitCancel" },
    },
    {
      id: "6",
      name: "Other",
      desc: "Other requests",
      url: "RequestNavigator",
      params: { screen: "RequestOther" },
    },
  ];
 
 
 
  const onClickOpen = (item) => {
    if (!isMountedRef.current || navigationLocked.current) return;
    navigationLocked.current = true;
 
    // Small delay to ensure previous fabric tree is unmounted
    setTimeout(() => {
      if (isMountedRef.current) {
        navigation.navigate(item.url, item.params);
      }
      // Unlock navigation after transition
      setTimeout(() => {
        navigationLocked.current = false;
      }, 400);
    }, 100);
  };
 
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.home_quick_links_container,
            common_styles.shadowProp,
          ]}
        >
          {requestTypes.map((item, index) => {
            const isLastItem = index === requestTypes.length - 1;
            return (
              <TouchableOpacity key={item.id} onPress={() => onClickOpen(item)}>
                <View
                  style={[
                    styles.listI_itemWrapper,
                    !isLastItem && styles.borderBottom,
                  ]}
                >
                  <Text style={styles.listI_title}>{item.name}</Text>
                  <Icon
                    name="angle-right"
                    size={22}
                    color={CssColors.primaryColor}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
 
       <TouchableOpacity
  onPress={() => navigation.navigate('RequestHistoryDetails')}
  style={[styles.requestHistoryContainer, common_styles.shadowProp]}
>
          <RequestHistoryIconSVG width={24} height={24} />
          <Text style={styles.requestHistoryText}>Request history</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
  },
  home_quick_links_container: {
    borderColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
    backgroundColor: CssColors.white,
    marginHorizontal: 12,
    marginVertical: 15,
    borderRadius: 12,
  },
  listI_itemWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listI_title: {
    fontSize: 13,
    color: CssColors.primaryColor,
    fontWeight: "600",
  },
  borderBottom: {
    borderBottomColor: CssColors.homeDetailsBorder,
    borderBottomWidth: 1,
  },
  requestHistoryContainer: {
    padding: 10,
    marginHorizontal: 12,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: CssColors.white,
  },
  requestHistoryText: {
    color: CssColors.primaryPlaceHolderColor,
    paddingHorizontal: 10,
  },
});
 
export default MyRequestSettings;