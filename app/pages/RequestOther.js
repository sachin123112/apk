import {
  ScrollView,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storeObjectData, storeStringData, getObjectData } from '../sharedComp/AsyncData';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';
import CommonService from '../services/CommonService';
import { SiteConstants } from '../SiteConstants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ErrorView from './ErrorView'; // Import ErrorView component

const RequestOther = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [narration, setNarration] = useState('');
  const [memberID, setMemberID] = useState('');
  const [showErrorView, setShowErrorView] = useState(false);
  const [errorViewConfig, setErrorViewConfig] = useState({
    message: '',
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
      setMemberID(userData?.id);
      setIsLoading(false);
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

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
      setErrorViewConfig({
        message: 'Something went wrong, kindly try again later.',
        icon: 'alert-circle-outline',
        buttonText: 'Go Back',
        iconColor: CssColors.textColorSecondary
      });
      setShowErrorView(true);
      return null;
    }
  };

  const onOtherSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Using Alert for validation error
      if (narration === null || narration === '') {
        Alert.alert(
          "Validation Error",
          "Narration cannot be empty",
          [{ text: "OK", onPress: () => setIsLoading(false) }]
        );
        setIsLoading(false);
        return;
      }
      
      const payLoadData = {
        'memberId': memberID,
        'groupName': null,
        'requestType': 'Other',
        'narration': narration,
        'changePhoneNo': null,
        'oldPhoneNo': null,
        'prizedChitId': null
      };
      
      const url = `${SiteConstants.API_URL}user/v2/serviceRequest/save/${memberID}`;
      const data = await CommonService.commonPost(navigation, url, payLoadData);
      
      if (data !== undefined) {
        // Success case: Show success ErrorView
        setErrorViewConfig({
          message: 'Other request is submitted successfully.',
          icon: 'check-circle-outline', // Success icon
          iconColor: CssColors.green,
          buttonText: 'Go Back'
        });
        setShowErrorView(true);
        setNarration('');
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.log(error, 'error data');
      // Error case: Show error ErrorView
      setErrorViewConfig({
        message: 'Something went wrong, kindly try again later.',
        icon: 'alert-circle-outline',
        buttonText: 'Go Back',
        iconColor: CssColors.textColorSecondary
      });
      setShowErrorView(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorViewBackPress = () => {
    setShowErrorView(false);
    navigation.goBack();
  };

  // Render ErrorView if showErrorView is true
  if (showErrorView) {
    return (
      <ErrorView 
        message={errorViewConfig.message}
        onBackPress={handleErrorViewBackPress}
        icon={errorViewConfig.icon}
        buttonText={errorViewConfig.buttonText}
        iconColor={errorViewConfig.iconColor}
      />
    );
  }

  return (
    <View style={[
      !isLoading ? [
        styles.container, 
        insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}
      ] : common_styles.center_align
    ]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.headerContainer, common_styles.borderBottom]}>
            <Text style={styles.headerText}>Other request</Text>
            <Icon
              onPress={() => navigation.goBack()}
              name="close"
              size={24}
              color={CssColors.primaryColor}
            />
          </View>
          {/* Content part */}
          <ScrollView
            contentContainerStyle={[
              styles.marginTop20,
              common_styles.chit_container,
              styles.paddingLeft_0,
              common_styles.shadowProp,
            ]}
          >
            <View style={styles.contentContainer}>
              <Text
                style={[
                  common_styles.fontsize12,
                  common_styles.margin_bottom_5,
                ]}
              >
                Add narration
              </Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  underlineColorAndroid="transparent"
                  placeholder="Add your narration"
                  placeholderTextColor="grey"
                  numberOfLines={10}
                  multiline={true}
                  value={narration}
                  onChangeText={(text) => setNarration(text)}
                />
              </View>
            </View>
          </ScrollView>
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              onPress={() => onOtherSubmit()}
              style={[common_styles.primary_button]}
            >
              <Text style={common_styles.primary_button_text}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomButtonContainer: {
    height: 80,
    alignItems: 'center',
    backgroundColor: CssColors.white,
    borderTopColor: CssColors.homeDetailsBorder,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderWidth: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  textAreaContainer: {
    borderColor: CssColors.primaryBorder,
    borderWidth: 1,
    padding: 5,
    borderRadius: 4,
  },
  marginTop10: {
    marginTop: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: CssColors.appBackground,
    height: '100%',
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
  marginTop20: {
    marginTop: 20,
  },
  headerText: {
    color: CssColors.primaryColor,
    fontSize: 14,
  },
  paddingLeft_0: {
    paddingLeft: 0,
  },
  textArea: {
    height: 150,
    justifyContent: 'flex-start',
    color: CssColors.black,
  }
});

export default RequestOther;
