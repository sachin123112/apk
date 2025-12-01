/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking, BackHandler, Image, ImageBackground } from 'react-native';
import Anticons from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { getStringData } from '../sharedComp/AsyncData';
import auth from '@react-native-firebase/auth';
import StorageService from '../sharedComp/StorageService';
import { BlurView } from '@react-native-community/blur';
import { CssColors } from '../css/css_colors';


const BlockNumberBottomModal = () => {

  const navigation = useNavigation();
  const [contackNumber, setContactNumber] = useState(90000000);
  const [message, setMessage] = useState('This Phone number has been blocked by administration please contact ');
  const [isBlocked, setIsBlocked] = useState(true);

  const handleModalClose = async () => {
    setIsBlocked(false);
    await StorageService.clear();
    await auth().signOut();
    navigation.navigate('Login');
    BackHandler.exitApp();
  };

  const handleContact = async () => {
    Linking.openURL(`tel:${contackNumber}`);
    setIsBlocked(false);
    await StorageService.clear();
    await auth().signOut();
    BackHandler.exitApp();
    navigation.navigate('Login');

  };

  const getContack = async () => {
    let number = await getStringData('contactPhoneNumber');
    let messages = await getStringData('Blockmessage');
    setMessage(messages);
    setContactNumber(number);
  };
  useEffect(() => {
    getContack();
    setIsBlocked(true);
    console.log("adjbsdjh",isBlocked);
    
  }, []);

  return (
    <Modal
      transparent={isBlocked}
      animationType="slide"
      visible={isBlocked}
      onRequestClose={() => { }}/* Do nothing */
    >
       <BlurView
        style={styless.absolute}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <View style={styless.modalBackground}>
        <View style={styless.modalContainer}>
          <TouchableOpacity onPress={handleModalClose} style={styless.closeButton}>
            <Anticons name="close" size={25} color="black" />

          </TouchableOpacity>
          <Image style={{ width: 120, height: 120, marginBottom: 20 }} source={require('../../assets/blocknumber.jpg')} />
          <View style={{ display: 'flex', alignItems: 'center' }}>

            <Text style={styless.modalTextheader}>Number is blocked</Text>
            <Text style={styless.modalText}>{message?.split('.')[0]}.</Text>
            <View style={{ display: 'flex', flexDirection: 'row' }}>
              <Text style={styless.modalText}>{message?.split('.')[1]}</Text>
              <TouchableOpacity onPress={handleContact} >
                <Text style={{ textDecorationLine: 'underline', fontWeight: '500',color:CssColors.black }}>{contackNumber}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={handleModalClose} style={{
            display: 'flex', alignItems: 'center', padding: 12, marginTop: 18, backgroundColor: '#072E77', width: '100%', borderRadius: 20,
          }}>
            <Text style={{ color: 'white' }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styless = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalText: {
    fontSize: 14,
    marginLeft: 15,
    marginRight: 15,
    textAlign: 'center',
    letterSpacing: 0,
    color: '#222B45',
  },
  modalTextheader: {
    fontSize: 22,
    marginBottom: 15,
    color: '#FF3830',
    fontWeight: '600',
  },
});
export default BlockNumberBottomModal;
