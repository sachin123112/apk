import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import common_styles from "../css/common_styles";
import Icon from "react-native-vector-icons/AntDesign";
import { CssColors } from "../css/css_colors";
import ReactNativeBlobUtil from "react-native-blob-util";

const ChitFundSelectMode = ({ route, navigation }) => {
  const {
    chitId,
    subscriberId,
    subscriberType,
    pdfUrl,
    memberId,
    selectedChit,
  } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const confirmSave = () => {
    setIsLoading(true);
    const payLoadData = {
      subscriptionId: subscriberId,
      memberId: memberId,
    };
    console.log(
      "Payload ",
      `${SiteConstants.API_URL}enrollment/v2/invokeESignRequest?subscriptionId=${subscriberId}&memberId=${memberId}`
    );
    CommonService.commonPost(
      navigation,
      `${SiteConstants.API_URL}enrollment/v2/invokeESignRequest?subscriptionId=${subscriberId}&memberId=${memberId}`,
      null
    )
      .then(async (data) => {
        setIsLoading(false);
        console.log("The data is ", data);
        if (data !== undefined) {
          navigation.navigate("ChitESign", {
            uri: data.signerInfo[0].invitationLink,
            redirectUri: "https://mykcpl.com/",
            data: data,
            chitId,
            subscriberId,
            subscriberType,
            memberId,
            selectedChit,
          });
        }
      })
      .catch((error) => {
        console.log(error, "error data");
        setIsLoading(false);
      });
  };

  const downloadOffline = () => {
    setIsLoading(true);
    alert("Kindly check the download for the agreement, thank you");
    const { dirs } = ReactNativeBlobUtil.fs;
    const fileUrl = pdfUrl;
    const fileExt = ".pdf";
    const filePath = `${dirs.DownloadDir}/agreement${fileExt}`;

    const config = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: "Downloading file...",
      },
    };
    ReactNativeBlobUtil.config(config)
      .fetch("GET", fileUrl)
      .then((res) => {
        navigation.navigate("TabNavigation", {
          screen: "Home",
        });
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  return (
    <SafeAreaView
      style={[!isLoading ? styles.container : common_styles.center_align]}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <View style={{ flex: 1, width: "100%", marginTop: 20 }}>
          <TouchableOpacity
            style={[
              common_styles.mychit_acc_copy_container,
              common_styles.margin_bottom_20,
            ]}
            onPress={() => confirmSave()}
          >
            <View style={styles.innerContainer}>
              <View style={{ width: "100%" }}>
                <Text style={common_styles.fontsize16}>Online</Text>
                <Text style={common_styles.fontsize12}>
                  I am having mobile number linked with aadhar card
                </Text>
              </View>
              <View>
                <Icon
                  name="right"
                  size={24}
                  color={CssColors.primaryBorder}
                  style={common_styles.margin_right_10}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={common_styles.mychit_acc_copy_container}
            onPress={() => downloadOffline()}
          >
            <View style={styles.innerContainer}>
              <View style={{ width: "100%" }}>
                <Text style={common_styles.fontsize16}>Offline</Text>
                <Text style={common_styles.fontsize12}>
                  I do not having Aadhaar card. Download and submit offline
                  document.
                </Text>
              </View>
              <View>
                <Icon
                  name="right"
                  size={24}
                  color={CssColors.primaryBorder}
                  style={common_styles.margin_right_10}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: "100%",
    width: "100%",
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingLeft: 10,
  },
});

export default ChitFundSelectMode;
