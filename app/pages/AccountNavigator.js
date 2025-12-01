import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyAccountDetails from './MyAccountDetails';
import PolicySettings from './PolicySettings';
import AppSettings from './AppSettings';
import SupportSettings from './SupportSettings';
import BankAndWallet from './BankAndWallet';
import Account from './Account';
import MyRequestSettings from './MyRequestSettings';

const Stack = createNativeStackNavigator();

const AccountNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AccountSettingsMain"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#072E77',
      }}
    >
      <Stack.Screen 
        name="AccountSettingsMain" 
        component={Account}
        options={{ 
          title: 'Settings',
        }} 
      />
      <Stack.Screen
        name="MyAccountDetails"
        component={MyAccountDetails}
        options={{
          title: 'My Account',
        }}
      />
      <Stack.Screen
        name="BankAndWallet"
        component={BankAndWallet}
        options={{
          title: 'Bank & Wallet',
        }}
      />
      <Stack.Screen
        name="PolicySettings"
        component={PolicySettings}
        options={{
          title: 'Policies',
        }}
      />
      <Stack.Screen
        name="MyRequestSettings"
        component={MyRequestSettings}
        options={{          
          title: 'Request'          
        }}
      />
      <Stack.Screen
        name="AppSettings"
        component={AppSettings}
        options={{
          title: 'App Settings',
        }}
      />
      <Stack.Screen
        name="SupportSettings"
        component={SupportSettings}
        options={{
          title: 'Support',
        }}
      />
    </Stack.Navigator>
  );
};

export default AccountNavigator;
