import {
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert, PermissionsAndroid, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import DefaultBottomSheet from "../components/DefaultBottomSheet";
import { SelectList } from 'react-native-dropdown-select-list';
import ModalSelector from 'react-native-modal-selector';
import {
  getStringData,
  getObjectData,
  storeObjectData,
  storeStringData,
  removeAsyncData
} from '../sharedComp/AsyncData';
import { SiteTexts } from '../texts/SiteTexts';
import { CssColors } from '../css/css_colors';
import common_styles from '../css/common_styles';
import { SiteConstants } from '../SiteConstants';
import CommonService from '../services/CommonService';
import Icon from 'react-native-vector-icons/AntDesign';
import DatePicker from 'react-native-date-picker';
import {
  convertISOStringToDate,
  states
} from '../sharedComp/Utils';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ScanDocumentIconSVG from './svgs/ScanDocumentIconSVG';
import CloseIconSVG from './svgs/CloseIconSVG';
import UploadIconSVG from './svgs/UploadIconSVG';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

const genderTypes = [
  {
    key: 1,
    name: 'Male',
    pname: 'MALE',
    value: 1,
    buttonClass: common_styles.gender_buttons,
    textClass: common_styles.gender_button_text,
  },
  {
    key: 2,
    name: 'Female',
    pname: 'FEMALE',
    value: 2,
    buttonClass: common_styles.gender_buttons,
    textClass: common_styles.gender_button_text,
  },
  {
    key: 3,
    name: 'Others',
    pname: 'OTHERS',
    value: 3,
    buttonClass: common_styles.gender_buttons,
    textClass: common_styles.gender_button_text,
  },
];

const documentTypes = [
  { key: 'AADHAR', value: 'AADHAR' },
  { key: 'PAN', value: 'PAN' },
  { key: 'DRIVINGLICENSE', value: 'DRIVINGLICENSE' },
  { key: 'PASSPORT', value: 'PASSPORT' },
  { key: 'VOTERID', value: 'VOTERID' },
  { key: 'RATIONCARD', value: 'RATIONCARD' },
];

const Document = ({ navigation }) => {
  const [gender, setGender] = useState(0);
  const [addressLine, setAddressLine] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPinCode, setAddressPinCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('India');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isDocumentNumberValid, setIsDocumentNumberValid] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [maxFileSizeError, setMaxFileSizeError] = useState(false);
  const [minimumLength, setMinimumLength] = useState(12);
  const [maximumLength, setMaximumLength] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [isAadharExists, setIsAadharExists] = useState(false);
  const [photo, setPhoto] = useState('');
  const [documentImage, setDocumentImage] = useState('');
  const [isPhoto, setIsPhoto] = useState(false);
  const [dob, setDob] = useState('');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const appVersion = DeviceInfo.getVersion();
  const checkPlatform = Platform.OS.toUpperCase();

  useEffect(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    checkIsAllFeildsNotNull();
  }, [
    gender,
    addressCity,
    addressLine,
    addressState,
    addressPinCode,
    addressCountry,
    documentNumber,
    dob,
    isDocumentNumberValid,
    minimumLength,
    maximumLength,
  ]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission granted');
          return true;
        } else {
          console.log('Camera permission denied');
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permission from app settings',
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      try {
        const status = await check(PERMISSIONS.IOS.CAMERA);
        console.log('Current camera permission status:', status);
        switch (status) {
          case RESULTS.UNAVAILABLE:
            Alert.alert(
              'Camera Not Available',
              'Camera is not available on this device',
            );
            return false;
          case RESULTS.DENIED:
            console.log('Permission denied, requesting...');
            const result = await request(PERMISSIONS.IOS.CAMERA);
            console.log('Permission request result:', result);
            if (result === RESULTS.GRANTED) {
              return true;
            } else if (result === RESULTS.BLOCKED) {
              // User denied, show settings option
              Alert.alert(
                'Camera Permission Blocked',
                'Camera access was denied. Please enable it in Settings.',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Open Settings',
                    onPress: () => openSettings(),
                  },
                ],
              );
            }
            return false;
          case RESULTS.LIMITED:
            // iOS 14+ limited permission
            return true;
          case RESULTS.GRANTED:
            console.log('Permission already granted');
            return true;
          case RESULTS.BLOCKED:
            Alert.alert(
              'Camera Permission Blocked',
              'Camera access is blocked. Please enable it in Settings > Privacy & Security > Camera.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Open Settings',
                  onPress: () => openSettings(),
                },
              ],
            );
            return false;
          default:
            return false;
        }
      } catch (error) {
        console.error('Permission error:', error);
        Alert.alert('Error', 'Failed to check camera permission');
        return false;
      }
    }
  };

  const checkIsAllFeildsNotNull = async () => {
    try {
      const userAad = await getObjectData('userDataA');
      const userPic = await getObjectData('userDataP');

      // Helper function to safely check string length
      const safeLength = (value) => {
        return (value || '').toString().trim().length > 0;
      };

  let validate=true;
  if((documentNumber || '').toString().trim().length == 12){
     validate= await validateAadhaar(documentNumber);
    }
      // First check all the field requirements
      const fieldValidation = {
        gender: gender !== 0,  // Must be explicitly selected (not 0)
        addressCity: safeLength(addressCity),
        addressLine: safeLength(addressLine),
        addressState: safeLength(addressState),
        addressPinCode: safeLength(addressPinCode),
        dob: safeLength(dob),
        addressCountry: safeLength(addressCountry),
        documentType: safeLength(documentType),
        documentNumber: (documentNumber || '').toString().trim().length == 12,
        documentNumberValid: !isDocumentNumberValid
      };

      // Check images
      const imageValidation = {
        hasPhoto: !!userPic,
        hasDocument: !!userAad
      };

      // ALL field validations must be true
      const allFieldsValid = Object.entries(fieldValidation).every(([key, value]) => {
        if (!value) {
          console.log(`Failed validation for: ${key}`);
        }
        return value === true;
      });
      // Both images must be present
      const hasRequiredImages = imageValidation.hasPhoto && imageValidation.hasDocument;

      // Final validation - everything must be valid
      const isFormValid = allFieldsValid && hasRequiredImages && !validate;

      console.log('Final Validation:', {
        allFieldsValid,
        hasRequiredImages,
        isFormValid,
        genderSelected: gender !== 0,
        buttonShouldBeDisabled: !isFormValid
      });

      // Update button state - disabled unless everything is valid
      setIsButtonDisabled(!isFormValid);

    } catch (error) {
      console.error('Validation Error:', error);
      setIsButtonDisabled(true);
    }
  };
const validateAadhaar=async (aadhaarNum)=>{
const mobileNumber = await getStringData("mobileNumber");
const isMemberId = await getStringData('memberID');
let validation= await CommonService.commonGetAadhar(`${SiteConstants.API_URL}user/v2/validate-aadhaar/${mobileNumber}/${aadhaarNum}/${isMemberId}`)
setIsAadharExists(validation.status=="FAILED");
return validation.status=="FAILED";
}

  const ShowDOB = (labelName) => {
    return (
      <View style={styles.positionRelative}>
        <TextInput
          style={common_styles.primary_input}
          value={dob}
          placeholder={labelName}
          placeholderTextColor={CssColors.primaryPlaceHolderColor}
        />
        <Icon
          name="calendar"
          style={styles.calenderIcon}
          size={24}
          color={CssColors.primaryColor}
          onPress={() => setOpen(true)}
        />
        <DatePicker
          modal
          mode="date"
          open={open}
          date={date}
          onConfirm={(date) => {
            setOpen(false);
            setDate(date);
            setDob(convertISOStringToDate(date));
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
      </View>
    );
  };

  const AadharErrorMessage = () => {
    return (
      <View
        style={[
          common_styles.login_error_container,
          common_styles.margin_bottom_20,
        ]}
      >
        <Image
          style={common_styles.error_icon}
          source={require('../../assets/error.png')}
        />
        <Text style={common_styles.login_error_text}>
          {documentType === 'AADHAR' && <>{SiteTexts.error_aadhar_invalid}</>}
          {documentType === 'PAN' && <>{SiteTexts.error_pan_invalid}</>}
          {documentType === 'DRIVINGLICENSE' && (
            <>{SiteTexts.error_dl_invalid}</>
          )}
          {documentType === 'PASSPORT' && (
            <>{SiteTexts.error_passport_invalid}</>
          )}
          {documentType === 'VOTERID' && (
            <>{SiteTexts.error_voter_id_invalid}</>
          )}
          {documentType === 'RATIONCARD' && (
            <>{SiteTexts.error_ration_invalid}</>
          )}
        </Text>
      </View>
    );
  };

  const MaxFileSizeError = () => {
    return (
      <View style={common_styles.document_error_container}>
        <Image
          style={common_styles.error_icon}
          source={require('../../assets/error.png')}
        />
        <Text style={common_styles.document_error_text}>
          {SiteTexts.document_max_filesize_limit}
        </Text>
      </View>
    );
  };

  const showImagePicker = async () => {
    setMaxFileSizeError(false);
    
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
      selectionLimit: 1,
      // Built-in cropping
      cropping: true,
      cropperCircleOverlay: false,
      freeStyleCropEnabled: true,
      cropperToolbarTitle: 'Edit Photo',
      width: 300,
      height: 400,
      enableRotationGesture: true,
    };
  
    try {
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      if (result.errorCode) {
        console.error('ImagePicker Error:', result.errorMessage);
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Check file size
        const fileSizeInMB = selectedImage.fileSize / (1024 * 1024);
        if (fileSizeInMB >= SiteConstants.FILE_SIZE_LIMIT) {
          setIsPhoto(false);
          setIsVisible(false);
          setMaxFileSizeError(true);
          return;
        }
        
        // No need for separate cropping - directly process the image
        uploadReceivedImage({
          path: selectedImage.uri,
          uri: selectedImage.uri,
          mime: selectedImage.type,
          size: selectedImage.fileSize,
          width: selectedImage.width,
          height: selectedImage.height
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Failed to pick image. Please try again.');
    }
  };

  const uploadReceivedImage = (response) => {
    if (response) {
      const result = response;
      const fileSizeInMB = result.fileSize || result.size / (1024 * 1024);
      if (fileSizeInMB >= SiteConstants.FILE_SIZE_LIMIT) {
        setIsPhoto(false);
        setIsVisible(false);
        setMaxFileSizeError(true);
        return;
      }
      const sfile = 'file';
      const uriData = result.uri;
      const fileName = result.fileName;
      const fileType = result.type;
      const url = isPhoto
        ? `${SiteConstants.API_URL}user/v2/upload/PHOTO`
        : `${SiteConstants.API_URL}user/v2/upload/AADHAR`;
      setIsButtonDisabled(true);
      uploadPhotoDocument(
        url,
        'file',
        result.path,
        'filename',
        result.mime,
        result
      ).then(async (json) => {
        if (json !== undefined) {
          if (json.fileName != undefined && json.fileName != null) {
            if (isPhoto) {
              setPhoto(result);
            } else {
              setDocumentImage(result);
            }
            isPhoto
              ? await storeObjectData('userDataP', json)
              : await storeObjectData('userDataA', json);
            checkIsAllFeildsNotNull();
          } else {
            Alert.alert(json.error + '. Please try again');
          }
        }
      });

      setIsPhoto(false);
      setIsVisible(false);
    }
  };

  const openCamera = async () => {
    setMaxFileSizeError(false);

    // Request camera permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }    
    
    // Hide status bar
    StatusBar.setHidden(true, 'fade');
    
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
      saveToPhotos: false,
      // Built-in cropping
      cropping: true,
      cropperCircleOverlay: false,
      freeStyleCropEnabled: true,
      cropperToolbarTitle: 'Edit Photo',
      width: 300,
      height: 400,
      enableRotationGesture: true,
    };
  
    try {
      const result = await launchCamera(options);
      
      // Always restore status bar
      StatusBar.setHidden(false, 'fade');
      
      if (result.didCancel) {
        console.log('User cancelled camera');
        return;
      }
      
      if (result.errorCode) {
        console.error('Camera Error:', result.errorMessage);
        // Handle specific error codes
        if (result.errorCode === 'camera_unavailable') {
          Alert.alert("Camera Not Available", "Your device camera might be busy or not working properly");
        } else if (result.errorCode === 'permission') {
          Alert.alert("Permission Error", "Camera permission was denied");
        }        
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const capturedImage = result.assets[0];
        
        // Check file size
        const fileSizeInMB = capturedImage.fileSize / (1024 * 1024);
        if (fileSizeInMB >= SiteConstants.FILE_SIZE_LIMIT) {
          setIsPhoto(false);
          setIsVisible(false);
          setMaxFileSizeError(true);
          return;
        }
        
        // No need for separate cropping - directly process the image
        uploadReceivedImage({
          path: capturedImage.uri,
          uri: capturedImage.uri,
          mime: capturedImage.type,
          size: capturedImage.fileSize,
          width: capturedImage.width,
          height: capturedImage.height
        });
      }
    } catch (error) {
      StatusBar.setHidden(false, 'fade');
      console.error('Error with camera:', error);
      Alert.alert("Camera Error", `Failed to take photo: ${error.message}`);
    }
  };

  const uploadPhotoDocument = async (
    url,
    sfile,
    uriData,
    fileName,
    fileType,
    doc
  ) => {
    let formData = new FormData();
    const token = await getStringData('token');
    formData.append('file', {
      uri: uriData,
      name: 'photo.png',
      type: fileType,
    });
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: '*/*',
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      });
      const json = await response.json();
      setIsLoading(false);
      // Call validation after successful upload
      if (json && json.fileName) {
        await checkIsAllFeildsNotNull();
      }
      return json;
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Unable to upload doc');
      console.error(error);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Calculate years
    let age = today.getFullYear() - birth.getFullYear();
    
    // Check if birthday hasn't occurred yet this year
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const confirmProfile = async () => {
    setIsLoading(true);
    let genderInput = [];
    genderTypes.map((data) => {
      if (data.key === gender) {
        genderInput.push(data);
      }
    });

    // Calculate the age based on the date of birth
    const calculatedAge = calculateAge(date);

    const body = await createDocumentPayloadArray();
    var finalBody = body;
    var individual = finalBody.individualMemberAccount;
    individual = { ...individual, dob: date, age: calculatedAge, gender: genderInput[0].pname };
    individual = {
      ...individual,
      address: [
        {
          type: 'Permanent',
          doorNo: '',
          address: addressLine,
          landmark: '',
          city: addressCity,
          pincode: addressPinCode,
          district: '',
          state: addressState,
          country: addressCountry,
        },
      ],
    };
    finalBody = { ...finalBody, individualMemberAccount: individual };
    CommonService.commonPost(
      navigation,
      `${SiteConstants.API_URL}user/v2/updateUser`,
      finalBody
    )
      .then(async (data) => {
        try {
          setIsLoading(false);
          if (data !== undefined) {
            await removeAsyncData('userDataP');
            await removeAsyncData('userDataA');
            await storeObjectData('userData', data);
            navigation.navigate('TabNavigation', {
              screen: 'Home',
            });
          }
        } catch (error) {
          console.error('Error handling user data update:', error);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('API call failed:', error);
        Alert.alert('Failed to update user. Please try again later');
      });
  };

  const setGenderData = (value) => {
    setGender(value);
    genderTypes.forEach((genderData) => {
      if (genderData.value === value) {
        genderData.buttonClass = common_styles.gender_button_active;
        genderData.textClass = common_styles.gender_button_text_active;
      } else {
        genderData.buttonClass = common_styles.gender_buttons;
        genderData.textClass = common_styles.gender_button_text;
      }
    });
    // Explicitly check validation after gender update
    setTimeout(() => {
      checkIsAllFeildsNotNull();
    }, 0);
  };

  const createDocumentPayloadArray = async () => {
    const proof = await getObjectData('userDataA');
    const pic = await getObjectData('userDataP');
    let userData = await getObjectData('userData');
    if (userData && userData.data) {
      userData = userData.data;
    }
    let individualMemberAccount = userData.individualMemberAccount;
    const doc = [];
    if (proof !== undefined && proof != null) {
      doc.push({
        location: proof.fileUrl,
        number: documentNumber,
        type: documentType,
      });
    }

    if (pic != undefined && pic != null) {
      doc.push({ location: pic.fileUrl, number: null, type: 'PHOTO' });
    }
    individualMemberAccount = { ...individualMemberAccount, ['document']: doc };
    userData = {
      ...userData,
      ['individualMemberAccount']: individualMemberAccount,
    };
    delete userData.lastModifiedOn;
    return userData;
  };

  const documentNumberUpdate = (data) => {
          setIsAadharExists(false);
        if(documentType === 'AADHAR'&&data.length===12){
        validateAadhaar(data);
      }
    setIsDocumentNumberValid(false);
    const numeric = SiteConstants.NUMERIC_REGEX;
    const alphanumeric = SiteConstants.ALPHA_NUMERIC_REGEX;
    setDocumentNumber(data);
    if (documentType === 'AADHAR' && numeric.test(data) === false) {
      setIsDocumentNumberValid(true);
    }
    if (
      (documentType === 'PAN' ||
        documentType === 'DRIVINGLICENSE' ||
        documentType === 'PASSPORT' ||
        documentType === 'VOTERID' ||
        documentType === 'RATIONCARD') &&
      alphanumeric.test(data) === false
    ) {
      setIsDocumentNumberValid(true);
    }
    if (data.length === 0) {
      setIsDocumentNumberValid(false);
    }
  };

  const documentTypeSelect = (data) => {
    setIsDocumentNumberValid(false);
    setDocumentType(data || '');  // Add default empty string

    // Set minimum length based on document type
    if (data === 'AADHAR' || data === 'PASSPORT' || data === 'RATIONCARD') {
      setMinimumLength(11);
      setMaximumLength(12);
    } else if (data === 'PAN' || data === 'VOTERID') {
      setMinimumLength(9);
      setMaximumLength(10);
    } else if (data === 'DRIVINGLICENSE') {
      setMinimumLength(14);
      setMaximumLength(15);
    } else {
      // Default values if no document type is selected
      setMinimumLength(11);
      setMaximumLength(12);
    }
  };

  // Load selected value from AsyncStorage on component mount
  useEffect(() => {
    const loadSelectedValue = async () => {
      try {
        const value = await getStringData('selectedStateValueNew');
        if (value !== null) {
          setAddressState(value);
        }
      } catch (error) {
        console.error('Error loading selected value:', error);
      }
    };

    loadSelectedValue();
  }, []);

  const handleAddressChange = (option) => {
    const value = option.label; // Use the label property of the selected option
    setAddressState(value);

    // Save selected value to AsyncStorage
    storeStringData('selectedStateValueNew', value)
      .then(() => console.log('Selected value saved successfully'))
      .catch((error) => console.error('Error saving selected value:', error));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={!isLoading ? styles.container : common_styles.center_align}>
        {isLoading ? (
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        ) : (
          <>
            <KeyboardAvoidingView 
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <ScrollView>
                {/* Close Icon code */}
                <View>
                  <TouchableOpacity
                    style={common_styles.close_icon_container}
                    onPress={() => {
                      navigation.navigate('TabNavigation', {
                        screen: 'Home',
                      });
                    }}
                  >
                    <CloseIconSVG width={48} height={48} />
                  </TouchableOpacity>

                  {/* Welcome text */}
                  <Text
                    style={[
                      common_styles.primary_title,
                      common_styles.paddinglr_45,
                    ]}
                  >
                    {SiteTexts.profile_welcome}
                  </Text>
                  <Text
                    style={[
                      common_styles.primary_title,
                      common_styles.paddinglr_45,
                    ]}
                  >
                    {SiteTexts.profile_title}
                  </Text>
                  <Text
                    style={[
                      common_styles.profile_sub_title,
                      common_styles.paddinglr_45,
                    ]}
                  >
                    {SiteTexts.profile_subTitle}
                  </Text>

                  {/* Gender UI */}
                  <Text style={common_styles.gender_text}>
                    {SiteTexts.text_gender}
                  </Text>
                  <View style={common_styles.gender_inputs}>
                    {/* Gender buttons */}
                    {genderTypes.map((genderData) => {
                      return (
                        <TouchableOpacity
                          key={genderData.key}
                          value={genderData.value}
                          style={genderData.buttonClass}
                          onPress={() => setGenderData(genderData.value)}
                        >
                          <Text style={genderData.textClass}>
                            {genderData.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* DOB UI */}
                  {ShowDOB(SiteTexts.text_dob)}

                  {/* Address UI */}
                  <TouchableWithoutFeedback>
                    <TextInput
                      style={common_styles.secondary_input}
                      onChangeText={setAddressLine}
                      value={addressLine}
                      placeholder={SiteTexts.text_address_line}
                      placeholderTextColor={CssColors.primaryPlaceHolderColor}
                    />
                  </TouchableWithoutFeedback>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <TouchableWithoutFeedback>
                      <TextInput
                        style={common_styles.address_left_input}
                        onChangeText={setAddressCity}
                        value={addressCity}
                        placeholder={SiteTexts.text_address_city}
                        placeholderTextColor={CssColors.primaryPlaceHolderColor}
                      />
                    </TouchableWithoutFeedback>
                    <View style={common_styles.state_dropdown_container}>
                      <ModalSelector
                        data={states}
                        initValue={addressState ? addressState : SiteTexts.text_address_state}
                        initValueTextStyle={{textAlign: 'left', color: 'black'}}
                        onChange={handleAddressChange}
                        style={{ marginTop: 8 }}
                        selectStyle={common_styles.select_list_document}
                        selectTextStyle={{ textAlign: 'left' }}
                        optionStyle={{ backgroundColor: '#FFF' }}
                        optionTextStyle={{ color: 'black' }}
                      />
                    </View>

                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <TouchableWithoutFeedback>
                      <TextInput
                        style={common_styles.address_left_input}
                        onChangeText={(text) => {
                          const cleanNumber = text.replace(/[^0-9]/g, '');
                          setAddressPinCode(cleanNumber);
                        }}
                        keyboardType="numeric"
                        value={addressPinCode}
                        maxLength={6}
                        minLength={6}
                        placeholder={SiteTexts.text_address_pin_code}
                        placeholderTextColor={CssColors.primaryPlaceHolderColor}
                      />
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback>
                      <TextInput
                        style={common_styles.address_right_input}
                        onChangeText={setAddressCountry}
                        value={addressCountry}
                        placeholder={SiteTexts.text_address_country}
                        placeholderTextColor={CssColors.primaryPlaceHolderColor}
                      />
                    </TouchableWithoutFeedback>
                  </View>

                  {/* Choose Document Type UI */}
                  <Text
                    style={{ paddingLeft: 20, marginTop: 20, color: '#072E77' }}
                  >
                    {SiteTexts.text_document_type}
                  </Text>
                  <View
                    style={{ paddingTop: 10, paddingLeft: 20, paddingRight: 20 }}
                  >
                    <SelectList
                      boxStyles={common_styles.select_list_document}
                      inputStyles={{ color: 'black' }}
                      setSelected={(data) => documentTypeSelect(data)}
                      data={documentTypes}
                      defaultOption={documentTypes[0]}
                      dropdownTextStyles={{ color: 'black' }}
                    />
                  </View>
                  <TouchableWithoutFeedback>
                    <TextInput
                      style={common_styles.primary_input}
                      onChangeText={(data) => documentNumberUpdate(data)}
                      value={documentNumber}
                      placeholder={
                        documentType
                          ? `${documentType} ${SiteTexts.text_number}*`
                          : SiteTexts.text_aadhar_number
                      }
                      placeholderTextColor={CssColors.primaryPlaceHolderColor}
                      maxLength={maximumLength}
                      minLength={minimumLength}
                    />
                  </TouchableWithoutFeedback>
{isAadharExists && (
  <View style={[common_styles.login_error_container, common_styles.margin_bottom_20, { flexDirection: 'row', alignItems: 'center', marginTop: -8 }]}>
    <Image
      style={[common_styles.error_icon, { width: 18, height: 18, marginRight: 6 }]}
      source={require('../../assets/error.png')}
    />
    <Text style={common_styles.document_error_text}>
      Aadhar number already exists with other phone number. Please contact 1800-103-0794
    </Text>
  </View>
)}
                  {isDocumentNumberValid && <AadharErrorMessage />}
                  {/* Upload photo and document UI */}
                  <View style={common_styles.upload_documents_container}>
                    <TouchableOpacity
                      style={common_styles.upload_document}
                      onPress={() => {
                        setIsVisible(true);
                        setIsPhoto(true);
                      }}
                    >
                      <UploadIconSVG width={26} height={26} />
                      <Text style={{ color: 'black' }}>Upload photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={common_styles.upload_document}
                      onPress={() => {
                        setIsVisible(true);
                        setIsPhoto(false);
                      }}
                    >
                      <UploadIconSVG width={26} height={26} />
                      <Text style={{ color: 'black' }}>
                        Upload{' '}
                        {documentType ? `${documentType}` : SiteTexts.text_aadhar}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {maxFileSizeError ? <MaxFileSizeError /> : <></>}

                  {/* Showing selected photo and document UI */}
                  <View style={styles.screen}>
                    <View style={styles.imageContainer}>
                      {photo !== '' && (
                        <Image source={{ uri: photo.path }} style={styles.image} />
                      )}
                      {documentImage !== '' && (
                        <Image
                          source={{ uri: documentImage.path }}
                          style={styles.image}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
            <View>
              <TouchableOpacity
                onPress={() => confirmProfile()}
                disabled={isButtonDisabled || isAadharExists}
                style={[
                  common_styles.primary_button,
                  (isButtonDisabled || isAadharExists) && common_styles.primary_button_disabled,
                ]}
              >
                <Text style={common_styles.primary_button_text}>
                  {SiteTexts.profile_button_text}
                </Text>
              </TouchableOpacity>
            </View>
            {/* Showing bottomsheet UI */}
            <DefaultBottomSheet 
              visible={isVisible} 
              onClose={() => setIsVisible(false)} 
              height='auto' // or '50%' or 'auto'
            >
              {/* Your content here */}
              <ScrollView>
                  <View style={common_styles.container}>
                    <ScanDocumentIconSVG width={126} height={126} />
                    <Text style={common_styles.scan_document_title}>
                      {SiteTexts.text_scan_document}
                    </Text>
                    <Text style={common_styles.scan_document_sub_title}>
                      {SiteTexts.document_subtitle}
                    </Text>
                    <Text style={common_styles.scan_document_desc}>
                      {SiteTexts.document_upload_desc}
                    </Text>
                    <View style={common_styles.scan_note_container}>
                      <Image
                        style={common_styles.error_icon}
                        source={require('../../assets/error.png')}
                      />
                      <Text style={common_styles.error_scan_text}>
                        {SiteTexts.document_upload_info_message}
                      </Text>
                    </View>
                    <View style={common_styles.icon_button_container}>
                      <TouchableOpacity
                        onPress={showImagePicker}
                        style={[
                          common_styles.button_outline,
                          common_styles.margin_right_10,
                        ]}
                      >
                        <Text style={common_styles.button_outline_text}>
                          {SiteTexts.text_gallery}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={openCamera}
                        style={common_styles.button_outline}
                      >
                        <Text style={common_styles.button_outline_text}>
                          {SiteTexts.text_camera}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
            </DefaultBottomSheet>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>

  );
};

export default Document;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
  },
  dropdown: {
    ...Platform.select({
      ios: {
        height: 'auto',
      },
      android: {
        marginTop: 20,
      },
    }),
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
  },
  calenderIcon: {
    position: 'absolute',
    right: 20,
    top: '35%',
  },
  positionRelative: {
    position: 'relative',
  },
});
