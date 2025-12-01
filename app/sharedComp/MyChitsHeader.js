import { View } from 'react-native';
import React from 'react';
import { useNavigation } from "@react-navigation/native";
import AddNewIconSVG from '../pages/svgs/AddNewIconSVG';
import HistoryIconSVG from '../pages/svgs/HistoryIconSVG';

const MyChitsHeader = () => {
  const navigation = useNavigation();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end' ,marginRight:-10}]}>
      <AddNewIconSVG onPress={() => navigation.navigate("NewChitTopTabs", { screen: "NewChits" })} width={48} height={48} />
      <HistoryIconSVG width={48} height={48} onPress={() => navigation.navigate("MyCompletedHistory", { screen: "MyCompletedHistory" })} />
    </View>
  )
}

export default MyChitsHeader