import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BankDetails from './BankDetails';
import AddBank from './AddBank';
import WalletHistory from './WalletHistory';

const Stack = createNativeStackNavigator();

const BankNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="BankMainScreen"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#072E77',
      }}
    >
      <Stack.Screen 
        name="BankMainScreen" 
        component={BankDetails} 
        options={{ 
          title: 'Bank Details',
        }} 
      />
      <Stack.Screen
        name="AddBank"
        component={AddBank}
        options={{
          title: 'Add Bank',
        }}
      />
      <Stack.Screen
        name="WalletHistory"
        component={WalletHistory}
        options={{
          title: 'Wallet History',
        }}
      />
    </Stack.Navigator>
  );
};

export default BankNavigator;
