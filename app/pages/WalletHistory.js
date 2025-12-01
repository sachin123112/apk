import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  BackHandler
} from "react-native";
import React, { useEffect, useState } from "react";
import { requestedDateTime } from "../sharedComp/Utils";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import { getObjectData } from "../sharedComp/AsyncData";
import CommonService from "../services/CommonService";
import { SiteConstants } from "../SiteConstants";
import InfoText from '../sharedComp/InfoText';
import NameTitle from '../sharedComp/NameTitle';

const WalletHistory = ({ navigation }) => {
  const [isWalletBalance, setIsWalletBalance] = useState(false);
  const [walletHistory, setWalletHistory] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      let userData = await getObjectData("userData");
      if (userData && userData.data) {
        userData = userData.data;
      }
      const primaryMemberId = userData?.memberAccount?.primaryMemberAccountId;
      let walletBalanceAmount = 0;
      const urls = `${SiteConstants.API_URL}user/v2/getWalletBalance/${primaryMemberId}`;
      const fetchwalletBalance = await CommonService.commonGet(navigation, urls);
      if (fetchwalletBalance) {
        setWalletBalance(fetchwalletBalance?.walletBalance);
        walletBalanceAmount = fetchwalletBalance?.walletBalance;
      }
      const payload = {
        searchCriteriaList: [
          {
            filterKey: "string",
            operation: "string",
            value: {},
            betweenValueFrom: {},
            betweenValueTo: {},
            dataOption: "string",
            dataType: "string",
            valueList: [{}],
          },
        ],
        dataOption: "string",
        pagination: {
          pageNumber: 0,
          pageSize: 0,
          status: "string",
          sortBy: "string",
          sortMode: "string",
          recordsPerPage: 0,
          totalRecords: 0,
        },
      };
      if (walletBalanceAmount !== 0) {
        const url = `${SiteConstants.API_URL}user/v2/getWalletHistory/${primaryMemberId}`;
        const fetchWalletHistory = await CommonService.commonPost(
          navigation,
          url,
          payload
        );
        if (fetchWalletHistory !== undefined) {
          console.log(fetchWalletHistory?.data, 'wallet history data');
          setIsWalletBalance(true);
          setWalletHistory(fetchWalletHistory?.data);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  return (
    <View style={[!isLoading ? styles.container : common_styles.center_align]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : walletBalance ? (
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View
              style={{
                flex: 1,
                position: "relative",
                width: "100%",
                backgroundColor: CssColors.appBackground,
              }}
            >
              {isWalletBalance && (
                <View style={[styles.amountContainer, common_styles.shadowProp]}>
                  <View style={styles.amountInnerContainer}>
                    <Text style={styles.requestHistoryMainTitleSubText}>
                      Current wallet balance
                    </Text>
                    <Text style={styles.amountTextOne}>
                      {"\u20B9"}{" "}{walletBalance}
                    </Text>
                  </View>
                </View>
              )}
              <View style={[styles.requestHistoryTopContainer, common_styles.shadowProp]}>
              {isWalletBalance &&
                walletHistory &&
                walletHistory.map((requestData, index) => {
                  const transactionType = requestData.debit === 0 ? 'CREDIT' : 'DEBIT';
                  return (
                    <View style={styles.requestHistoryContainer} key={index}>
                      <View style={{ flex: 1, flexDirection: "row", justifyContent: 'space-between' }}>
                        <View>
                          <Text style={styles.requestedDateText}>
                            {requestedDateTime(requestData.date)}
                          </Text>
                        </View>
                        {transactionType === 'CREDIT' &&
                        <View style={{ flexDirection: "row", alignItems: 'baseline' }}>
                          <Text style={[styles.requestHistoryTitleText, styles.paddingRight5]}>
                            Mode 
                          </Text>
                          <Text style={styles.requestHistoryTitleTextData}>
                            {requestData?.ledgers && requestData?.ledgers[0].mode || "-"} 
                          </Text>
                        </View>
                        }
                      </View>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <View style={styles.columnone}>
                          <NameTitle title="Narration" />
                          <InfoText
                            content={requestData.narration || "-"}
                            isBold={true}
                          />
                        </View>
                        <View style={styles.columnone}>
                          <NameTitle title={transactionType} />
                          <InfoText
                            isCurrency={true}
                            content={requestData.credit || requestData.debit || "-"}
                            isBold={true}
                          />
                        </View>
                        <View style={styles.columnone}>
                          <NameTitle title="Balance" />
                          <InfoText
                            isCurrency={true}
                            content={requestData.closingBalance || "-"}
                            isBold={true}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
              
            </View>
          </ScrollView>
        </View>
      ) :
      <Text style={{textAlign: "center", color: 'black', marginTop: 40}}>There is no wallet history</Text>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.appBackground,
  },
  requestHistoryHeader: {
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderBottomColor: CssColors.homeDetailsBorder,
    borderTopColor: CssColors.homeDetailsBorder,
    borderLeftColor: CssColors.homeDetailsBorder,
    borderRightColor: CssColors.homeDetailsBorder,
    marginHorizontal: 10,
    paddingBottom: 10,
    marginTop: 20,
  },
  amountTextOne: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 20,
    fontWeight: '600'
  },
  amountText: {
    color: CssColors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "600",
  },
  requestHistoryContainer: {
    padding: 10,
    flex: 1,
    flexDirection: "column",
    borderWidth: 1,
    borderBottomColor: CssColors.homeDetailsBorder,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  requestHistoryTopContainer: {
    borderWidth: 1,
    borderColor: CssColors.homeDetailsBorder,
    backgroundColor: CssColors.white,
    marginHorizontal: 12,
    marginVertical: 15,
    borderRadius: 12
  },
  paddingRight5: {
    paddingRight: 3
  },
  amountContainer: {
    backgroundColor: CssColors.white,
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderBottomColor: "transparent",
    borderTopColor: CssColors.homeDetailsBorder,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  amountInnerContainer: {
    padding: 10,
    backgroundColor: CssColors.appBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CssColors.borderOne
  },
  requestedDateText: {
    fontSize: 12,
    lineHeight: 26,
    color: CssColors.primaryPlaceHolderColor,
  },
  requestHistoryTitleText: {
    fontSize: 8,
    lineHeight: 16,
    color: CssColors.lightGreyFour,
  },
  requestHistoryMainTitleText: {
    fontSize: 16,
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  requestHistoryMainTitleSubText: {
    fontSize: 8,
    lineHeight: 24,
    color: CssColors.lightGreyFour,
  },
  requestHistoryTitleTextData: {
    fontSize: 12,
    lineHeight: 22,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  columnone: {
    flex: 1,
    flexDirection: "column",
    width: '33.33%'
  },
  requestHistoryMainTitleText: {
    fontSize: 16,
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  requestHistoryTitleTextData: {
    fontSize: 14,
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  }
});

export default WalletHistory;
