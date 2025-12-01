import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Button
} from "react-native";
import React, { useState, useEffect } from "react";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import { SiteTexts } from "../texts/SiteTexts";
import { convertISOStringToMonthDay, dateTime,
  convertISOStringToDate, states
} from "../sharedComp/Utils";
import { SelectList } from "react-native-dropdown-select-list";
import ModalSelector from 'react-native-modal-selector';
import Icon from "react-native-vector-icons/AntDesign";
import DatePicker from "react-native-date-picker";
import CustomCheckBox from '../components/CustomCheckbox';
import DefaultBottomSheet from '../components/DefaultBottomSheet';
import {
  getStringData,
  storeObjectData,
  storeStringData,
  getObjectData
} from "../sharedComp/AsyncData";
import BottomPopUp from "../sharedComp/BottomSheet";
import ScanDocumentIconSVG from "./svgs/ScanDocumentIconSVG";
import { openContact } from "../sharedComp/Utils";
import DeviceInfo from "react-native-device-info";

const salutationTypes = [
  { key: "0", value: "S/O" },
  { key: "1", value: "W/O" },
  { key: "2", value: "D/O" },
  { key: "3", value: "F/O" },
  { key: "4", value: "C/O" },
];

const ChitAgreementForm = ({ route, navigation }) => {
  const { chitId, subscriptionId, selectedChit, memberIds } = route.params;
  const [genderTypes, setGenderTypes] = useState([
    {
      key: 1,
      name: "Male",
      pname: "MALE",
      value: 1,
      buttonClass: styles.gender_buttons,
      textClass: common_styles.gender_button_text,
    },
    {
      key: 2,
      name: "Female",
      pname: "FEMALE",
      value: 2,
      buttonClass: styles.gender_buttons,
      textClass: common_styles.gender_button_text,
    },
    {
      key: 3,
      name: "Others",
      pname: "OTHERS",
      value: 3,
      buttonClass: styles.gender_buttons,
      textClass: common_styles.gender_button_text,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [agreementData, setAgreementData] = useState({});
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState(0);
  const [dob, setDob] = useState("");
  const [sName, setSName] = useState("");
  const [coName, setCoName] = useState("");
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nDob, setNDob] = useState("");
  const [nDate, setNDate] = useState(new Date());
  const [nOpen, setNOpen] = useState(false);
  const [nomineeRel, setNomineeRel] = useState("");
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [documentNumber, setDocumentNumber] = useState("");
  const [minimumLength, setMinimumLength] = useState(11);
  const [maximumLength, setMaximumLength] = useState(12);
  const [isDocumentNumberValid, setIsDocumentNumberValid] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [documentImage, setDocumentImage] = useState("");
  const [documentLocation, setDocumentLocation] = useState("");
  const [maxFileSizeError, setMaxFileSizeError] = useState(false);
  const [showWaitForApproval, setShowWaitForApproval] = useState(false);
  const [showAadharUsed, setShowAadharUsed] = useState(false);
  const [bottomSheetData, setBottomSheetData] = useState({});
  const [photoImage, setPhotoImage] = useState(null);
  const [photoLocation, setPhotoLocation] = useState(null);
  const [isPhoto, setIsPhoto] = useState(false);
  const appVersion = DeviceInfo.getVersion();
  const checkPlatform = Platform.OS.toUpperCase();
  
  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const subscriberData = await CommonService.commonGet(
        navigation,
        `${SiteConstants.API_URL}enrollment/v2/fetchSubscribers/${chitId}/${subscriptionId}`
      );
      if (subscriberData !== undefined) {
        setAgreementData(subscriberData.agreementParameters);
        fetchUser();
      } else {
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchUser = async () => {
    let body = await getObjectData('userData');
    if (!body) {
      body = await fetchUserData();
    }

    if (body && body.data) {
      body = body.data;
    }
    setName(body?.individualMemberAccount?.name ?? "");
    setMobileNumber(body?.phoneNumber);
    setGenderData(
      body?.individualMemberAccount?.gender ?? "" == "MALE"
        ? 1
        : body?.individualMemberAccount?.gender ?? "" == "FEMALE"
        ? 2
        : 3
    );
    setDob(body?.individualMemberAccount?.dob ? convertISOStringToDate(body?.individualMemberAccount?.dob) : "");
    setCoName(body?.individualMemberAccount?.relationName ?? "");
    setEmail(body?.individualMemberAccount?.email ?? "");
    let myAddress = body?.individualMemberAccount?.address[0];
    let myAddres = `${myAddress?.doorNo}${myAddress?.address}${myAddress?.landmark}`;
    setAddress(myAddres);
    setCity(myAddress?.city ?? "");
    setState(myAddress?.state ?? "");
    setPinCode(myAddress?.pincode.toString() ?? "");
    setCountry(myAddress?.country ?? "");
    setDocumentNumber(body?.individualMemberAccount?.document[0]?.number ?? "-");
    if (body?.individualMemberAccount?.document[0]?.location) {
      setDocumentLocation(body?.individualMemberAccount?.document[0]?.location);
      getImageSigned(body?.individualMemberAccount?.document[0]?.location, true);
    }
    const photoData = await getUserPhotoLocation(body?.individualMemberAccount?.document);
    if (photoData !== null) {
      setPhotoLocation(photoData?.location);
      getImageSigned(photoData?.location, false);
    }
  };

  const getUserPhotoLocation = async (documents) => {
    const isPhotoData = documents && documents.length && documents.find(doc => doc.type === 'PHOTO');
    return isPhotoData || null;
  }


  const getImageSigned = async (location, isAadhar) => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;
    return CommonService.commonBlobGet(navigation, url, location).then(
      async (image) => {
        if (image !== undefined) {
          let binary = "";
          const bytes = new Uint8Array(image);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const finaldata = binary;
          isAadhar ? setDocumentImage(finaldata) : setPhotoImage(finaldata);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  const fetchUserData = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData("userData", response);
      await storeStringData("memberID", response.id ?? "");
      setIsLoading(false);
      return response;
    } catch (error) {
      console.log("catch ====>", error);
      setIsLoading(false);
      return "null";
    }
  };

  const agreementRow = (title1, data1, title2, data2) => {
    return (
      <View style={styles.agreementDataView}>
        <View style={styles.width50}>
          <Text style={styles.agreementDataTitle}>{title1}</Text>
          <Text style={styles.agreementDataText}>{data1}</Text>
        </View>
        <View style={styles.width50}>
          <Text style={styles.agreementDataTitle}>{title2 ? title2 : ""}</Text>
          <Text style={styles.agreementDataText}>{data2 ? data2 : ""}</Text>
        </View>
      </View>
    );
  };

  const MaxFileSizeError = () => {
    return (
      <View style={common_styles.document_error_container}>
        <Image
          style={common_styles.error_icon}
          source={require("../../assets/error.png")}
        />
        <Text style={common_styles.document_error_text}>
          {SiteTexts.document_max_filesize_limit}
        </Text>
      </View>
    );
  };

  const signatureRow = (title1, title2) => {
    const currentDate = new Date();
    return (
      <View style={[styles.agreementDataView, styles.paddingBottom20]}>
        <View style={styles.width50}>
          <Text style={styles.agreementDataTitle}>{title1}</Text>
          <Text style={styles.signInputBox}></Text>
          <Text style={styles.signatureDataText}>
            {convertISOStringToDate(currentDate)} {dateTime(currentDate)}
          </Text>
        </View>
        <View style={styles.width50}>
          <Text style={styles.agreementDataTitle}>{title2 ? title2 : ""}</Text>
          <Text style={styles.signInputBox}></Text>
          <Text style={styles.signatureDataText}>
            {convertISOStringToDate(currentDate)} {dateTime(currentDate)}
          </Text>
        </View>
      </View>
    );
  };

  // This function is triggered when the "Select an image" button pressed
  const showImagePicker = async () => {
    setMaxFileSizeError(false);
    const options = {
      noData: true,
    };
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then((response) => {
      uploadReceivedImage(response);
    });
  };

  // This function is triggered when the "Open camera" button pressed
  const openCamera = async () => {
    const options = {
      noData: true,
    };
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then((response) => {
      uploadReceivedImage(response);
    });
  };

  const uploadReceivedImage = async (response) => {
    setMaxFileSizeError(false);
    if (response) {
      const result = response;
      const fileSizeInMB = result.fileSize || result.size / (1024 * 1024);
      if (fileSizeInMB >= 5) {
        setIsVisible(false);
        setMaxFileSizeError(true);
        return;
      }
      const url = isPhoto
        ? `${SiteConstants.API_URL}user/v2/upload/PHOTO`
        : `${SiteConstants.API_URL}user/v2/upload/AADHAR`;
      uploadPhotoDocument(
        url,
        "file",
        result.path,
        "filename",
        result.mime,
        result
      ).then(async (json) => {
        if (json !== undefined) {
          if (json.fileName != undefined && json.fileName != null) {
            if (isPhoto) {
              setPhotoImage(result.path);
              setPhotoLocation(json.fileUrl);
            } else {
              setDocumentImage(result.path);
              setDocumentLocation(json.fileUrl);
            }
          } else {
            alert(json.error + ". Please try again");
          }
        }
      });
      setIsPhoto(false);
      setIsVisible(false);
    }
  }

  const uploadPhotoDocument = async (
    url,
    sfile,
    uriData,
    fileName,
    fileType
  ) => {
    setIsLoading(true);
    let formData = new FormData();
    const token = await getStringData("token");
    formData.append("file", {
      uri: uriData,
      name: "photo.png",
      type: fileType,
    });
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "*/*",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + token,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      });
      const json = await response.json();
      setIsLoading(false);
      return json;
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  const setGenderData = (value) => {
    setGender(value);
    genderTypes.map((genderData) => {
      if (genderData.value === value) {
        genderData.buttonClass = styles.gender_button_active;
        genderData.textClass = common_styles.gender_button_text_active;
      } else {
        genderData.buttonClass = styles.gender_buttons;
        genderData.textClass = common_styles.gender_button_text;
      }
    });
    checkIsAllFeildsNotNull();
  };

  const handleNameChange = (value) => setName(value);
  const showName = (labelName) => {
    return (
      <>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.disableInput}
          value={name}
          editable={false} selectTextOnFocus={false}
          onChangeText={handleNameChange}
        />
      </>
    );
  };

  const showAadhar = (labelName) => {
    return (
      <>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.defaultInput}
          onChangeText={(data) => documentNumberUpdate(data)}
          value={documentNumber}
          keyboardType="number-pad"
          placeholder={SiteTexts.text_aadhar_number}
          placeholderTextColor={CssColors.primaryPlaceHolderColor}
          maxLength={maximumLength}
          minLength={minimumLength}
        />
      </>
    );
  };

  const handleMobileNumberChange = (value) => setMobileNumber(value);
  const showMobileNumber = (labelName) => {
    return (
      <>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.disableInput}
          editable={false} selectTextOnFocus={false}
          value={mobileNumber}
          onChangeText={handleMobileNumberChange}
        />
      </>
    );
  };

  const showDOB = (labelName) => {
    return (
      <View style={styles.positionRelative}>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.defaultInput}
          value={dob}
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

  const genderUI = () => {
    return (
      <>
        <Text style={styles.subText}>{SiteTexts.text_gender}</Text>
        <View style={styles.gender_inputs}>
          {/* Gender buttons */}
          {genderTypes.map((genderData) => {
            return (
              <Pressable
                key={genderData.key}
                value={genderData.value}
                style={genderData.buttonClass}
                onPress={() => setGenderData(genderData.value)}
              >
                <Text style={genderData.textClass}>{genderData.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  };

  const documentNumberUpdate = (data) => {
    setIsDocumentNumberValid(false);
    const numeric = SiteConstants.NUMERIC_REGEX;
    setDocumentNumber(data);
    if (numeric.test(data) === false) {
      setIsDocumentNumberValid(true);
    }
    if (data.length === 0) {
      setIsDocumentNumberValid(false);
    }
  };

  const AadharErrorMessage = () => {
    return (
      <View style={[styles.aadhar_error_container, common_styles.margin_bottom_20]}>
        <Image
          style={common_styles.error_icon}
          source={require("../../assets/error.png")}
        />
        <Text style={styles.aadhar_error_text}>{SiteTexts.error_aadhar_invalid}</Text>
      </View>
    );
  };

  const handlecoNameChange = (value) => setCoName(value);
  const showcoName = (labelName) => {
    return (
      <View style={[styles.width100, styles.flexDirectionRow]}>
        <View style={styles.width25}>
          <SelectList
            boxStyles={[styles.selectDropdownDefault, { marginTop: 4 }]}
            inputStyles={{ color: CssColors.black }}
            dropdownTextStyles={{ color: CssColors.black }}
            setSelected={(data) => setSName(data)}
            data={salutationTypes}
            defaultOption={salutationTypes[0]}
          />
        </View>
        <View style={styles.width75}>
          <Text style={styles.subText}>{labelName}</Text>
          <TextInput
            style={styles.defaultInput}
            value={coName}
            onChangeText={handlecoNameChange}
          />
        </View>
      </View>
    );
  };

  const handleEmailChange = (value) => setEmail(value);
  const showEmail = (labelName) => {
    return (
      <>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.defaultInput}
          value={email}
          keyboardType="email-address"
          placeholder="E-mail (optional)"
          onChangeText={handleEmailChange}
        />
      </>
    );
  };

  const handleAddressChange = (value) => setAddress(value);
  const showAddress = (labelName) => {
    return (
      <>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.defaultInput}
          value={address}
          onChangeText={handleAddressChange}
        />
      </>
    );
  };

  const handleCityChange = (value) => setCity(value);
  const handleStateChange = (option) => {
      const value = option.label; // Use the label property of the selected option
      setState(value);
  }
  const showCityState = (labelName1, labelName2) => {
    return (
      <View style={[styles.width100, styles.flexDirectionRow]}>
        <View style={styles.width50Left}>
          <Text style={styles.subText}>{labelName1}</Text>
          <TextInput
            style={styles.defaultInput}
            value={city}
            placeholder="Enter your city *"
            onChangeText={handleCityChange}
          />
        </View>
        <View style={styles.width50Right}>
          <ModalSelector
            data={states}
            initValue={state ? state : 'Enter your state *'}
            initValueTextStyle={{textAlign: 'left', color: 'black'}}
            onChange={handleStateChange}
            style={{ marginTop: 8 }}
            selectStyle={common_styles.select_list_document}
            selectTextStyle={{ textAlign: 'left' }}
            optionStyle={{ backgroundColor: '#FFF' }}
            optionTextStyle={{ color: 'black' }}
          />
        </View>
      </View>
    );
  };

  const handlePinCodeChange = (value) => setPinCode(value);
  const handleCountryChange = (value) => setCountry(value);
  const showPinCountry = (labelName1, labelName2) => {
    return (
      <View style={[styles.width100, styles.flexDirectionRow]}>
        <View style={styles.width50Left}>
          <Text style={styles.subText}>{labelName1}</Text>
          <TextInput
            style={styles.defaultInput}
            value={pinCode}
            onChangeText={handlePinCodeChange}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.width50Right}>
          <Text style={styles.subText}>{labelName2}</Text>
          <TextInput
            style={styles.defaultInput}
            value={country}
            onChangeText={handleCountryChange}
          />
        </View>
      </View>
    );
  };

  const handleNomineeNameChange = (value) => setNomineeName(value);
  const showNomineeName = (labelName) => {
    return (
      <>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.defaultInput}
          value={nomineeName}
          placeholder="Enter nominee name"
          onChangeText={handleNomineeNameChange}
        />
      </>
    );
  };

  const showNDOB = (labelName) => {
    return (
      <View style={styles.positionRelative}>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.defaultInput}
          editable={false}
          value={nDob}
        />
        <Icon
          name="calendar"
          style={styles.calenderIcon}
          size={24}
          color={CssColors.primaryColor}
          onPress={() => setNOpen(true)}
        />
        <DatePicker
          modal
          mode="date"
          open={nOpen}
          date={nDate}
          onConfirm={(nDate) => {
            setNOpen(false);
            setNDate(nDate);
            setNDob(convertISOStringToDate(nDate));
          }}
          onCancel={() => {
            setNOpen(false);
          }}
        />
      </View>
    );
  };

  const handleNomineeRelChange = (value) => setNomineeRel(value);
  const showNomineeRel = (labelName) => {
    return (
      <>
        <Text style={styles.subText}>{labelName}</Text>
        <TextInput
          style={styles.defaultInput}
          value={nomineeRel}
          placeholder="Enter nominee relationship"
          onChangeText={handleNomineeRelChange}
        />
      </>
    );
  };

  useEffect(() => {
    checkIsAllFeildsNotNull();
  }, [
    name,
    mobileNumber,
    gender,
    address,
    city,
    state,
    pinCode,
    country,
    documentNumber,
    coName,
    isDocumentNumberValid,
    minimumLength,
    maximumLength,
    toggleCheckBox,
  ]);

  const checkIsAllFeildsNotNull = () => {
    if (toggleCheckBox === false) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  };

  const confirmSave = async () => {
    setIsLoading(true);
    let genderInput = [];
    genderTypes.map((data) => {
      if (data.key === gender) {
        genderInput.push(data);
      }
    });
    if (!documentNumber) {
      alert('kindly enter the aadhar number');
      setIsLoading(false);
      return;
    }
    const isAadhar = await validateAadhar();
    if (isAadhar && isAadhar?.status !== 'SUCCESS') {
      setToggleCheckBox(false);
      setBottomSheetData({
        title: 'Aadhaar number is already exist with other phone number',
        titleColor: "#FF3830",
        description: 'Please contact customer care',
        sendButtonTitle: "Call now",
        sendButtonBGColor: "#FF3830",
        cancelButtonTitle: "No",
        cancelButtonBGColor: "#F7F9FC",
        totalButtons: 2,
        showIcon: false,
        showIconName: 'profile',
        showSVG: true
      });
      setIsLoading(false);
      setShowAadharUsed(true);
      return;
    }
    const payLoadData = {
      chitId,
      subscriberDTO: {
        subscriberId: selectedChit.subscriptionId,
        subscriberType: 'mobile',
        phoneNumber: mobileNumber,
        name: name,
        email: email,
        gender: genderInput[0].pname,
        dob: dob,
        address: {
          address: address,
          city: city,
          state: state,
          pincode: pinCode,
          country: country,
        },
        photo: {
          type: photoLocation ? 'PHOTO' : null,
          number: null,
          location: photoLocation,
        },
        document: {
          location: documentLocation,
          number: documentNumber,
          type: 'AADHAR',
        },
        nominee: {
          name: nomineeName,
          relationship: nomineeRel,
          dob: nDob,
        },
        relationType: "S/O",
        relativeName: coName,
      },
      memberId: memberIds
    };
    const url = `${SiteConstants.API_URL}enrollment/v2/saveSubscriber`;
    CommonService.commonPost(
      navigation,
      url,
      payLoadData
    ).then(async (data) => {
      setIsLoading(true);
      if (data !== undefined) {
        if (selectedChit && selectedChit?.enrollmentStatus === "APPROVED") {
          getUnstampedStatus();
        } else {
          setBottomSheetData({
            title: "Please wait for approval",
            description:
              "This enrollment request will be verified by KCPL; Please wait for approval.",
            sendButtonTitle: "Close",
            sendButtonBGColor: "#F7F9FC",
            totalButtons: 1,
            showIcon: false,
            showIconName: "approval",
            showSVG: true
          });
          setShowWaitForApproval(true);
          setIsLoading(false);
        }
      }
    });
  };

  const validateAadhar = async () => {
    const url = `${SiteConstants.API_URL}enrollment/v2/validate-aadhaar/${mobileNumber}/${documentNumber}`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      setIsLoading(false);
      return response;
    } catch (error) {
      console.log("catch ====>", error);
      setIsLoading(false);
      console.log(error);
      return "null";
    }
  }

  const getUnstampedStatus = () => {
    setIsLoading(true);
    let object = {
      memberId: memberIds,
      "chit-group-id": chitId,
      subscriptionId: subscriptionId,
    };
    CommonService.commonPost(
      navigation,
      `${SiteConstants.API_URL}enrollment/v2/agreement/unstamped-agreement/${chitId}/${memberIds}/${subscriptionId}`,
      {}
    ).then(async (data) => {
      setIsLoading(false);
      if (data !== undefined) {
        navigateToDraft(data);
      }
    });
  };

  const navigateToDraft = (data) => {
    console.table(data.agreementFilePath, data.subscriberDTO.subscriberId, chitId, memberIds, selectedChit);
    navigation.navigate("ChitFundAgreementDraft", {
      pdfPath: data.agreementFilePath,
      subScriberId: data.subscriberDTO.subscriberId,
      chitId: chitId,
      subscriberType: "mobile",
      memberId: memberIds,
      selectedChit: selectedChit,
    });
  };

  return (
    <View style={[!isLoading ? styles.container : common_styles.center_align]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View style={[styles.nomineeContainer, styles.shadowProp]}>
              {showMobileNumber(SiteTexts.chit_agreement_form_group_mob_no)}
              {showName(SiteTexts.chit_agreement_form_group_name_of_sub)}
              {showAadhar(SiteTexts.text_aadhar_number)}
              {isDocumentNumberValid ? (
                <AadharErrorMessage />
              ) : null}
              {genderUI()}
              {showDOB(SiteTexts.text_dob)}
              {showcoName(SiteTexts.profile_name)}
              {showEmail(SiteTexts.profile_email)}
              {showAddress(SiteTexts.text_address_line)}
              {showCityState(
                SiteTexts.text_address_city,
                SiteTexts.text_address_state
              )}
              {showPinCountry(
                SiteTexts.text_address_pin_code,
                SiteTexts.text_address_country
              )}
              <View style={common_styles.upload_documents_container}>
                <Pressable
                  onPress={() => {
                    setIsVisible(true);
                    setIsPhoto(false);
                  }}
                  style={common_styles.upload_document}>
                  <Icon name="totop" size={20} style={styles.uploadDocumentText} color={CssColors.monthlyCycle} />
                  <Text style={[styles.uploadDocumentText, styles.font12]}>
                    Upload Aadhar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsVisible(true);
                    setIsPhoto(true);
                  }}
                  style={common_styles.upload_document}>
                  <Icon name="totop" size={20} style={styles.uploadDocumentText} color={CssColors.monthlyCycle} />
                  <Text style={[styles.uploadDocumentText, styles.font12]}>
                    Upload Photo
                  </Text>
                </Pressable>
              </View>

              {maxFileSizeError ? <MaxFileSizeError /> : <></>}

              {/* Showing selected photo and document UI */}
              <View style={styles.screen}>
                <View style={styles.imageContainer}>
                  {documentImage !== "" && (
                    <Image
                      source={{ uri: documentImage }}
                      style={styles.image}
                    />
                  )}
                  {photoImage !== "" && (
                    <Image source={{ uri: photoImage }} style={styles.image} />
                  )}
                </View>
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
                          source={require("../../assets/error.png")}
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
            </View>
            <View style={[styles.nomineeContainer, styles.shadowProp]}>
              {showNomineeName(SiteTexts.chit_agreement_form_group_nominee_name)}
              {showNDOB(SiteTexts.chit_agreement_form_group_nominee_dob)}
              {showNomineeRel(SiteTexts.chit_agreement_form_group_nominee_rel)}
            </View>
            <View style={[styles.agreementContainer, styles.shadowProp]}>
              <View style={styles.agreementDataHeader}>
                <Text
                  style={[styles.paddingLeft10, styles.agreementDataHeaderTitle]}
                >
                  {SiteTexts.chit_agreement_form_group_agr_para}
                </Text>
              </View>
              <View
                style={[styles.paddingHorizontal10, styles.backgroundAppColor]}
              >
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_reg_branch,
                  agreementData.gorupRegisteredBranch,
                  SiteTexts.chit_agreement_form_group_pso_num,
                  agreementData.psoNumber
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_pso_date,
                  convertISOStringToDate(agreementData.psoDate),
                  SiteTexts.chit_agreement_form_group_grp_code,
                  agreementData.groupCode
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_chit_reg,
                  agreementData.chitRegistrar,
                  SiteTexts.chit_agreement_form_group_chit_reg_addr,
                  agreementData.chitRegistrarAddress
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_foreman_addr,
                  agreementData.foremanAddress,
                  SiteTexts.chit_agreement_form_group_no_of_tick,
                  agreementData.noOfTickets
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_no_of_inst,
                  agreementData.noOfInstallments,
                  SiteTexts.chit_agreement_form_group_first_inst_amo,
                  agreementData.firstInstallmentAmount
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_tkt_no,
                  agreementData.ticketNo,
                  SiteTexts.chit_agreement_form_group_chit_val,
                  agreementData.chitValue
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_auc_time,
                  agreementData.auctionTime,
                  SiteTexts.chit_agreement_form_group_auc_date,
                  agreementData.auctionDate
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_place_pf_auc,
                  agreementData.placeOfAction,
                  SiteTexts.chit_agreement_form_group_due_date,
                  convertISOStringToDate(agreementData.dueDate)
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_dt_of_commence,
                  convertISOStringToDate(agreementData.dateOfCommencement),
                  SiteTexts.chit_agreement_form_group_dt_of_termi,
                  convertISOStringToDate(agreementData.dateOfTermination)
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_fd_amt,
                  agreementData.chitValue,
                  SiteTexts.chit_agreement_form_group_chit_dur,
                  agreementData.monthOfChitDuration ? agreementData.monthOfChitDuration : '--'
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_dep_bank,
                  agreementData.depositeBankAndBranch,
                  SiteTexts.chit_agreement_form_group_fd_rec_no,
                  agreementData.fdReceiptNo
                )}
                {agreementRow(
                  SiteTexts.chit_agreement_form_group_fd_date,
                  agreementData.fdDate
                )}
                {signatureRow(
                  SiteTexts.chit_agreement_form_group_sub_sign,
                  SiteTexts.chit_agreement_form_group_foreman_sign
                )}
              </View>
            </View>
          </ScrollView>
          <View style={styles.fixedFooter}>
            <View
              style={[
                styles.paddingLeft20,
                styles.paddingTop10,
                styles.flexDirectionRowTwo,
              ]}
            >
              <CustomCheckBox
                boxType="square"
                disabled={false}
                value={toggleCheckBox}
                style={{ width: 20, height: 20 }}
                onValueChange={(newValue) => setToggleCheckBox(newValue)}
              />
              <Text style={[styles.checkboxText, { marginLeft: 10 }]}>
                {SiteTexts.chit_agreement_form_group_terms_checkbox}
              </Text>
            </View>
            <Pressable
              onPress={() => confirmSave()}
              disabled={isButtonDisabled}
              style={[
                common_styles.primary_button,
                isButtonDisabled && common_styles.primary_button_disabled,
              ]}
            >
              <Text style={common_styles.primary_button_text}>
                {SiteTexts.profile_button_title}
              </Text>
            </Pressable>
          </View>
          {showWaitForApproval && (
            <BottomPopUp
              data={bottomSheetData}
              onClose={() => {
                setShowWaitForApproval(false);
                navigation.pop();
                navigation.pop();
              }}
              onSubmit={() => {
                setShowWaitForApproval(false);
                navigation.pop();
                navigation.pop();
              }}
            />
          )}
          {showAadharUsed && (
            <BottomPopUp
              data={bottomSheetData}
              onClose={() => {
                setShowAadharUsed(false);
              }}
              onSubmit={() => {
                setShowAadharUsed(false);
                openContact(7090666444);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  paddingTop10: {
    paddingTop: 10,
  },
  nomineeContainer: {
    backgroundColor: CssColors.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8
  },
  agreementContainer: {
    backgroundColor: CssColors.white,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8
  },
  shadowProp: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5
  },
  uploadDocument: {
    height: 35,
    backgroundColor: 'none',
    borderWidth: 1,
    borderColor: CssColors.primaryBorder,
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'row'
  },
  uploadDocumentText: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    color: CssColors.monthlyCycle,
    paddingLeft: 10,
  },
  font12: {
    fontSize: 12
  },
  subText: {
    fontSize: 10,
    padding: 0,
    margin: 0,
    color: CssColors.primaryBorder
  },
  defaultInput: {
    fontSize: 14,
    lineHeight: 22,
    borderWidth: 1,
    borderBottomColor: CssColors.homeDetailsBorder,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    padding: 0,
    margin: 0,
    paddingBottom: 5,
    marginBottom: 15,
    color: CssColors.primaryPlaceHolderColor,
  },
  disableInput: {
    fontSize: 14,
    lineHeight: 22,
    borderWidth: 1,
    borderBottomColor: CssColors.homeDetailsBorder,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    padding: 0,
    margin: 0,
    paddingBottom: 5,
    marginBottom: 15,
    color: CssColors.disableColor,
  },
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: "100%",
  },
  fixedFooter: {
    borderTopColor: CssColors.homeDetailsBorder,
    borderRightColor: "transparent",
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderWidth: 1,
    shadowColor: CssColors.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 2,
  },
  checkboxText: {
    fontSize: 12,
    color: CssColors.primaryColor,
    margin: 0,
    padding: 0,
  },
  width100: {
    width: "100%",
  },
  width25: {
    width: "25%",
  },
  width75: {
    marginLeft: "3%",
    width: "72%",
  },
  flexDirectionRow: {
    flexDirection: "row",
    alignSelf: "flex-start",
  },
  flexDirectionRowTwo: {
    flexDirection: "row",
    alignItems: "center",
  },
  signInputBox: {
    height: 50,
    backgroundColor: CssColors.white,
    marginRight: 25,
    marginVertical: 10,
  },
  marginHorizontal10: {
    marginHorizontal: 10,
  },
  marginHorizontal20: {
    marginHorizontal: 20,
  },
  paddingHorizontal10: {
    paddingHorizontal: 10,
  },
  backgroundAppColor: {
    backgroundColor: CssColors.appBackground,
  },
  paddingLeft10: {
    paddingLeft: 10,
  },
  paddingLeft20: {
    paddingLeft: 20,
  },
  agreementDataHeaderTitle: {
    color: CssColors.white,
    fontSize: 14,
  },
  agreementDataHeader: {
    backgroundColor: CssColors.enrollmentHeader,
    height: 42,
    justifyContent: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  agreementDataView: {
    backgroundColor: CssColors.appBackground,
    flexDirection: "row",
    width: "100%",
    paddingTop: 20,
  },
  paddingBottom20: {
    paddingBottom: 20,
  },
  width50: {
    width: "50%",
  },
  width50Left: {
    marginRight: "2%",
    width: "48%",
  },
  width50Right: {
    marginLeft: "2%",
    width: "48%",
  },
  agreementDataTitle: {
    color: CssColors.primaryBorder,
    fontSize: 12,
  },
  agreementDataText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 14,
  },
  signatureDataText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 10,
  },
  gender_inputs: {
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  gender_buttons: {
    paddingHorizontal: "8%",
    paddingVertical: 10,
    marginVertical: 10,
    borderColor: CssColors.primaryBorder,
    marginRight: 10,
    borderWidth: 1,
    backgroundColor: CssColors.white,
  },
  gender_button_active: {
    paddingHorizontal: "8%",
    paddingVertical: 10,
    marginVertical: 10,
    borderColor: CssColors.primaryBorder,
    marginRight: 10,
    borderWidth: 1,
    backgroundColor: CssColors.primaryColor,
  },
  calenderIcon: {
    position: "absolute",
    right: 0,
    top: "35%",
  },
  positionRelative: {
    position: "relative",
  },
  selectDropdownDefault: {
    borderBottomColor: CssColors.primaryBorder,
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    color: CssColors.primaryPlaceHolderColor,
  },
  marginTop25: {
    marginTop: 25,
  },
  aadhar_error_container: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignSelf: "center",
  },
  aadhar_error_text: {
    fontSize: 14,
    color: CssColors.errorTextColor,
    paddingLeft: 10,
    paddingTop: 2.2,
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 15,
  },
  imageContainer: {
    flex: 1,
    flexDirection: "row",
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "cover",
  },
  dropdown: {
    marginTop: 15,
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default ChitAgreementForm;
