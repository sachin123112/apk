import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import MyChits from "./MyChits";
import MyChitDetails from './MyChitDetails';
import MyCompletedHistory from "./MyCompletedHistory";
import MyChitsHeader from "../sharedComp/MyChitsHeader";
import MyChitDetailsHeader from "../sharedComp/MyChitDetailsHeader";
import MyCompleteChitHeader from "../sharedComp/MyCompleteChitHeader";

const Stack = createNativeStackNavigator();
const MyChitsNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="MyChits"
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTintColor: '#072E77',
                headerTitleAlign: 'left',
                headerBackTitleVisible: false,
                headerBackTitle: "",
                headerTruncatedBackTitle: "",
            }}>
            <Stack.Screen
                name="MyChits"
                component={MyChits}
                options={{
                    title: 'My Chits',
                    headerRight: () => (
                        <MyChitsHeader />
                    ),
                }}
                initialParams={{ isFromPayment: false }}
            />
            <Stack.Screen
                name="MyChitDetails"
                component={MyChitDetails}
                options={{
                    title: 'My Chits Details',
                    headerRight: () => (
                        <MyChitDetailsHeader />
                    ),
                }}
            />
            <Stack.Screen
                name="MyCompletedHistory"
                component={MyCompletedHistory}
                options={{
                    headerBackVisible: false,
                    headerRight: () => (
                        <MyCompleteChitHeader />
                    ),
                    headerTitleStyle:{
                        color:'#072e77'
                    },
                    title: 'My completed chits',
                }}
            />
        </Stack.Navigator>
    )
}

export default MyChitsNavigator;