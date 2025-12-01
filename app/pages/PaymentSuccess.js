import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNPrint from 'react-native-print';
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import { convertISOStringToDate, requestedDateTime } from "../sharedComp/Utils";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import { getObjectData } from "../sharedComp/AsyncData";
import PaymentSuccessIconSVG from '../pages/svgs/PaymentSuccessIconSVG';
import { resetToRootTab } from "../utils/RootNavigation";
 
const PaymentSuccess = ({ route, navigation }) => {
  console.log(" PaymentSuccess screen mounted");
 
  const [isLoading, setIsLoading] = useState(true);
  const [chitDetails, setChitDetails] = useState({});
  const [printData, setPrintData] = useState({});
  const { paymentOrderId , paymentVerified , result } = route.params;
 
  console.log(" Received paymentOrderId:", paymentOrderId);
  console.log(" Received paymentVerified:", paymentVerified);
  console.log(" Received result:", result);
 
  useEffect(() => {
    console.log(" useEffect triggered: fetching chitPaymentDetails");
 
    (async () => {
      console.log(" Getting chitPaymentDetails from AsyncStorage...");
      const chitData = await getObjectData("chitPaymentDetails");
 
      console.log(" chitPaymentDetails fetched:", chitData);
      setChitDetails(chitData);
      console.log(" chitDetails state updated");
 
      console.log(" Calling getDetails()");
      getDetails(chitData);
    })();
 
    return () => {
      console.log(" PaymentSuccess screen unmounted");
    };
  }, []);
 
  const getDetails = async (chitData) => {
    console.log(" getDetails() called with chitData:", chitData);
 
    setIsLoading(true);
    console.log(" Loading started: setIsLoading(true)");
    console.log(" Order status response received:", result?.data);
 
    try {
      if (result?.success == true) {
        console.log(" Valid response, fetching print data");
        getPrintData(result?.data?.paymentTransactionId);
      } else {
        console.log(" API returned undefined data");
      }
      setIsLoading(false);
      console.log(" Loading finished: setIsLoading(false)");
    } catch (error) {
      console.log(" Error in getDetails:", error.message);
      setIsLoading(false);
    };
  };
 
  const generateReceiptHTML = (printData) => {
    console.log(printData, 'print data in receipt inside generateReceiptHTML');
    const paymentDate = printData?.voucherList[0]?.receiptGenerationDateAndTime
      ? requestedDateTime(printData?.voucherList[0]?.receiptGenerationDateAndTime)
      : '--';
    
    const amount = chitDetails.aamount || '0';
    const refId = chitDetails.CFOrderId || 'N/A';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
          }
          .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .address {
            font-size: 10px;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 15px 0;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-row {
            border-bottom: 1px dashed #ccc;
          }
          .details-row td {
            padding: 8px 0;
            vertical-align: top;
          }
          .label {
            width: 40%;
          }
          .value {
            text-align: right;
            font-weight: bold;
          }
          .amount-row {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          .amount-row td {
            padding: 12px 0;
            font-size: 14px;
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://mykcpl.com/assets/kcplchitlogo-YK-nvBcg.png" alt="Kodachadri Chits Pvt Ltd" style="width: 100px; height: auto;"/>
          <div class="company-name">Kodachadri Chits Pvt Ltd</div>
          <div class="address">#17/1, MEC Road, Marappanapalya, Yeshwanthapura Bangalore Karnataka 560022</div>
          <div class="receipt-title">Receipt</div>
        </div>
        
        <table class="details-table">
          <tr class="details-row">
            <td class="label">Receipt No</td>
            <td class="value">${printData?.receiptNo}</td>
          </tr>
          <tr class="details-row">
            <td class="label">Receipt Date</td>
            <td class="value">${paymentDate}</td>
          </tr>
          <tr class="details-row">
            <td class="label">Collection at (branch)</td>
            <td class="value">${printData?.collectedBranch || '--'}</td>
          </tr>
          <tr class="details-row">
            <td class="label">Subscriber</td>
            <td class="value">${printData?.voucherList[0]?.memberName || '--'}</td>
          </tr>
          <tr class="details-row">
            <td class="label">Chit Ref</td>
            <td class="value">${printData?.voucherList[0]?.chitGroupName}</td>
          </tr>
          <tr class="details-row">
            <td class="label">TR No</td>
            <td class="value">${printData?.paymentModeNumber}</td>
          </tr>
          <tr class="details-row">
            <td class="label">Inst No</td>
            <td class="value">${parseInt(printData?.voucherList[0]?.generatedInstallments)}</td>
          </tr>
          <tr class="details-row">
            <td class="label">Mode of Rect</td>
            <td class="value">${printData?.paymentMode}</td>
          </tr>
          <tr class="details-row amount-row">
            <td class="label">Paid amount</td>
            <td class="value">₹ ${amount}</td>
          </tr>
        </table>
        
        <div class="footer">
          This is a system-generated receipt and does not require a signature.
        </div>
        <div class="footer">
          For more enquiry please call toll-free number - 1800-103-0794
        </div>
      </body>
      </html>
    `;
  };
 
  const getPrintData = async (paymentTransactionId) => {
    console.log(" getPrintData() called with:", paymentTransactionId);
 
    if (!paymentTransactionId) {
      console.log(" No transaction ID provided");
      return;
    }
 
    setIsLoading(true);
    console.log(" Loading started: print data fetch");
 
    const url = `${SiteConstants.API_URL}payment/v2/print-receipt/${paymentTransactionId}`;
    console.log(" Fetching print data URL:", url);
 
    CommonService.commonPost(navigation, url, {})
      .then(async (data) => {
        console.log(" Print data received:", data);
        setPrintData(data);
      })
      .catch((err) => {
        console.log(" Error fetching print data:", err);
      })
      .finally(() => {
        setIsLoading(false);
        console.log(" Loading finished: print data fetched");
      });
  };
 
  const downloadPDF = async () => {
    console.log(" Download PDF initiated",printData);
 
    try {
      setIsLoading(true);
      console.log(" Loading while generating PDF");
 
      await RNPrint.print({
        html: generateReceiptHTML(printData),
        fileName: `receipt_${paymentOrderId}`,
      });
 
      console.log("PDF Printed Successfully");
      setIsLoading(false);
    } catch (error) {
      console.log(" PDF Print Error:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to generate receipt. Please try again.");
    }
  };
 
  console.log("Rendering screen | isLoading:", isLoading);
 
  return (
    <View style={[!isLoading ? styles.container : common_styles.center_align]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <View style={styles.container}>
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
            <PaymentSuccessIconSVG width={72} height={72} />
            <Text style={styles.contentTitle}>Payment Successful</Text>
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
                {" "}
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
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={downloadPDF}
                style={styles.secondary_button}
              >
                <Text style={styles.secondary_button_text}>Download pdf</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={() => resetToRootTab('MyChitsNavigator', { isFromPayment: true })}
                style={styles.primary_button}
              >
                <Text style={common_styles.primary_button_text}>Continue</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => resetToRootTab('MyChitsNavigator', { isFromPayment: true })}>
              <Text style={styles.moreMoney}>Top up More money</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  primary_button: {
    backgroundColor: CssColors.primaryColor,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    borderRadius: 20,
    marginVertical: 20
  },
  secondary_button: {
    backgroundColor: CssColors.white,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    borderRadius: 20,
    marginVertical: 20,
    borderColor: CssColors.primaryColor,
    borderWidth: 1,
    borderStyle: "solid",
  },
  secondary_button_text: {
    color: CssColors.primaryColor,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20
  }
});
 
export default PaymentSuccess;