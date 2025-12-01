import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import { convertISOStringToDate } from "../sharedComp/Utils";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import { getObjectData } from "../sharedComp/AsyncData";
import PaymentFailedIconSVG from '../pages/svgs/PaymentFailedIconSVG';
import { resetToRootTab } from "../utils/RootNavigation";
 
const PaymentFail = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chitDetails, setChitDetails] = useState({});
  const { paymentOrderId } = route.params;
 
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const chitData = await getObjectData("chitPaymentDetails");
      console.log("chit date fail",chitData)
      setChitDetails(chitData);
      getDetails(chitData);
      setIsLoading(false);
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);
 
  const getDetails = async (chitData) => {
    let statusBody = {
      "chitId": chitData.achitId,
      "orderId": paymentOrderId,
      "paymentGateway": "cashfree",
      "paymentGatewayRefId": chitData.CFOrderId,
      "memberId": chitData.memberId,
      "subscriberId": chitData?.subscriberId || null,
      "ticketNumber": chitData?.ticketNumber || null
    }
    console.log(statusBody, 'getOrderStatusForPayment payload');
    const myChitUrl = `${SiteConstants.API_URL}payment/v2/getOrderStatusForPayment`;
    const newChitUrl = `${SiteConstants.API_URL}payment/v2/getOrderStatus`;
    const url = chitData?.myChit ? myChitUrl : newChitUrl;
    CommonService.commonPostOld(navigation, url, statusBody).then(async (data) => {
      if (data !== undefined) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    })
    .catch((error) => {
      console.log(error, "error data");
      setIsLoading(false);
    });
  };
  
  return (
    <View style={[!isLoading ? styles.container : common_styles.center_align]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <SafeAreaView style={styles.container}>
          {/* Header */}
 
          <View style={styles.headerContainer}>
           <TouchableOpacity
  onPress={() => resetToRootTab('MyChitsNavigator', { isFromPayment: true })}
>
  <Icon name="close" size={24} color="#000" />
</TouchableOpacity>
            <Text style={styles.headerText}>Payment</Text>
          </View>
          {/* Content part */}
          <View style={styles.contentContainer}>
            <PaymentFailedIconSVG width={72} height={72} />
            <Text style={styles.contentTitle}>Payment Failed</Text>
            <Text style={styles.contentTitle}>
              {"\u20B9"} {chitDetails.aamount}
            </Text>
            <View style={styles.bottomHR}></View>
            <View style={styles.contentDetails}>
              <Text style={[styles.defaultHeading, { width: "35%" }]}>
                TR Receipt No :
              </Text>
              <Text style={[styles.defaultText, { width: "65%" }]}>
                {paymentOrderId}
              </Text>
            </View>
            <View style={styles.contentDetails}>
              <Text style={[styles.defaultHeading, { width: "35%" }]}>
                TR Ref Id :
              </Text>
              <Text style={[styles.defaultText, { width: "65%" }]}>
                {chitDetails.CFOrderId}
              </Text>
            </View>
            <View style={styles.contentDetails}>
              <Text style={[styles.defaultHeading, { width: "35%" }]}>
                Amount :
              </Text>
              <Text style={[styles.defaultText, { width: "65%" }]}>
                {"\u20B9"} {chitDetails.aamount}
              </Text>
            </View>
            <View style={styles.contentDetails}>
              <Text style={[styles.defaultHeading, { width: "35%" }]}>
                Date :
              </Text>
              <Text style={[styles.defaultText, { width: "65%" }]}>
                {convertISOStringToDate(parseInt(chitDetails.apaymentDate))}
              </Text>
            </View>
            <TouchableOpacity
            onPress={() => resetToRootTab('MyChitsNavigator', { isFromPayment: true })}
              style={common_styles.primary_button}
            >
              <Text style={common_styles.primary_button_text}>Re payment</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  },
  defaultText: {
    color: CssColors.black,
    fontSize: 14,
  },
  defaultHeading: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 14,
  },
  bottomHR: {
    width: "100%",
    borderTopColor: CssColors.appBackground,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderWidth: 2,
    borderStyle: "solid",
    marginBottom: 20,
    shadowColor: CssColors.appBackground,
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  contentDetails: {
    width: "100%",
    height: "auto",
    justifyContent: "space-around",
    alignItems: "space-around",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
    paddingHorizontal: 20,
  },
  contentContainer: {
    marginHorizontal: 12,
    marginVertical: 15,
    paddingBottom: 40,
    borderRadius: 6,
    backgroundColor: CssColors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  headerText: {
    color: CssColors.primaryColor,
    fontSize: 14,
    paddingLeft: 16,
  },
  contentTitle: {
    fontSize: 20,
    paddingVertical: 10,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  moreMoney: {
    fontSize: 14,
    paddingVertical: 10,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: "600",
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    height: 90,
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 10,
    backgroundColor: CssColors.white
  },
});
 
export default PaymentFail;