import React from 'react';
import { openContact } from '../sharedComp/Utils';
import ContactUsIconSVG from "../pages/svgs/ContactUsIconSVG";

const MyChitDetailsHeader = () => {
  
  return (
    <ContactUsIconSVG onPress={() => openContact(7090666444)} width={24} height={24} />
  )
}

export default MyChitDetailsHeader