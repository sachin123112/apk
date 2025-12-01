import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashView from './app/pages/SplashView';
import Login from './app/pages/Login';
import TabNavigation from './app/pages/TabNavigation';
import Document from './app/pages/Document';
import Home from './app/pages/Home';
import Profile from './app/pages/Profile';
import NewChitDetails from './app/pages/NewChitDetails';
import Certificates from './app/pages/Certificates';
import VacantChitDetails from './app/pages/VacantChitDetails';
import PaymentFail from './app/pages/PaymentFail';
import PaymentSuccess from './app/pages/PaymentSuccess';
// import ChitAgreementForm from './app/pages/ChitAgreementForm';
import ChitFundAgreementDraft from './app/pages/ChitFundAgreementDraft';
import ChitFundAgreementFinal from './app/pages/ChitFundAgreementFinal';
import ChitESign from './app/pages/ChitESign';
import ChitFundSelectMode from './app/pages/ChitFundSelectMode';
import ThankYou from './app/pages/ThankYou';
import FixedBidDetails from './app/pages/FixedBidDetails';
import AccountCopyDetailsView from './app/pages/AccountCopyDetailsView';
import MyChitCertificate from './app/pages/MyChitCertificate';
import AuctionDetails from './app/pages/auction/AuctionDetails';
import WheelComponent from './app/pages/auction/wheel';
import AuctionInfo from './app/pages/auction/AuctionInfo';
import FAQs from './app/pages/FAQs.js';
import NearByBranches from './app/pages/NearByBranches.js';
import BankNavigator from './app/pages/BankNavigator';
import RequestNavigator from './app/pages/RequestNavigator';
import AboutUs from './app/pages/AboutUs.js';
import ContactUs from './app/pages/ContactUs.js';
import ChangeLanguage from './app/pages/ChangeLanguage.js';
import MyChitHistory from './app/pages/MyChitHistory.js';
import MyChitPaymentDetails from './app/pages/MyChitPaymentDetails.js';
import MyChitsNavigator from './app/pages/MyChitsNavigator.js';
import { getStringData, storeStringData } from './app/sharedComp/AsyncData.js';
import BlockNumberBottomModal from './app/pages/BlockNumberBottomModal.js';
import { SiteConstants } from './app/SiteConstants.js';
import CrashlyticsService from './app/services/Crashlytics.js';
import crashlytics from '@react-native-firebase/crashlytics';
import { navigationRef } from './app/utils/RootNavigation.js';
import UpdateModal from './app/pages/UpdatePrompt.js';
import packageJson from './package.json';
import UpdateGate from './app/sharedComp/UpdateGate.js';
import CommonService from './app/services/CommonService.js';
import DeviceInfo from 'react-native-device-info';
import WalletHistory from './app/pages/WalletHistory.js';
import AddBank from './app/pages/AddBank.js';
import BankDetails from './app/pages/BankDetails.js';
import RequestHistoryDetails from './app/pages/RequestHistoryDetails.js';
const Stack = createNativeStackNavigator();
 
export default function App({ navigation }) {
 
  const [isBlocked, setIsBlocked] = useState(false);
  const [showUpdate, setShowUpdate] = useState(true);
 
  const lastScreenRef = useRef(null);
 
  useEffect(() => {
    CrashlyticsService.init();
 
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      CrashlyticsService.recordError(error, isFatal ? 'Fatal JS Error' : 'JS Error');
    });
 
    if (typeof global.process?.on === 'function') {
      process.on('unhandledRejection', (reason) => {
        CrashlyticsService.recordError(reason, 'Unhandled Promise Rejection');
      });
    }
  }, []);
 
  useEffect(() => {
    let cancelled = false;
 
    (async () => {
      try {
        const appVersion = DeviceInfo.getVersion();
        const checkPlatform = Platform.OS.toUpperCase();
        console.log("App", appVersion, checkPlatform)
        const response = await fetch(
          `${SiteConstants.API_URL}home/getCurrentVersion?platform=${checkPlatform}&clientVersion=${appVersion}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*"
            }
          }
        );
        const res = await response.json();
        const status = response.status;
        if (!cancelled) {
          if (status === 406 || res?.success === false) {
            setShowUpdate(true);
          } else {
            setShowUpdate(false);
          }
        }
 
      } catch (e) {
        console.error('Error checking app version:', e);
        if (!cancelled) setShowUpdate(false);
      }
    })();
 
    return () => { cancelled = true; };
  }, [navigation]);
 
  useEffect(() => {
    const unsub = UpdateGate.subscribe(setShowUpdate);
    return unsub;
  }, []);
 
  const checkUserStatus = useCallback(async (currentScreen) => {
    try {
      const userToken = await getStringData("mobileNumber");
      const phoneNumber = userToken?.replace("+91", "");
      if (phoneNumber && currentScreen !== "Login") {
        const response = await fetch(
          `${SiteConstants.API_URL}login/check_status/${phoneNumber}`,
          { method: "GET", headers: { Accept: "*/*" } }
        );
        const json = await response.json();
        console.log(json, "cgecjig ctdashgdv");
 
        const contactNumber = json?.customerSupportPhone?.split(" ")[1] || json?.customerSupportPhone;
        const message = json?.message;
        await Promise.all([
          storeStringData("Blockmessage", message),
          storeStringData("contactPhoneNumber", contactNumber),
        ]);
        setIsBlocked(!!json?.locked);
      } else {
        setIsBlocked(false);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setIsBlocked(false);
    }
  }, []);
 
  const handleStateChange = (state) => {
    const currentScreen = state.routes[state.index]?.name;
    // Only call API when user navigates to a different page except Login
    if (currentScreen !== lastScreenRef.current && currentScreen !== "Login") {
      checkUserStatus(currentScreen);
    }
    lastScreenRef.current = currentScreen;
  };
  return (
    <>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <NavigationContainer
          ref={navigationRef}
          onStateChange={handleStateChange}>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerTitleAlign: 'left',
              headerBackTitleVisible: false,
              headerBackTitle: "",
              headerTruncatedBackTitle: "",
              // Hides the back text on iOS
            }}
          >
            <Stack.Screen
              options={{ headerShown: false }}
              name="Splash"
              component={SplashView}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Login"
              component={Login}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="TabNavigation"
              component={TabNavigation}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Profile"
              component={Profile}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Document"
              component={Document}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Home"
              component={Home}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="PaymentFail"
              component={PaymentFail}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="PaymentSuccess"
              component={PaymentSuccess}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="FixedBidDetails"
              component={FixedBidDetails}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="AccountCopyDetailsView"
              component={AccountCopyDetailsView}
            />
            <Stack.Screen
              name="NewChitDetails"
              component={NewChitDetails}
              options={{ title: 'New Chit Details' }}
            />
            <Stack.Screen
              name="VacantChitDetails"
              component={VacantChitDetails}
              options={{ title: 'Vacant Chit Details' }}
            />
            <Stack.Screen
              name="Certificates"
              component={Certificates}
              options={{ title: 'Certificates' }}
            />
            {/* <Stack.Screen
            name="ChitAgreementForm"
            component={ChitAgreementForm}
            options={{ title: 'Application Form For Enrollment' }}
          /> */}
            <Stack.Screen
              name="ChitFundAgreementDraft"
              component={ChitFundAgreementDraft}
              options={{ title: 'Chit agreement draft' }}
            />
            <Stack.Screen
              name="ChitFundAgreementFinal"
              component={ChitFundAgreementFinal}
              options={{ title: 'Chit agreement stamped' }}
            />
            <Stack.Screen
              name="ChitESign"
              component={ChitESign}
              options={{ title: 'e-sign' }}
            />
            <Stack.Screen
              name="ChitFundSelectMode"
              component={ChitFundSelectMode}
              options={{ title: 'Select Mode' }}
            />
            <Stack.Screen
              name="ThankYou"
              component={ThankYou}
              options={{ title: 'Thank You' }}
            />
 
            <Stack.Screen
              name="WheelComponent"
              component={WheelComponent}
              options={{ title: 'Hello' }}
            />
 
            <Stack.Screen
              name="MyChitCertificate"
              component={MyChitCertificate}
              options={{ title: 'My Chit Certificates' }}
            />
 
            <Stack.Screen
              name="ContactUs"
              component={ContactUs}
              options={{ title: 'Contact Us' }}
            />
 
            <Stack.Screen
              name="ChangeLanguage"
              component={ChangeLanguage}
              options={{ title: 'Change Language' }}
            />
 
            <Stack.Screen
              name="FAQs"
              component={FAQs}
              options={{ title: 'FAQs' }}
            />
 
            <Stack.Screen
              name="NearByBranches"
              component={NearByBranches}
              options={{ title: 'Near by branches' }}
            />
 
            <Stack.Screen
              name="RequestNavigator"
              component={RequestNavigator}
              options={{
                headerShown: false,
              }}
            />
 
            <Stack.Screen
              name="BankMainScreen"
              component={BankDetails}
              options={{
                title: 'Bank Details',
                headerShown: true,
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTintColor: '#072E77',
                headerBackTitleVisible: false,       // hide back title text
                headerBackButtonDisplayMode: 'minimal', // iOS: icon only, no label
              }}
            />
 
            <Stack.Screen
              name="AddBank"
              component={AddBank}
              options={{
                title: 'Add Bank',
                headerShown: true,
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTintColor: '#072E77',
                headerBackTitleVisible: false,
              }}
            />
 
            <Stack.Screen
              name="WalletHistory"
              component={WalletHistory}
              options={{
                title: 'Wallet History',
                headerShown: true,
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTintColor: '#072E77',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="AboutUs"
              component={AboutUs}
              options={{ title: 'About Us' }}
            />
 
            <Stack.Screen
              name="AuctionDetails"
              component={AuctionDetails}
              options={{
                title: 'Auction Details',
                headerStyle: {
                  backgroundColor: '#072E77',
                  color: 'white',
                },
                headerTitleStyle: {
                  color: '#fff',
                },
                headerTintColor: 'white',
              }}
            />
 
            <Stack.Screen
              name="AuctionInfo"
              component={AuctionInfo}
              options={{ headerShown: false }}
            />
 
            <Stack.Screen
              name="MyChitPaymentDetails"
              component={MyChitPaymentDetails}
              options={{ headerShown: false }}
            />
 
            <Stack.Screen
              name="RequestHistoryDetails"
              component={RequestHistoryDetails}
              options={{
                headerShown: true, // Show header for history screen
                title: 'Request history',
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTintColor: '#072E77',
                headerBackTitleVisible: false,
              }}
            />
 
            <Stack.Screen
              options={{ headerShown: false }}
              name="MyChitHistory"
              component={MyChitHistory}
            />
            <Stack.Screen
              name="MyChitsNavigator"
              component={MyChitsNavigator}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
          {isBlocked && <BlockNumberBottomModal />}
        </NavigationContainer>
        {showUpdate && (
          <UpdateModal
            visible={showUpdate}
          />
        )}
      </SafeAreaProvider>
    </>
  );
}