import { View } from 'react-native';
import React from 'react';
import common_styles from '../css/common_styles';
import {openContact} from '../sharedComp/Utils';
import ContactUsIconSVG from "../pages/svgs/ContactUsIconSVG";

const ChitsHeader = () => {
  
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, common_styles.margin_right_15]}>
      <ContactUsIconSVG onPress={() => openContact(7090666444)} width={24} height={24} />
    </View>
  )
}

export default ChitsHeader