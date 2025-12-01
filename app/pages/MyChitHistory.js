import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';
import { SiteConstants } from '../SiteConstants';
import CommonService from '../services/CommonService';
import { requestedDateTime } from '../sharedComp/Utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MyChitHistory = ({ route, navigation }) => {
  const { chitId } = route.params;
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    getMychitsHistory();
  }, []);

  const getMychitsHistory = async () => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}auction/auction-history/${chitId}`;
    try {
      const myChitData = await CommonService.commonGet(navigation, url);
      setIsLoading(false);
      if (myChitData !== undefined) {
        setHistoryData(myChitData);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}]}>
      {isLoading ? (
        <View style={common_styles.center_align}>
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={[styles.headerContainer, common_styles.borderBottom]}>
              <Text style={styles.headerText}>Auction winner history</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon
                  name="close"
                  size={24}
                  color={CssColors.primaryColor}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[styles.requestHistoryContainer, common_styles.shadowProp]}
            >
              {historyData &&
                historyData.length > 0 &&
                historyData.map((data, index) => {
                  const isFirstItem = index === 0;
                  return (
                    <View
                      key={data.id}
                      style={styles.requestHistoryContainerInner}
                    >
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.requestedDateText}>
                          {requestedDateTime(data.auctionDateTime)}
                        </Text>
                        {isFirstItem &&
                          <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{color: CssColors.primaryBorder, fontSize: 8}}>Winner ticket ID </Text>
                            <Text style={{paddingRight: 10, color: CssColors.primaryPlaceHolderColor, fontSize: 12, fontWeight: '600'}}>
                              {data.ticketNumber}
                            </Text>
                          </View>
                        }
                      </View>
                      <View style={styles.requestHistoryContainerInnerTwo}>
                        <View style={styles.columnone}>
                          <Text style={styles.requestHistoryTitleText}>
                            Auction No
                          </Text>
                          <Text style={styles.requestHistoryTitleTextData}>
                            {data.auctionNo}
                          </Text>
                        </View>
                        <View style={styles.columnone}>
                          <Text style={styles.requestHistoryTitleText}>
                            Bid amount
                          </Text>
                          <Text style={styles.requestHistoryTitleTextData}>
                            {'\u20B9'} {data.bidAmount}
                          </Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                          <Text style={styles.requestHistoryTitleText}>
                            Prized amount
                          </Text>
                          <Text style={styles.requestHistoryTitleTextData}>
                            {'\u20B9'} {data.prizedAmount}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              {historyData.length === 0 && (
                <Text style={{ paddingBottom: 10 }}>
                  No History data available
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: CssColors.white,
  },
  requestHistoryContainerInner: {
    paddingBottom: 10,
  },
  requestHistoryContainerInnerTwo: {
    flex: 1,
    flexDirection: 'row',
    borderBottomColor: CssColors.homeDetailsBorder,
    borderBottomWidth: 1,
  },
  scrollView: {
    backgroundColor: CssColors.appBackground,
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
    flexDirection: 'column',
  },
  requestHistoryContainer: {
    marginVertical: 15,
    marginHorizontal: 10,
    paddingLeft: 10,
    paddingTop: 10,
    borderRadius: 12,
    backgroundColor: CssColors.white,
  },
  requestedDateText: {
    fontSize: 12,
    lineHeight: 26,
    color: CssColors.primaryPlaceHolderColor,
  },
  requestHistoryTitleText: {
    fontSize: 8,
    lineHeight: 16,
    color: CssColors.primaryBorder,
  },
  requestHistoryTitleTextData: {
    fontSize: 12,
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: '600',
  },
});

export default MyChitHistory;
