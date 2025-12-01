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
import { CssColors } from '../css/css_colors';
import { storeObjectData, storeStringData, getObjectData } from '../sharedComp/AsyncData';
import common_styles from '../css/common_styles';
import CommonService from '../services/CommonService';
import { SiteConstants } from '../SiteConstants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SelectList } from 'react-native-dropdown-select-list';
import ErrorView from './ErrorView';

const RequestTransferChit = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [transferChitData, setTransferChitData] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState('');
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
    loadData();
    return () => {
      // Cleanup when component unmounts
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setShowErrorView(false);
      await getDropdownOptions('TRANSFERCHIT');
    } catch (err) {
      setErrorViewConfig({
        message: 'Something went wrong. Please try again later.',
        icon: 'alert-circle-outline',
        buttonText: 'Go Back',
        iconColor: CssColors.textColorSecondary
      });
      setShowErrorView(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getDropdownOptions = async (type) => {
    try {
      let userData = await getObjectData('userData');
      if (!userData) {
        userData = await fetchUserData();
      }
  
      if (userData && userData.data) {
        userData = userData.data;
      }
      
      const memberIds = userData?.id;
      setMemberID(userData?.id);
      
      const url = `${SiteConstants.API_URL}user/v2/getMemberChitGroup/${memberIds}/${type}`;
      const response = await CommonService.commonGet(navigation, url);
      
      if (response === undefined) {
        setErrorViewConfig({
          message: 'Something went wrong. Please try again later.',
          icon: 'alert-circle-outline',
          buttonText: 'Go Back',
          iconColor: CssColors.textColorSecondary
        });
        setShowErrorView(true);
        return;
      }
      
      // Check if response is empty or has no data
      if (!response || response.length === 0) {
        setErrorViewConfig({
          message: 'There are no chits available to transfer.',
          icon: 'information-outline',
          buttonText: 'Go Back',
          iconColor: CssColors.textColorSecondary
        });
        setShowErrorView(true);
        return;
      }
      
      let dropdownData = [];
      response.forEach((data) => {
        const innerData = {
          key: data.groupName,
          value: data.groupName,
        };
        dropdownData.push(innerData);
      });
      
      setTransferChitData(dropdownData);
    } catch (error) {
      console.log(error, 'error data');
      setErrorViewConfig({
        message: 'Something went wrong. Please try again later.',
        icon: 'alert-circle-outline',
        buttonText: 'Try Again',
        iconColor: CssColors.textColorSecondary
      });
      setShowErrorView(true);
    }
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

  const setChitDataDropdown = (data) => {
    setSelectedGroupName(data);
  };

  const onTransferChit = async () => {
    try {
      setIsLoading(true);
      
      // Using Alert for validation errors like in RequestPhoneNumberChange
      if (selectedGroupName === null || selectedGroupName === '') {
        Alert.alert(
          "Validation Error",
          "Transfer chit number cannot be empty",
          [{ text: "OK", onPress: () => setIsLoading(false) }]
        );
        setIsLoading(false);
        return;
      }
      
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
        'requestType': 'Transferchit',
        'narration': narration,
        'changePhoneNo': null,
        'oldPhoneNo': null,
        'prizedChitId': selectedGroupName
      };
      
      const url = `${SiteConstants.API_URL}user/v2/serviceRequest/save/${memberID}`;
      const data = await CommonService.commonPost(navigation, url, payLoadData);
      console.log(url, 'transferchit');
      if (data !== undefined) {
        // Success case: Show success ErrorView instead of alert
        setErrorViewConfig({
          message: 'Transfer chit request is submitted successfully.',
          icon: 'check-circle-outline', // Success icon
          iconColor: CssColors.green,
          buttonText: 'Go Back'
        });
        setShowErrorView(true);
        setSelectedGroupName('');
        setNarration('');
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.log(error, 'error data');
      // Error case: Show error ErrorView instead of alert
      setErrorViewConfig({
        message: 'Something went wrong, kindly try after some time.',
        icon: 'alert-circle-outline',
        buttonText: 'Go back',
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

  // Render loading state
  if (isLoading) {
    return (
      <View style={common_styles.center_align}>
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}]}>
      {/* Header */}
      <View style={[styles.headerContainer, common_styles.borderBottom]}>
        <Text style={styles.headerText}>Transfer chit request</Text>
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
          {transferChitData.length > 0 ? (
            <>
              <Text style={common_styles.fontsize12}>
                Transfer chit number
              </Text>
              <SelectList
                boxStyles={[common_styles.select_list_document]}
                inputStyles={{ color: CssColors.black }}
                dropdownTextStyles={{ color: CssColors.black }}
                setSelected={(data) => setChitDataDropdown(data)}
                data={transferChitData}
              />
            </>
          ) : (
            <ActivityIndicator
              size="large"
              color={CssColors.textColorSecondary}
            />
          )}

          <Text
            style={[
              common_styles.fontsize12,
              common_styles.marginTopTen,
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
          onPress={() => onTransferChit()}
          style={[common_styles.primary_button]}
        >
          <Text style={common_styles.primary_button_text}>Submit</Text>
        </TouchableOpacity>
      </View>
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
  marginTop20: { marginTop: 20, },
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
  },
});

export default RequestTransferChit;
