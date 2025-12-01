import {
  Dimensions,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import CustomCheckBox from '../components/CustomCheckbox';
import Pdf from "react-native-pdf";
import { SiteTexts } from "../texts/SiteTexts";

const ChitFundAgreementDraft = ({ route, navigation }) => {
  const {
    pdfPath,
    subScriberId,
    chitId,
    subscriberType,
    memberId,
    selectedChit,
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      downloadPdf(pdfPath);
    })();
  }, []);

  useEffect(() => {
    checkIsAllFeildsNotNull();
  }, [toggleCheckBox]);

  const checkIsAllFeildsNotNull = () => {
    if (toggleCheckBox === false) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  };

  const confirmSave = () => {
    setIsLoading(true);
    const payLoadData = {
      chitId,
      subscriberId: subScriberId,
      subscriberType: subscriberType,
    };
    const url = `${SiteConstants.API_URL}enrollment/v2/agreement/getStampedAgreement/${memberId}`;
    CommonService.commonPost(
      navigation,
      url,
      payLoadData
    )
      .then(async (data) => {
        setIsLoading(false);
        if (data !== undefined && data.agreementFilePath !== null) {
          navigation.navigate("ChitFundAgreementFinal", {
            pdfPath: data.agreementFilePath,
            chitId: chitId,
            subscriberId: subScriberId,
            subscriberType: subscriberType,
            memberId: memberId,
            selectedChit: selectedChit,
          });
        } else {
          alert(data?.errorMessage ?? "Unable to load");
        }
      })
      .catch((error) => {
        console.log(error, "error data");
        setIsLoading(false);
      });
  };

  const downloadPdf = async (location) => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;
    return CommonService.commonBlobGet(navigation, url, location).then(
      async (pdfData) => {
        if (pdfData !== undefined) {
          let binary = "";
          const bytes = new Uint8Array(pdfData);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          setPdfUrl(binary);
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <View style={[!isLoading ? styles.container : common_styles.center_align]}>
      {isLoading && pdfUrl ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
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
              <Pdf
                trustAllCerts={false}
                source={{
                  uri: pdfUrl,
                  cache: true,
                }}
                onLoadComplete={(numberOfPages, filePath) => {}}
                onPageChanged={(page, numberOfPages) => {}}
                onError={(error) => {}}
                onPressLink={(uri) => {}}
                style={styles.pdf}
              />
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
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: CssColors.appBackground,
  },
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: "100%",
  },
  checkboxText: {
    fontSize: 12,
    color: CssColors.primaryColor,
    margin: 0,
    padding: 0,
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
  paddingLeft20: {
    paddingLeft: 20,
  },
  paddingTop10: {
    paddingTop: 10,
  },
  flexDirectionRowTwo: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ChitFundAgreementDraft;
