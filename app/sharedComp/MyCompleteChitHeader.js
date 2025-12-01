import { View } from 'react-native';
import React from 'react';
import { useNavigation } from "@react-navigation/native";
import CloseIconSVG from '../pages/svgs/CloseIconSVG';

const MyCompleteChitHeader = () => {
  const navigation = useNavigation();
  return (
    <View style={[{flexDirection: 'row', alignItems: 'flex-end',marginRight:-10}]}>
      <CloseIconSVG width={48} height={48} onPress={()=> navigation.goBack()}  />
    </View>
  )
}

export default MyCompleteChitHeader