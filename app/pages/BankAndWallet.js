import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import MyAccountIconSVG from './svgs/MyAccountIconSVG';
import BankAndWalletIconSVG from './svgs/BankAndWalletIconSVG';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';
import {
  getObjectData
} from '../sharedComp/AsyncData';
import CommonService from '../services/CommonService';
import { SiteConstants } from '../SiteConstants';

const BankAndWallet = ({ navigation }) => {
  const [memberID, setMemberID] = useState('');
  const [isWalletBalance, setIsWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const bankList = [
    {
      name: 'Bank',
      icon: 'bank',
      desc: 'Bank account',
      id: '1',
      url: 'BankMainScreen',
      params: {},
      showActive: false,
      isNavigation: true,
    },
    {
      name: 'Wallet',
      desc: 'Wallet history',
      icon: 'wallet',
      id: '2',
      url: 'WalletHistory',
      params: { },
      isNavigation: false,
      showActive: true,
    },
  ];

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let userData = await getObjectData('userData');
        if (!userData) {
          setIsLoading(false);
          return;
        }

        if (userData && userData.data) {
          userData = userData.data;
        }
        
        const memberIds = userData?.memberAccount?.primaryMemberAccountId;
        setMemberID(userData?.id || '');
        
        // if (memberIds) {
        //   const url = `${SiteConstants.API_URL}user/v2/getWalletBalance/${memberIds}`;
        //   const fetchwalletBalance = await CommonService.commonGet(navigation, url);
        //   if (fetchwalletBalance !== undefined) {
        //     setIsWalletBalance(true);
        //     setWalletBalance(fetchwalletBalance.walletBalance);
        //   }
        // }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      // Cleanup function
    };
  }, [navigation]);

  const ListItems = () => {
    return (
      <View style={common_styles.home_quick_links_container}>
        {bankList.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => item.isNavigation ? navigation.navigate(item.url, item.params) : null}
            >
              <View style={common_styles.listI_itemWrapper}>
                {/* Left side */}
                <View style={common_styles.listI_leftWrapper}>
                  {item.icon === 'bank' &&
                  <MyAccountIconSVG width={24} height={24} />
                  }
                  {item.icon === 'wallet' &&
                  <BankAndWalletIconSVG width={24} height={24} />
                  }
                  <View style={common_styles.listI_titlesWrapper}>
                    <Text style={common_styles.listI_title}>{item.name}</Text>
                    <Text style={common_styles.listI_subtitle}>
                      {item.desc}
                    </Text>
                  </View>
                  {/* {item.showActive && (
                    <View style={styles.greenContainer}>
                      <Text style={styles.amountText}>
                        {'\u20B9'} {walletBalance}
                      </Text>
                    </View>
                  )} */}
                </View>

                {/* Right side */}
                <View style={common_styles.rightWrapper}>
                  <Icon
                    name="angle-right"
                    size={24}
                    color={CssColors.primaryColor}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={common_styles.center_align}>
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <ListItems />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  greenContainer: {
    backgroundColor: CssColors.green,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 10,
    borderRadius: 10
  },
  amountText: {
    color: CssColors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600'
  }
});

export default BankAndWallet;
