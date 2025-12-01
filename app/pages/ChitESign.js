import { StyleSheet, SafeAreaView } from "react-native";
import React, { useEffect } from "react";
import { WebView } from "react-native-webview";
import { CssColors } from "../css/css_colors";
import CommonService from "../services/CommonService";

const ChitESign = ({ route, navigation }) => {
  const {
    uri,
    redirectUri,
    data,
    chitId,
    subscriberId,
    subscriberType,
    memberId,
    selectedChit,
  } = route.params;
  const handleNavigationStateChange = (navState) => {
    if (navState.url.startsWith(redirectUri)) {
      updateDocketInfo();
    }
  };

  const updateDocketInfo = async () => {
    const url = `https://kcpl-qcerebrum-mobile.herokuapp.com/mobile/enrollment/v2/getDocketInfo?memberId=${memberId}&subscriptionId=${selectedChit.subscriptionId}&chitGroupName=${selectedChit.groupName}`;
    const body = {
      chitId: chitId,
      subscriberId: subscriberId,
      subscriberType: subscriberType,
      docketId: data.docketId,
      documentId: data.custom.documentId,
      apiResponseId: data.apiResponseId,
    };
    await CommonService.commonPost(navigation, url, body).then((response) => {
      console.log(resp);
      navigation.navigate("ThankYou");
    });
  };

  useEffect(() => {
    console.log("selectedChit ", selectedChit, data);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri }}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.appBackground,
  },
});

export default ChitESign;
