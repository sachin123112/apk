import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommonService from '../services/CommonService';
import { SiteConstants } from '../SiteConstants';
import { convertISOStringToDateMonthYear, formatCurrency } from '../sharedComp/Utils';
import InfoText from '../sharedComp/InfoText';
import NameTitle from '../sharedComp/NameTitle';

const AccountCopyDetailsView = ({ route, navigation }) => {
  const {memberId, memberAccountId, chitGroupName, ticketNumber, chitGroupNameTicket, ticketStatus} = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [AccountSummary, setAccountSummary] = useState({});
  const [rowData, setRowData] = useState([]);

  const requestData = {memberId, memberAccountId, chitGroupName, ticketNumber};

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    setIsLoading(true);
    getAccountSummaryAndTableData();
  }, []);

  const getAccountSummaryAndTableData = async () => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}user/v2/accountCopyDetailed`;
    CommonService.commonPost(
      navigation,
      url,
      requestData
    ).then(async (data) => {
      if (data !== undefined) {
        setAccountSummary(data?.detailedAccCopy?.accSummary);
        setRowData(data?.detailedAccCopy?.lineItems);
        setIsLoading(false);
      }
    }).catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
      alert('Something went wrong');
      setIsLoading(false);
    });
  };

  const payableAmount = (netSubscription, penalty, charges) => {
    let finalAmount = '--';
    if (netSubscription === 0 && penalty === 0 & charges !== 0) {
      finalAmount = charges === 0 ? '--' : `\u20B9 ${formatCurrency(charges)}`;
    } else if (netSubscription === 0 && penalty !== 0 & charges === 0) {
      finalAmount = penalty === 0 ? '--' : `\u20B9 ${formatCurrency(penalty)}`;
    } else {
      finalAmount = netSubscription === 0 ? '--' : `\u20B9 ${formatCurrency(netSubscription)}`;
    }
    return finalAmount;
  }

  return (
    <View style={[styles.container, insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}]}>
      {isLoading ? (
        <View style={common_styles.center_align}>
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={[styles.headerContainer, common_styles.borderBottom]}>
            <Text style={styles.headerText}>Account copy</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon
                name="close"
                size={24}
                color={CssColors.primaryColor}
              />
            </TouchableOpacity>
          </View>
          {/* Content part */}
          <View style={styles.contentContainerHeader}>
            <View style={[styles.contentContainerHeaderInner, common_styles.shadowProp]}>
              {/* First row */}
              <View style={[styles.borderBottom_11, styles.containerContentWidthTwo]}>
                <View style={styles.columnContainer}>
                  <NameTitle title="Status" />
                  <InfoText
                    content={ticketStatus ?? '--'}
                    isBold={true}
                  />
                </View>
                <View style={styles.columnContainer}>
                  <NameTitle title="Payable amount" />
                  <InfoText
                    content={`${formatCurrency(AccountSummary?.receivableAmount)}` ?? '--'}
                    isCurrency={true}
                  />
                </View>
                <View style={styles.columnContainer}>
                  <NameTitle title="Due" />
                  <InfoText
                    content={`${formatCurrency(AccountSummary?.balanceAmount)}` ?? '--'}
                    isCurrency={true}
                  />
                </View>
              </View>
              {/* Second row */}
              <View style={[styles.containerContentWidthTwo]}>
                <View style={styles.columnContainer}>
                  <NameTitle title="Paid amount" />
                  <InfoText
                    content={`${formatCurrency(AccountSummary?.receivedAmount)}` ?? '--'}
                    isCurrency={true}
                  />
                </View>
                <View style={styles.columnContainer}>
                  <NameTitle title="Dividend earned" />
                  <InfoText
                    content={`${formatCurrency(AccountSummary?.dividendEarned)}` ?? '--'}
                    isCurrency={true}
                    colorStyle={styles.orangeText}
                    isBold={true}
                  />
                </View>
                <View style={styles.columnContainer}>
                  <NameTitle title="Total savings" color={CssColors.green} />
                  <InfoText
                    content={`${formatCurrency((AccountSummary?.totalSavings))}` ?? '--'}
                    isCurrency={true}
                    colorStyle={styles.greenText}
                    isBold={true}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Sticky Table Header */}
          <View style={styles.stickyHeaderContainer}>
            <View
              style={[
                styles.chit_container_row1,
                styles.paddingLeft_10,
                styles.paddingBottom_10,
                styles.borderBottom_header,
              ]}
            >
              <Text style={[styles.chit_details_title, styles.width40]}>
              {'Date\nNarration'}</Text>
              <Text style={[styles.chit_details_title, styles.width20, styles.borderLeft]}>
              {'Payable-\nDr'}</Text>
              <Text style={[styles.chit_details_title, styles.width20, styles.borderLeft]}>
              {'Paid-\nCr'}</Text>
              <Text style={[styles.chit_details_title, styles.width20, styles.borderLeft]}>
              {'Balance'}</Text>
            </View>
          </View>

          {/* Scrollable Data Content - Keep original structure */}
          <ScrollView
            contentContainerStyle={[
              common_styles.chit_container,
              styles.paddingLeft_0,
              common_styles.shadowProp,
              styles.scrollViewContentContainer,
            ]}
          >
            {rowData &&
              rowData.length > 0 &&
              rowData.map((row, index) => {
                return (
                  <View
                    key={index}
                    style={[
                      styles.chit_container_row2,
                      styles.borderBottom_1,
                      styles.paddingLeft_10,
                    ]}
                  >
                    <View style={styles.width40}>
                      <Text
                        style={[
                          styles.chit_container_row2_inner_header_info,
                          styles.fontsize_9
                        ]}
                      >
                        {convertISOStringToDateMonthYear(row.date)}
                      </Text>
                      <Text
                        style={[
                          common_styles.chit_container_row2_inner_header,
                          styles.maxWidth,
                          styles.fontsize_9
                        ]}
                      >
                        {row.narration === 'Receipt' ? `${row.narration} no ${row?.receivedDetails?.receiptNumber}` : row.narration}
                      </Text>
                    </View>
                    <View style={styles.width20}>
                      <Text
                        style={[
                          common_styles.chit_container_row2_inner_header,
                          styles.chit_details_container_row2_inner_header,
                          styles.fontsize_12
                        ]}
                      >
                        {payableAmount(row?.receivableDetails?.netSubscription, row?.receivableDetails?.penalty, row?.receivableDetails?.charges)}
                      </Text>
                    </View>
                    <View style={styles.width20}>
                      <Text
                        style={[
                          common_styles.chit_container_row2_inner_header,
                          styles.chit_details_container_row2_inner_header,
                          styles.fontsize_12
                        ]}
                      >
                        {row?.receivedDetails?.receiptAmount ? `\u20B9 ${formatCurrency(row?.receivedDetails?.receiptAmount)}` : '--'}
                      </Text>
                      <Text
                        style={[
                          common_styles.chit_container_row2_inner_header,
                          styles.maxWidthTwo,
                          styles.fontsize_9
                        ]}
                      >
                        {row?.receivedDetails?.receiptAmount ? `${(row?.receivedDetails?.mode)}` : ''}
                      </Text>
                    </View>
                    <View style={styles.width20}>
                      <Text
                        style={[
                          common_styles.chit_container_row2_inner_header,
                          styles.chit_details_container_row2_inner_header,
                          styles.fontsize_12
                        ]}
                      >
                        {`\u20B9 ${formatCurrency(row?.balanceDetails?.totalBalance)}`}
                      </Text>
                    </View>
                  </View>
                );
            })}
          </ScrollView>
        </SafeAreaView>
      )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  borderStyle: {
    borderColor: '#CCC',
    borderWidth: 1,
  },
  borderLeft: {
    paddingLeft: 5,
    borderLeftWidth: 1,
    borderLeftColor: CssColors.homeDetailsBorder,
  },
  chit_container_row2_inner_header_info: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 10,
    fontWeight: '400',
    paddingTop: 5,
    marginBottom: 6,
  },
  containerContentWidthTwo: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginRight: 2,
  },
  greenText: {
    color: CssColors.green,
  },
  orangeText: {
    color: CssColors.textColorSecondary,
  },
  fontWeight600: { fontWeight: '600' },
  borderBottom_11: {
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    paddingBottom: 8,
    marginBottom: 8,
  },
  columnContainer: {
    width: '33.33%',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  marginTop10: {
    marginTop: 10,
  },
  width40: {
    width: '40%',
  },
  width20: {
    width: '20%',
  },
  tableContainer: {
    flex: 1,
    padding: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  head: {
    height: 50,
  },
  maxWidth: {
    maxWidth: '90%',
  },
  maxWidthTwo: { maxWidth: '80%' },
  text: {
    textAlign: 'left',
    fontWeight: 'bold',
    paddingLeft: 10,
    color: CssColors.primaryPlaceHolderColor,
  },
  row: {
    height: 50,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: CssColors.appBackground,
    height: '100%',
    marginBottom: 10,
  },
  chit_details_title: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 14,
    lineHeight: 13,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    height: 90,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 35,
    paddingBottom: 10,
    backgroundColor: CssColors.white
  },
  headerText: {
    color: CssColors.primaryColor,
    fontSize: 16,
  },
  contentContainerHeader: {
    backgroundColor: CssColors.appBackground,
    margin: 0,
    width: '100%',
  },
  contentContainerHeaderInner: {
    backgroundColor: CssColors.white,
    margin: 10,
    paddingVertical: 5,
    flexDirection: 'column',
    borderRadius: 12,
  },
  containerContentWidth: {
    width: '33.33%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginRight: 2,
  },
  ContainerContentInnerWidth: {
    width: '100%',
    marginBottom: 10,
  },
  topbarDataTitle: {
    fontSize: 12,
    color: CssColors.primaryBorder,
    paddingBottom: 4,
  },
  topbarDataTitleGreen: {
    fontSize: 12,
    color: CssColors.green,
    paddingBottom: 4,
  },
  topbarDataValue: {
    fontSize: 12,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: '600',
  },
  topbarDataValueGreen: {
    fontSize: 12,
    color: CssColors.green,
    fontWeight: '600',
  },
  topbarDataValueOrange: {
    fontSize: 12,
    color: CssColors.textColorSecondary,
    fontWeight: '600',
  },
  chit_container_row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  paddingLeft_0: {
    paddingLeft: 0,
  },
  paddingLeft_10: {
    paddingLeft: 10,
  },
  borderBottom_1: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  borderBottom_header: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: CssColors.lightGreySix,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  borderBottom_2: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  paddingBottom_10: {
    paddingBottom: 10,
  },
  chit_details_container_row2_inner_header: {
    fontSize: 10,
    lineHeight: 12,
    color: CssColors.primaryPlaceHolderColor,
    marginBottom: 6,
  },
  fontsize_14: {
    fontSize: 14,
  },
  fontsize_12: {
    fontSize: 12,
    color: CssColors.primaryPlaceHolderColor,
  },
  fontsize_9: {
    fontSize: 9,
    color: CssColors.lightGreyFour,
  },
  chit_container_row2: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  // Sticky header styles
  stickyHeaderContainer: {
    backgroundColor: CssColors.white,
    marginTop: 10,
    marginHorizontal: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // ScrollView content container
  scrollViewContentContainer: {
    marginHorizontal: 10,
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default AccountCopyDetailsView;
