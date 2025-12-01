import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from "react-native";
import React, { useEffect, useState } from "react";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import Icon from "react-native-vector-icons/FontAwesome";
import { getObjectData } from "../sharedComp/AsyncData";
import CommonService from "../services/CommonService";
import { SiteConstants } from "../SiteConstants";
import MyAccountIconSVG from './svgs/MyAccountIconSVG';
import BankAndWalletIconSVG from './svgs/BankAndWalletIconSVG';
import PoliciesIconSVG from './svgs/PoliciesIconSVG';
import RequestIconSVG from './svgs/RequestIconSVG';
import AppSettingsIconSVG from './svgs/AppSettingsIconSVG';
import SupportIconSVG from './svgs/SupportIconSVG';
import { useCustomBackHandler } from "../sharedComp/Utils";

const Account = ({ navigation }) => {
  const [memberID, setMemberID] = useState("");
  const [isMemberActive, setIsMemberActive] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [languageData, setLanguageData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getActiveMember();
      setRefreshing(false);
    }, 500);
  }, []);
  useCustomBackHandler(navigation);

  const getActiveMember = async () => {
    setIsLoading(true);
    let userData = await getObjectData("userData");
    if (userData && userData.data) {
      userData = userData.data;
    }
    const memberIds = userData?.id;
    setMemberID(userData?.id);
    const url = `${SiteConstants.API_URL}user/v2/getActiveMember/${memberIds}`;
    const memberStatus = await CommonService.commonGet(navigation, url);
    if (memberStatus !== undefined) {
      setIsMemberActive(memberStatus);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getActiveMember();
    // getLanguageData();
  }, []);

  const getLanguageData = async () => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}page/getResourceBundle?pageName=ACCOUNT_SETTINGS&language=en&serviceType=MOBILE`;
    const myLanguageData = await CommonService.commonGet(navigation, url);
    if (myLanguageData !== undefined) {
      setLanguageData(myLanguageData.resourceBundle);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const account = [
    {
      name: languageData?.myAccount?.label || 'My Account',
      icon: 'myAccount',
      desc: languageData?.profileDetails?.label || 'Profile details',
      id: '1',
      url: 'MyAccountDetails',
      showActive: true
    },
    {
      name: languageData?.bankAndWallet?.label || 'Bank & Wallet',
      desc: languageData?.bankAndWalletDesc?.label || 'Bank and Wallet',
      icon: 'bankAndWallet',
      id: '2',
      url: 'BankAndWallet',
      showActive: false
    },
    {
      name: languageData?.policies?.label || 'Policies',
      desc: languageData?.termsAndConditions?.label || 'Terms and Conditions',
      icon: 'policies',
      id: '3',
      url: 'PolicySettings',
      showActive: false
    },
    {
      name: languageData?.request?.label || 'Request',
      desc: languageData?.requestDesc?.label || 'Transfer, Pledge release, Phone number change',
      icon: 'request',
      id: '4',
      url: 'MyRequestSettings',
      showActive: false
    },
    {
      name: languageData?.appSettings?.label || 'App settings',
      desc: languageData?.appSettingsDesc?.label || 'Security settings, Language, Notifications',
      icon: 'appSettings',
      id: '5',
      url: 'AppSettings',
      showActive: false
    },
    {
      name: languageData?.support?.label || 'Support',
      desc: languageData?.supportDesc?.label || 'Customer support, email, FAQ',
      icon: 'support',
      id: '6',
      url: 'SupportSettings',
      showActive: false
    },
  ];

  const ListItems = () => {
    return (
      <View style={common_styles.home_quick_links_container}>
        {account.map((item) => {
            return (
              <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate(item.url)}
              >
                <View style={common_styles.listI_itemWrapper}>
                  
                  {/* Left side */}
                  <View style={common_styles.listI_leftWrapper}>
                    {item.icon === 'myAccount' &&
                    <MyAccountIconSVG width={24} height={24} />
                    }
                    {item.icon === 'bankAndWallet' &&
                    <BankAndWalletIconSVG width={24} height={24} />
                    }
                    {item.icon === 'policies' &&
                    <PoliciesIconSVG width={24} height={24} />
                    }
                    {item.icon === 'request' &&
                    <RequestIconSVG width={24} height={24} />
                    }
                    {item.icon === 'appSettings' &&
                    <AppSettingsIconSVG width={24} height={24} />
                    }
                    {item.icon === 'support' &&
                    <SupportIconSVG width={24} height={24} />
                    }
                    <View style={common_styles.listI_titlesWrapper}>
                      <Text style={common_styles.listI_title}>{ item.name}</Text>
                      <Text style={common_styles.listI_subtitle}>{item.desc}</Text>
                    </View>
                    {(item.showActive) &&
                      <View style={
                        isMemberActive ?
                          styles.activeContainer
                          : styles.inActiveContainer
                      }>
                        <Text style={styles.activeText}>{isMemberActive ? languageData?.active?.label || 'Active' : languageData?.inactive?.label || 'Inactive'}</Text>
                      </View>
                    }
                  </View>

                  
                  {/* Right side */}
                  <View style={common_styles.rightWrapper}>
                    <Icon name="angle-right" size={24} color={CssColors.primaryColor} />
                  </View>

                </View>
              </TouchableOpacity>
            );
          })}
      </View>
    );
  };

  return (
    <SafeAreaView
    style={[!isLoading ? styles.container : common_styles.center_align]}
  >
    {isLoading && memberID ? (
      <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
    ) : (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.container}>
        <ListItems />
      </ScrollView>
    )}
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    textAlign: "center",
    color: "black",
  },
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: "100%",
  },
  activeContainer: {
    backgroundColor: CssColors.green,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 10,
    borderRadius: 10
  },
  inActiveContainer: {
    backgroundColor: CssColors.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 10,
    borderRadius: 10
  },
  activeText: {
    color: CssColors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600'
  }
});

export default Account;