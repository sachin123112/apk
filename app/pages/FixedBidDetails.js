import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Col, Row, Grid } from 'react-native-easy-grid';
import CommonService from '../services/CommonService';
import { SiteConstants } from '../SiteConstants';

const FixedBidDetails = ({ route, navigation }) => {
  const { schemeId, chitId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [languageData, setLanguageData] = useState({});
  const [fixedBidData, setFixedBidData] = useState([]);

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
    getFixedBidData();
  }, []);

  const getFixedBidData = async () => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}chit-group/v2/fixed-bid-estimate/${schemeId}/${chitId}`;
    console.log(url, 'FixedBidDetails');
    const isFixedBidData = await CommonService.commonGet(navigation, url);
    if (isFixedBidData !== undefined) {
      console.log(isFixedBidData);
      setFixedBidData(isFixedBidData);
    }
    setIsLoading(false);
  };

  const renderRow = (data, i, showPriceSymbol = true) => {
    return (
      <Row style={styles.cell} key={i}>
        <Text style={styles.cellText}>
          {showPriceSymbol ? '\u20B9' : ''} {data}
        </Text>
      </Row>
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
            <Text style={styles.headerText}>
              {languageData?.fixedBid?.label || 'Fixed bid'}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon
                name="close"
                size={24}
                color={CssColors.primaryColor}
              />
            </TouchableOpacity>
          </View>
          {/* Content part */}
          <ScrollView contentContainerStyle={[styles.contentContainer]}>
            <View style={[styles.fixedBidTableContainer]}>
              <Grid style={styles.shadowProp}>
                <Col size={24}>
                  <Row style={styles.cell}>
                    <Text style={styles.cellText}>
                      {languageData?.auctionNo?.label || 'Auction. no'}
                    </Text>
                  </Row>
                  {fixedBidData.map((data, i) => {
                    // This will render a row for each data element.
                    return renderRow(data.groupAuctionSeq, i, false);
                  })}
                </Col>
                <Col size={38}>
                  <Row style={styles.cell}>
                    <Text style={styles.cellText}>
                      {languageData?.bidAmount?.label || 'Bid amount'}
                    </Text>
                  </Row>
                  {fixedBidData.map((data, i) => {
                    // This will render a row for each data element.
                    return renderRow(data.bidAmount, i);
                  })}
                </Col>
                <Col size={38}>
                  <Row style={styles.cell}>
                    <Text style={styles.cellText}>
                      {languageData.prizedAmount?.label || 'Prized Amount'}
                    </Text>
                  </Row>
                  {fixedBidData.map((data, i) => {
                    // This will render a row for each data element.
                    return renderRow(data.prizedAmount, i);
                  })}
                </Col>
              </Grid>
            </View>
          </ScrollView>
        </SafeAreaView>
        // <Text>asdf</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: CssColors.appBackground,
    height: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: CssColors.homeDetailsBorder,
    height: 55,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25
  },
  headerText: {
    color: CssColors.primaryColor,
    fontSize: 14,
  },
  contentContainer: {
    margin: 10,
    borderRadius: 12,
    backgroundColor: CssColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedBidTableContainer: {
    width: '100%',
    height: 'auto',
    backgroundColor: CssColors.white,
    marginBottom: 20,
  },
  cell: {
    borderWidth: 1,
    borderColor: '#8F9BB31A',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
    backgroundColor: CssColors.white,
  },
  cellText: {
    color: CssColors.primaryPlaceHolderColor,
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default FixedBidDetails;
