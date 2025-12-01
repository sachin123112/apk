import {
  ScrollView,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CssColors } from "../css/css_colors";
import {
  storeObjectData,
  storeStringData,
  getStringData,
  getObjectData,
} from "../sharedComp/AsyncData";
import common_styles from "../css/common_styles";
import IconThree from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/FontAwesome";
import CommonService from "../services/CommonService";
import { SiteConstants } from "../SiteConstants";
import { SiteTexts } from "../texts/SiteTexts";
import { pick, types } from "@react-native-documents/picker";
import DeviceInfo from "react-native-device-info";

const AddBank = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [IFSCCode, setIFSCCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [maxFileSizeError, setMaxFileSizeError] = useState(false);
  const [bankData, setBankData] = useState([]);
  const [documentImage, setDocumentImage] = useState("");
  const [documentURL, setDocumentURL] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const appVersion = DeviceInfo.getVersion();
  const checkPlatform = Platform.OS.toUpperCase();
  
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
      const isBank = userData?.bankDetailsList;
      if (isBank !== undefined) {
        setBankData(isBank);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

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

  const fetchUserData = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData("userData", response);
      await storeStringData("memberID", response.id ?? "");
      return response;
    } catch (error) {
      console.log("catch ====>", error);
      setIsLoading(false);
      return "null";
    }
  };

  const addBank = async () => {
    if (!accountName || !bankName || !accountNumber || !IFSCCode) {
      alert("All fields are mandatory");
      return;
    }
    if (
      accountName &&
      bankName &&
      accountNumber &&
      IFSCCode &&
      !documentImage
    ) {
      alert("Passbook is mandatory");
      return;
    }
    setIsLoading(true);
    const memberIds = await getStringData("memberID");
    const payloadData = {
      holderName: accountName,
      bankName: bankName,
      accountNumber: accountNumber,
      ifscCode: IFSCCode,
      passbookLocation: documentImage,
      primary: false,
      uuid: "",
    };
    CommonService.commonPost(
      navigation,
      `${SiteConstants.API_URL}user/v2/bank/save/${memberIds}`,
      payloadData
    ).then(async (data) => {
      if (data !== undefined) {
        await storeObjectData("userData", data);
        await storeStringData("memberID", data.id ?? "");
        setIsLoading(false);
        setShowSuccessModal(true); // Show success modal instead of navigating
      }
    });
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack(); // Navigate back to previous screen (BankDetails) properly
  };

  const uploadDoc = async () => {
    console.log('Upload Doc function started');
    setIsLoading(true);
    setMaxFileSizeError(false);
    
    try {
      // Use pick from @react-native-documents/picker to allow both image and PDF selection
      const [result] = await pick({
        type: [types.images, types.pdf],
        mode: 'open',
      });
      
      console.log('Document selected:', result);
      
      // Format the result to match what the uploadReceivedImage expects
      const fileInfo = {
        uri: result.uri,
        type: result.type,
        name: result.name,
        size: result.size
      };
      
      uploadReceivedImage(fileInfo);
    } catch (err) {
      console.log('Error in document picker:', err);
      
      // Handle cancel and other errors
      if (err.code === 'OPERATION_CANCELED') {
        console.log('User cancelled document picker');
      } else if (err.code === 'DOCUMENT_PICKER_IN_PROGRESS') {
        console.log('Another document picker is already running');
      } else {
        console.log('Error picking document:', err);
        alert('Error picking document: ' + JSON.stringify(err));
      }
      
      setIsLoading(false);
    }
  };

  const uploadReceivedImage = async (response) => {
    if (response) {
      const result = response;
      const fileSizeInMB = result.size / (1024 * 1024);
      if (fileSizeInMB >= 5) {
        setMaxFileSizeError(true);
        setIsLoading(false);
        return;
      }
      uploadPhotoDocument(result).then(async (json) => {
        if (json !== undefined) {
          if (json.fileName != undefined && json.fileName != null) {
            setDocumentURL(json.fileName);
            setDocumentImage(json.fileUrl);
          } else {
            alert(json.error + ". Please try again");
          }
        }
      });
    }
  };

  const uploadPhotoDocument = async (result) => {
    let userData = await getObjectData('userData');
    if (!userData) {
      userData = await fetchUserData();
    }

    if (userData && userData.data) {
      userData = userData.data;
    }
    const memberIds = userData?.id;
    const count = (bankData ? bankData.length : 0) + 1;
    const url = `${SiteConstants.API_URL}user/v2/upload/passBook/${memberIds}/${count}`;
    let formData = new FormData();
    const token = await getStringData("token");
    formData.append("file", {
      uri: result.uri,
      name: result.name,
      type: result.type,
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
      alert("Unable to upload doc");
      console.error(error);
    }
  };

  // Success Modal Component
  const SuccessModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={60} color={CssColors.green} />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              Bank account has been added successfully.
            </Text>
            <TouchableOpacity
              style={styles.goBackButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.goBackButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, insets.bottom > 20 ? { paddingBottom: insets.bottom } : {}]}>
      {isLoading ? (
        <View style={common_styles.center_align}>
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View
              style={{
                flex: 1,
                position: "relative",
                backgroundColor: CssColors.appBackground,
              }}
            >
              <Text
                style={[
                  common_styles.fontsize12,
                  common_styles.marginTopTen,
                  common_styles.margin_bottom_5,
                ]}
              >
                Account holder name
              </Text>
              <TextInput
                style={styles.inputColumn}
                underlineColorAndroid="transparent"
                placeholder="Type account holder name"
                placeholderTextColor="grey"
                value={accountName}
                onChangeText={(text) => setAccountName(text)}
              />
              <Text
                style={[
                  common_styles.fontsize12,
                  common_styles.marginTopTen,
                  common_styles.margin_bottom_5,
                ]}
              >
                Account number
              </Text>
              <TextInput
                style={styles.inputColumn}
                underlineColorAndroid="transparent"
                placeholder="Type account number"
                placeholderTextColor="grey"
                value={accountNumber}
                onChangeText={(text) => setAccountNumber(text)}
              />
              <Text
                style={[
                  common_styles.fontsize12,
                  common_styles.marginTopTen,
                  common_styles.margin_bottom_5,
                ]}
              >
                IFSC
              </Text>
              <TextInput
                style={styles.inputColumn}
                underlineColorAndroid="transparent"
                placeholder="Type IFSC code"
                placeholderTextColor="grey"
                value={IFSCCode}
                onChangeText={(text) => setIFSCCode(text)}
              />
              <Text
                style={[
                  common_styles.fontsize12,
                  common_styles.marginTopTen,
                  common_styles.margin_bottom_5,
                ]}
              >
                Bank name
              </Text>
              <TextInput
                style={styles.inputColumn}
                underlineColorAndroid="transparent"
                placeholder="Type bank name"
                placeholderTextColor="grey"
                value={bankName}
                onChangeText={(text) => setBankName(text)}
              />
              <View style={styles.uploadImageContainer}>
                <Text style={styles.fontsize14}>Upload Pass book 1st page</Text>
                <IconThree
                  onPress={() => uploadDoc()}
                  name="attachment"
                  size={20}
                  color="black"
                />
              </View>
              {maxFileSizeError ? <MaxFileSizeError /> : <></>}
              {documentURL !== "" && (
                <Text style={styles.image}>{documentURL}</Text>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.logoutContainer}
            onPress={() => addBank()}
          >
            <Text style={styles.logoutText}>Save</Text>
          </TouchableOpacity>
          
          {/* Success Modal */}
          <SuccessModal />
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
    padding: 20,
  },
  fontsize14: {
    fontSize: 14,
    color: CssColors.primaryBorder,
  },
  inputColumn: {
    color: "black",
    fontSize: 14,
    textAlign: "left",
    borderBottomColor: CssColors.primaryBorder,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
  },
  uploadImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: CssColors.primaryBorder,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderWidth: 1,
    paddingBottom: 10,
    paddingTop: 20,
    marginBottom: 20,
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: CssColors.primaryColor,
    borderWidth: 1,
    marginVertical: 20,
    height: 56,
    borderRadius: 4,
    backgroundColor: CssColors.primaryColor,
  },
  logoutText: {
    color: CssColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "cover",
    color: CssColors.primaryPlaceHolderColor,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: CssColors.white,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CssColors.textColorPrimary,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: CssColors.textColorPrimary,
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: CssColors.primaryColor,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  goBackButtonText: {
    color: CssColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddBank;
