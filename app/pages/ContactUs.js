import {
  StyleSheet,
  SafeAreaView,
  BackHandler
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { CssColors } from "../css/css_colors";

const ContactUs = ({ route, navigation }) => {
  const { uri } = route.params;
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        // If WebView can go back, go back in WebView history
        webViewRef.current.goBack();
        return true; // Prevent default back action
      } else {
        // If WebView can't go back, navigate to previous screen
        navigation.goBack();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    // Cleanup function to remove the listener
    return () => backHandler.remove();
  }, [navigation, canGoBack]);

  const handleNavigationStateChange = (navState) => {
    // Update canGoBack state based on WebView navigation state
    setCanGoBack(navState.canGoBack);
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true} // iOS only
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
  }
});

export default ContactUs;