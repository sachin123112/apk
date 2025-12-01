
import {
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Platform,
  Linking,
  Alert,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import { CssColors } from "../css/css_colors";

const FAQs = ({ route, navigation }) => {
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
  const INJECTED_JS = `
  document.addEventListener("click", function(e) {
    var el = e.target.closest("a");
    if (el && el.href) {
      window.ReactNativeWebView.postMessage(el.href);
    }
  });
  true;
`;
  const handleMessage = (event) => {
    const url = event.nativeEvent.data;
    console.log("MESSAGE URL:", url);

    if (isWhatsAppLink(url)) {
      openWhatsApp(url);
    }
  };
  const isWhatsAppLink = (url) => {
    if (!url || typeof url !== 'string') return false;
    return (
      url.startsWith("https://wa.me") ||
      url.startsWith("https://api.whatsapp.com") ||
      url.startsWith("whatsapp://")
    );
  };
  const openWhatsApp = (incomingUrl) => {
    (async () => {
      try {
        let openUrl = incomingUrl;
        if (incomingUrl.startsWith('https://wa.me') || incomingUrl.startsWith('https://api.whatsapp.com')) {
          try {
            let phone = '';
            let text = '';

            if (incomingUrl.startsWith('https://wa.me')) {
              const parts = incomingUrl.replace(/^https?:\/\/wa\.me\//, '').split('?');
              phone = (parts[0] || '').split(/[/#]/)[0].replace(/[^0-9+]/g, '');
              const query = parts[1] || '';
              if (query) {
                const params = new URLSearchParams(query);
                text = params.get('text') || '';
              }
            } else {
              const qIndex = incomingUrl.indexOf('?');
              const query = qIndex >= 0 ? incomingUrl.substring(qIndex + 1) : '';
              if (query) {
                const params = new URLSearchParams(query);
                phone = (params.get('phone') || '').replace(/[^0-9+]/g, '');
                text = params.get('text') || '';
              }
            }
            if (phone) {
              openUrl = `whatsapp://send?phone=${encodeURIComponent(phone)}` + (text ? `&text=${encodeURIComponent(text)}` : '');
            }
          } catch (parseErr) {
            console.log('WhatsApp parse error', parseErr);
          }
        }
        const supported = await Linking.canOpenURL(openUrl);
        if (supported) {
          await Linking.openURL(openUrl);
          return;
        }
        await Linking.openURL(incomingUrl);
      } catch (e) {
        console.log('Open error:', e);
        Alert.alert('Cannot open WhatsApp', 'Please install WhatsApp or try from a browser.');
      }
    })();
  };
  const handleShouldStartLoadWithRequest = (event) => {
    const url = (event && (event.url || event.nativeEvent?.url)) || '';
    if (isWhatsAppLink(url)) {
      openWhatsApp(url);
      return false;
    }
    return true;
  };
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        injectedJavaScript={INJECTED_JS}
        onMessage={handleMessage}
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

export default FAQs;