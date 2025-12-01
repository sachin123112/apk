import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Col, Row, Grid } from "react-native-easy-grid";
import CommonService from "../services/CommonService";
import { SiteConstants } from "../SiteConstants";

const AccountCopyDetails = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [languageData, setLanguageData] = useState({});
  const [fixedBidData, setFixedBidData] = useState([
    {
      date: "28-2",
      narration: "First Installment",
      payable: 5000,
      paid: "",
    },
    {
      date: "28-2",
      narration: "Auction 1",
      payable: 5000,
      paid: "",
    },
    {
      date: "28-2",
      narration: "Penalty",
      payable: 300,
      paid: "",
    },
    {
      date: "28-2",
      narration: "Receipt",
      payable: "",
      paid: 1000,
    },
    {
      date: "28-2",
      narration: "Auction 2",
      payable: 5000,
      paid: "",
    },
    {
      date: "28-2",
      narration: "Auction 2",
      payable: 5000,
      paid: 5000,
    },
  ]);

  useEffect(() => {
    setIsLoading(true);
    getLanguageData();
  }, []);

  const getLanguageData = async () => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}page/getResourceBundle?pageName=FixedBidDetails&language=en&serviceType=MOBILE`;
    const myLanguageData = await CommonService.commonGet(navigation, url);
    if (myLanguageData !== undefined) {
      setLanguageData(myLanguageData.resourceBundle);
    }
    setIsLoading(false);
  };

  const renderRow = (data, showPriceSymbol = true) => {
    return (
      <Row style={styles.cell}>
        <Text style={styles.cellText}>
          {showPriceSymbol && data ? "\u20B9" : ""} {data}
        </Text>
      </Row>
    );
  };

  const renderRowTwo = (data, showPriceSymbol = true) => {
    return (
      <Row style={styles.cell}>
        <Text style={styles.cellTextHeader}>
          {showPriceSymbol && data ? "\u20B9" : ""} {data}
        </Text>
      </Row>
    );
  };

  const renderTopRow = (title, value) => {
    return (
      <View style={styles.ContainerContentInnerWidth}>
        <Text style={styles.topbarDataTitle}>{title}</Text>
        <Text style={styles.topbarDataValue}>{value}</Text>
      </View>
    );
  };

  const renderTopRowTwo = (title, value) => {
    return (
      <View style={styles.ContainerContentInnerWidth}>
        <Text style={styles.topbarDataTitle}>{title}</Text>
        <Text style={styles.topbarDataValue}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={[!isLoading ? styles.container : common_styles.center_align]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Account copy</Text>
            <Icon
              onPress={() => navigation.goBack()}
              name="close"
              size={24}
              color={CssColors.primaryColor}
            />
          </View>
          {/* Content part */}
          <View style={styles.contentContainerHeader}>
            <View style={styles.contentContainerHeaderInner}>
              <View style={styles.containerContentWidth}>
                {renderTopRow('Chit id', 'A20001')}
                {renderTopRowTwo('Payable amount', '20000')}
              </View>
              <View style={styles.containerContentWidth}>
                {renderTopRowTwo('Payable amount', '20000')}
                {renderTopRow('Running inst', 5)}
              </View>
              <View style={styles.containerContentWidth}>
                {renderTopRowTwo('Dividend earned', '5000')}
                {renderTopRowTwo('Total due', '6000')}
              </View>
            </View>
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.AccountCopyTableContainer}>
              <Grid>
                <Col size={15}>
                  <Row style={styles.cell}>
                    <Text style={styles.cellTextHeader}>Date</Text>
                  </Row>
                  {fixedBidData.map((data) => {
                    // This will render a row for each data element.
                    return renderRowTwo(data.date, false);
                  })}
                </Col>
                <Col size={45}>
                  <Row style={styles.cell}>
                    <Text style={styles.cellTextHeader}>
                      {languageData?.bidAmount?.label}
                    </Text>
                  </Row>
                  {fixedBidData.map((data) => {
                    // This will render a row for each data element.
                    return renderRow(data.narration, false);
                  })}
                </Col>
                <Col size={20}>
                  <Row style={styles.cell}>
                    <Text style={styles.cellTextHeader}>
                      {languageData.prizedAmount?.label}
                    </Text>
                  </Row>
                  {fixedBidData.map((data) => {
                    // This will render a row for each data element.
                    return renderRow(data.payable);
                  })}
                </Col>
                <Col size={20}>
                  <Row style={styles.cell}>
                    <Text style={styles.cellTextHeader}>
                      {languageData.prizedAmount?.label}
                    </Text>
                  </Row>
                  {fixedBidData.map((data) => {
                    // This will render a row for each data element.
                    return renderRow(data.paid);
                  })}
                </Col>
              </Grid>
            </View>
          </View>
        </SafeAreaView>
        // <Text>asdf</Text>
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
    height: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "transparent",
    borderBottomColor: CssColors.homeDetailsBorder,
    height: 55,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    color: CssColors.primaryColor,
    fontSize: 14,
  },
  contentContainer: {
    margin: 10,
    borderRadius: 6,
    backgroundColor: CssColors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainerHeader: {
    backgroundColor: CssColors.white,
    margin: 0,
    width: '100%'
  },
  contentContainerHeaderInner: {
    backgroundColor: CssColors.appBackground,
    margin: 10,
    flexDirection: 'row'
  },
  containerContentWidth: {
    width: '33.33%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "transparent",
    borderRightColor: CssColors.white,
    marginRight: 2
  },
  AccountCopyTableContainer: {
    width: "100%",
    height: 'auto',
    minHeight: 100,
  },
  cell: {
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
    backgroundColor: CssColors.white
  },
  cellText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 12
  },
  cellTextHeader: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 12,
    fontWeight: '600'
  },
  ContainerContentInnerWidth: {
    width: '100%',
    marginBottom: 10
  },
  topbarDataTitle: {
    fontSize: 12,
    color: CssColors.primaryPlaceHolderColor,
    paddingBottom: 4
  },
  topbarDataValue: {
    fontSize: 12,
    color: CssColors.primaryTitleColor,
    fontWeight: '600',
  }
});

export default AccountCopyDetails;
