import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RequestTransferChit from './RequestTransferChit';
import RequestChitCancel from './RequestChitCancel';
import RequestOther from './RequestOther';
import RequestChitPledgeRelease from './RequestChitPledgeRelease';
import RequestPhoneNumberChange from './RequestPhoneNumberChange';
import RequestHistoryDetails from './RequestHistoryDetails';
import MyRequestSettings from './MyRequestSettings';

const Stack = createNativeStackNavigator();

const RequestNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="RequestMainScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#072E77',
        headerTitleAlign: 'left',
        animation: 'slide_from_right', // smooth transition avoids fabric crash
        freezeOnBlur: false, // ensure re-mount is safe
      }}
    >
      {/* Main entry screen */}
      <Stack.Screen
        name="RequestMainScreen"
        component={MyRequestSettings}
        options={{
          title: 'Request',
          headerShown: true,
        }}
      />

      {/* Sub screens with visually hidden headers */}
      <Stack.Screen
        name="RequestTransferChit"
        component={RequestTransferChit}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RequestChitPledgeRelease"
        component={RequestChitPledgeRelease}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RequestPhoneNumberChange"
        component={RequestPhoneNumberChange}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RequestChitCancel"
        component={RequestChitCancel}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RequestOther"
        component={RequestOther}
        options={{
          title: '',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RequestHistoryDetails"
        component={RequestHistoryDetails}
        options={{ 
          headerShown: true, // Show header for history screen
          title: 'Request history',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#072E77',
        }}
      />
    </Stack.Navigator>
  );
};

export default RequestNavigator;
