import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { CssColors } from '../css/css_colors';
import Home from './Home';
import NewChits from './NewChits';
import Auction from './Auction';
import AccountNavigator from './AccountNavigator';
import VacantChits from './VacantChits';
import HomeHeader from '../sharedComp/HomeHeader';
import HomeHeaderLeft from '../sharedComp/HomeHeaderLeft';
import ChitsHeader from '../sharedComp/ChitsHeader';
import HomeIconSVG from './svgs/HomeIconSVG';
import MyChitsIconSVG from './svgs/MyChitsIconSVG';
import NewChitsIconSVG from './svgs/NewChitsIconSVG';
import AuctionIconSVG from './svgs/AuctionIconSVG';
import SettingsIconSVG from './svgs/SettingsIconSVG';
import MyChitsNavigator from './MyChitsNavigator';

const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

const NewChitTopTabs = () => {
  return (
    <TopTab.Navigator
      initialRouteName='NewChits'
      screenOptions={{
        tabBarActiveTintColor: CssColors.textColorSecondary,
        tabBarInactiveTintColor: CssColors.primaryPlaceHolderColor,
        tabBarIndicatorStyle: {
          backgroundColor: CssColors.light_orange,
          height: '100%',
          borderBottomColor: CssColors.textColorSecondary,
          borderBottomWidth: 2,
        },
         swipeEnabled: true,           // allow swipe gestures
         animationEnabled: true,       // enable smooth animation
         lazy: true,                   // load screens lazily (improves perf)
      }}
    >
      <TopTab.Screen
        title={'NewChits'}
        name="NewChits"
        options={{ tabBarLabel: 'New Chits' }}
        component={NewChits}
      />
      <TopTab.Screen name="VacantChits" component={VacantChits} options={{ tabBarLabel: 'Vacant' }} />
    </TopTab.Navigator>
  );
}

const TabNavigation = ({ navigation }) => {

  return (
    <Tab.Navigator
      // unmountOnBlur={true}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: CssColors.textColorSecondary,
        tabBarInactiveTintColor: CssColors.black,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        },
        // Hide the tab bar based on route focus
        tabBarStyle: ({ focused, color, size }) => {
          // Get the route name
          const routeName = getFocusedRouteNameFromRoute(route);
          
          // Define which routes should hide the tab bar
          const routesToHideTabBar = [
            'MyAccountDetails', 
            'BankAndWallet',
            'BankAndWalletMain', // Added for BankNavigator
            'BankDetails',       // Added for BankNavigator
            'AddBank',           // Added for BankNavigator
            'WalletHistory',     // Added for BankNavigator
            'PolicySettings', 
            'MyRequestSettings', // The main request screen
            'RequestMainScreen',  // Add the new screen name
            'RequestTransferChit',  // Add all request screens
            'RequestChitCancel',
            'RequestOther',
            'RequestChitPledgeRelease',
            'RequestPhoneNumberChange',
            'RequestHistoryDetails',
            'AppSettings', 
            'SupportSettings'
          ];
          
          // Hide the tab bar for specified routes
          if (routesToHideTabBar.includes(routeName)) {
            return { display: 'none' };
          }
          return {};
        },
      })}
    >
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerTitle: '',
          tabBarLabel: 'Home',
          headerRight: () => (
            <HomeHeader />
          ),
          headerLeft: () => (
            <HomeHeaderLeft />
          ),
          tabBarIcon: ({ focused }) => (
          <HomeIconSVG fill={focused ? CssColors.textColorSecondary : ''} width="24" height='24' />
          ),
        }}
      />
      <Stack.Screen
        name="MyChitsNavigator"
        component={MyChitsNavigator}
        options={({ route }) => ({
          headerShown: false,
          tabBarLabel: 'My Chits',
          tabBarIcon: ({ focused }) => (
            <MyChitsIconSVG fill={focused ? CssColors.textColorSecondary : ''} width="24" height='24' />
          ),
          tabBarStyle: (() => {
            const routeName = getFocusedRouteNameFromRoute(route);
            if (routeName === 'MyChitDetails' || routeName === 'MyCompletedHistory') {
              return { display: 'none' };
            }
            return {};
          })(),
        })}
      />
      <Stack.Screen
        options={{
          headerRight: () => (
            <ChitsHeader />
          ),
          title: 'New Chits',
          tabBarIcon: ({ focused }) => (
          <NewChitsIconSVG fill={focused ? CssColors.textColorSecondary : ''} width="24" height='24' />
          ),
        }} name="NewChitTopTabs" component={NewChitTopTabs}
      />
      <Stack.Screen
        options={{
          tabBarIcon: ({ focused }) => (
          <AuctionIconSVG fill={focused ? CssColors.textColorSecondary : ''} width="24" height='24' />
          ),
        }} name="Auction" component={Auction}
      />
      <Stack.Screen
        options={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <SettingsIconSVG fill={focused ? CssColors.textColorSecondary : ''} width="24" height='24' />
          ),
          tabBarLabel: 'Settings',
          // Hide tab bar when on inner screens
          tabBarStyle: (() => {
            const routeName = getFocusedRouteNameFromRoute(route);
            // Updated to include all bank and request-related routes
            const routesToHideTabBar = [
              'MyAccountDetails', 
              'BankAndWallet', 
              'PolicySettings', 
              'MyRequestSettings',
              'BankNavigator', // Add this new route
              'RequestMainScreen',
              'RequestTransferChit',
              'RequestChitCancel',
              'RequestOther',
              'RequestChitPledgeRelease',
              'RequestPhoneNumberChange',
              'RequestHistoryDetails',
              'AppSettings', 
              'SupportSettings'
            ];
            
            if (routesToHideTabBar.includes(routeName)) {
              return { display: 'none' };
            }
            return {};
          })(),
        })}
        name="Settings" 
        component={AccountNavigator}
      />
    </Tab.Navigator>
  )
}

export default TabNavigation;
