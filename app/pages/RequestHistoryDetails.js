import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';
import { requestedDateTime, completionDate } from '../sharedComp/Utils';
import { storeObjectData, storeStringData, getObjectData } from '../sharedComp/AsyncData';
import { SiteConstants } from '../SiteConstants';
import CommonService from '../services/CommonService';
import ErrorView from './ErrorView';

const windowHeight = Dimensions.get('window').height;

const RequestHistoryDetails = ({ route, navigation }) => {
  const [requestHistoryData, setRequestHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [errorViewConfig, setErrorViewConfig] = useState({
    message: 'No request history data available',
    icon: 'alert-circle-outline',
    buttonText: 'Go Back',
    iconColor: CssColors.textColorSecondary
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let userData = await getObjectData('userData');
      if (!userData) {
        userData = await fetchUserData();
      }
  
      if (userData && userData.data) {
        userData = userData.data;
      }
      const memberIds = userData?.id;
      console.log(memberIds);
      const urls = `${SiteConstants.API_URL}user/v2/serviceRequest/${memberIds}`;
      const historyData = await CommonService.commonGet(navigation, urls);
      if (historyData !== undefined) {
        console.log(historyData, 'request hhi');
        setRequestHistoryData(historyData);
        setIsLoading(false);
      } else {
        setRequestHistoryData([]);
        setIsLoading(false);
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  const handleErrorViewBackPress = () => {
    navigation.goBack();
  };

  const fetchUserData = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData('userData', response);
      await storeStringData('memberID', response.id ?? '');
      return response;
    } catch (error) {
      console.log('catch ====>', error);
      setIsLoading(false);
      return 'null';
    }
  };

  return (
    <View style={[styles.container, insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}]}>
      {isLoading ? (
        <View style={common_styles.center_align}>
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        </View>
      ) : requestHistoryData && requestHistoryData.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={[styles.dataContainer, common_styles.shadowProp]}>
            {requestHistoryData.map((requestData, index) => {
              return (
                <View style={styles.requestHistoryContainerInner} key={index}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.requestedDateText}>
                      {requestData.requestedDateTime ? requestedDateTime(requestData.requestedDateTime) : '--'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={styles.columnone}>
                      <Text style={styles.requestHistoryTitleText}>
                        Request for
                      </Text>
                      <Text style={styles.requestHistoryTitleTextData}>
                        {requestData.requestType}
                      </Text>
                    </View>
                    <View style={styles.columnone}>
                      <Text style={styles.requestHistoryTitleText}>
                        Status
                      </Text>
                      <Text style={styles.requestHistoryTitleTextData}>
                        {requestData.status}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                      <Text style={styles.requestHistoryTitleText}>
                        Completion date
                      </Text>
                      <Text style={styles.requestHistoryTitleTextData}>
                        {requestData.completedDateTime !== null
                          ? completionDate(requestData.completedDateTime)
                          : '-'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <ErrorView 
          message={errorViewConfig.message}
          onBackPress={handleErrorViewBackPress}
          icon={errorViewConfig.icon}
          buttonText={errorViewConfig.buttonText}
          iconColor={errorViewConfig.iconColor}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: CssColors.appBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  dataContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: CssColors.white,
    marginHorizontal: 12,
    marginVertical: 10,
    padding: 10,
    borderRadius: 12,
  },
  requestHistoryContainerInner: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: CssColors.homeDetailsBorder,
    paddingBottom: 10,
    marginBottom: 10, // Add margin between items
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRequestHistoryContainer: {
    borderRadius: 12,
    padding: 20,
    margin: 10,
    backgroundColor: CssColors.white,
    width: '90%',
    alignItems: 'center',
  },
  columnone: {
    flex: 1,
    flexDirection: 'column',
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

export default RequestHistoryDetails;
