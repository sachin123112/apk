import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  BackHandler
} from "react-native";
import React, { useEffect } from "react";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { convertISOStringToDate } from "../sharedComp/Utils";

const MyChitPaymentDetails = ({ route, navigation }) => {
  const { paymentDetails, npsToPs } = route.params;

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);
  // Helper function to determine if data is in new format
  const isNewFormat = Array.isArray(paymentDetails) && paymentDetails.length > 0 && 'payableType' in paymentDetails[0];
  
  // Get payments array based on data structure
  const payments = isNewFormat 
    ? paymentDetails 
    : (npsToPs ? paymentDetails : paymentDetails?.invoicePayableRequest?.invoicePayableRequests);
  // Helper function to render payment type row
  const renderPaymentTypeRow = (payData) => {
    // For new format
    if (isNewFormat) {
      const type = payData.narraion?.includes('Cash') ? 'CASH' : 
                  payData.narraion?.includes('ETransfer') ? 'BANK' : 
                  payData.payableType === 'BIDADVANCE' ? 'BIDADVANCE' : 'ADJUSTMENT';
      
      const label = type === 'CASH' ? 'Cash paid' :
                   type === 'BANK' ? 'Paid to bank' :
                   type === 'BIDADVANCE' ? 'Bid advance' :
                   'Adjustment';

      return (
        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
          <Text style={styles.requestedDateText}>{label}</Text>
          <Text style={styles.requestedDateText}>{"\u20B9"} {payData.amount}</Text>
        </View>
      );
    }
    
    // For old format
    return (
      <View>
        {payData.paymentType === 'BANK' &&
          <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
            <Text style={styles.requestedDateText}>Paid to bank</Text>
            <Text style={styles.requestedDateText}>{"\u20B9"} {payData.amount}</Text>
          </View>
        }
        {payData.paymentType === 'CASH' &&
          <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
            <Text style={styles.requestedDateText}>Cash paid</Text>
            <Text style={styles.requestedDateText}>{"\u20B9"} {payData.amount}</Text>
          </View>
        }
        {payData.paymentType === 'ADJUSTMENT' &&
          <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
            <Text style={styles.requestedDateText}>Adjustment</Text>
            <Text style={styles.requestedDateText}>{"\u20B9"} {payData.amount}</Text>
          </View>
        }
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, width: "100%" }}>
        <View style={[styles.headerContainer, common_styles.borderBottom]}>
          <Text style={styles.headerText}>Payment details</Text>
          <Icon
            onPress={() => navigation.goBack()}
            name="close"
            size={24}
            color={CssColors.primaryColor}
          />
        </View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {payments &&
            payments.length > 0 &&
            payments.map((data, index) => (
              <View key={index} style={[styles.requestHistoryContainer, common_styles.shadowProp]}>
                <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                  <Text style={styles.requestedDateText}>Voucher number</Text>
                  <Text style={styles.requestedDateText}>{data.voucherNumber}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                  <Text style={styles.requestedDateText}>Payment date</Text>
                  <Text style={styles.requestedDateText}>
                    {convertISOStringToDate(data.paymentDate)}
                  </Text>
                </View>
                
                {isNewFormat ? (
                  renderPaymentTypeRow(data)
                ) : (
                  data.paymentVoucherDetailsRequest?.map((payData, i) => (
                    <View key={i}>
                      {renderPaymentTypeRow(payData)}
                    </View>
                  ))
                )}

                <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                  <Text style={styles.totalPaidAmountTextTitle}>Total Paid amount</Text>
                  <Text style={[styles.totalPaidAmountTextTitle, styles.greenText]}>
                    {"\u20B9"} {isNewFormat ? data.amount : data.paidAmount}
                  </Text>
                </View>
              </View>
            ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.appBackground,
  },
  requestHistoryContainerInner: {
    borderWidth: 1,
    borderColor: "transparent",
    borderBottomColor: CssColors.homeDetailsBorder,
    paddingBottom: 10,
  },
  scrollView: {
    backgroundColor: CssColors.appBackground,
    marginTop: 5,
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
    fontSize: 14,
  },
  columnone: {
    flex: 1,
    flexDirection: "column",
  },
  requestHistoryContainer: {
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: CssColors.white,
  },
  requestedDateText: {
    fontSize: 12,
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
  },
  requestHistoryTitleText: {
    fontSize: 8,
    lineHeight: 16,
    color: CssColors.primaryBorder,
  },
  totalPaidAmountTextTitle: {
    fontSize: 14,
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  greenText: {
    color: CssColors.green
  }
});

export default MyChitPaymentDetails;