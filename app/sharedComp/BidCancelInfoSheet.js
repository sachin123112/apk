import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import DefaultBottomSheet from '../components/DefaultBottomSheet';
import PolicySettings from "../pages/PolicySettings";
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CssColors } from '../css/css_colors';
import InfoText from "../sharedComp/InfoText";
import NameTitle from "../sharedComp/NameTitle";
import { ConvertToTime, formatCurrency, convertISOStringToDateMonthYear } from "../sharedComp/Utils";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
 
const BidCancelInfoSheet = ({ bidCancelInfoData, isVisible, setIsVisible, onConfirmCancelBid }) => {
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const toggleCheckbox = () => setIsChecked(!isChecked);
  const insets = useSafeAreaInsets();  
  const Wrapper = Platform.OS === 'ios' ? View : SafeAreaView;
 
  return (
    <>
      {isVisible && (
        <DefaultBottomSheet
          visible={isVisible}
          onClose={() => setIsVisible(false)}
          height='auto' // or '50%' or 'auto'
        >
          {/* Your content here */}
          <ScrollView style={styles.container}>
            <Text style={styles.title}>Are you sure?</Text>
            <Text style={styles.subtitle}>Are you sure you want to cancel the bid?</Text>
 
            <View style={{ backgroundColor: '#ebf5fa' }}>
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Successful bid information</Text>
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <NameTitle title='Auction date' />
                    <InfoText content={convertISOStringToDateMonthYear(bidCancelInfoData.auctionDate)} />
                  </View>
                  <View style={styles.infoRow}>
                    <NameTitle title='Auction time' />
                    <InfoText content={ConvertToTime(bidCancelInfoData.auctionDate)} />
                  </View>
                  <View style={styles.infoRow}>
                    <NameTitle title='Auction Num' />
                    <InfoText content={bidCancelInfoData.auctionNum} />
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <NameTitle title='Bid amount' />
                    <InfoText content={formatCurrency(bidCancelInfoData.bidAmount) ?? "-"} isCurrency />
                  </View>
                  <View style={styles.infoRow}>
                    <NameTitle title='Prized amount' />
                    <InfoText content={formatCurrency(bidCancelInfoData.prizedAmount) ?? "-"} isCurrency />
                  </View>
                  <View style={styles.infoRow}>
                    <NameTitle title='Document status' />
                    <InfoText content={bidCancelInfoData.status} colorStyle={styles.orangeText} />
                  </View>
                </View>
              </View>
 
              <View style={styles.notesBox}>
                {[
                  "With the above details I have to take the chit payment,\nBut after the bid happened I am not interested in taking\nthe chit payment.",
                  "Cancel the chit payment which is aligned to me and\ntransfer to any other Subscriber.",
                  "And I will bear the charges bid difference that can be\nadded to my account."
                ].map((note, i) => (
                  <View style={styles.noteItem} key={i}>
                    <Text style={styles.noteAsterisk}>*</Text>
                    <Text style={styles.note}>{note}</Text>
                  </View>
                ))}
              </View>
            </View>
 
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[
                  styles.checkboxContainer,
                  isChecked
                    ? { backgroundColor: CssColors.green }
                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: CssColors.gray }
                ]}
                onPress={toggleCheckbox}
              >
                {isChecked && <MaterialIcons name="check" size={18} color="#fff" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Agree terms and conditions{' '}
                <Text style={styles.readMore} onPress={() => setPolicyModalVisible(true)}>Read more</Text>
              </Text>
            </View>
 
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.noButton} onPress={() => setIsVisible(false)}>
                <Text style={styles.noButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.yesButton, !isChecked && styles.disabledYesButton]}
                onPress={onConfirmCancelBid}
                disabled={!isChecked}
              >
                <Text style={[styles.yesButtonText, !isChecked && styles.disabledYesButtonText]}>
                  Yes! Cancel my bid
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Modal
            visible={policyModalVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setPolicyModalVisible(false)}
          >
            <Wrapper style={{ flex: 1, backgroundColor: '#fff' }}>
              <View
                style={[
                  styles.pcontainer,
                  Platform.OS === 'ios' && { paddingTop: insets.top }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Terms & Conditions</Text>
 
                  <TouchableOpacity onPress={() => setPolicyModalVisible(false)} style={styles.closeButton}>
                    <Icon name="x" size={26} color="#000" />
                  </TouchableOpacity>
                </View>
 
                <View style={{ flex: 1 }}>
                  <PolicySettings />
                </View>
              </View>
            </Wrapper>
          </Modal>
 
        </DefaultBottomSheet>
      )}
 
 
    </>
  );
};
 
const styles = StyleSheet.create({
  disabledYesButton: {
    backgroundColor: CssColors.gray,
  },
  disabledYesButtonText: {
    color: CssColors.disabledText || '#999',
  },
  container: {
    padding: 10,
    backgroundColor: CssColors.white
  },
     pcontainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CssColors.errorTextColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
    color: CssColors.primaryPlaceHolderColor,
  },
  infoBox: {
    backgroundColor: CssColors.white,
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    color: CssColors.primaryPlaceHolderColor,
  },
  infoSection: {
    marginBottom: 10,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  infoRow: {
    flex: 1,  // This makes each row take equal width
  },
  orangeText: {
    color: CssColors.textColorSecondary,
  },
  label: {
    fontSize: 18,
    color: '#8B94A3',
    fontWeight: '400',
  },
  value: {
    fontSize: 22,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8ECF2',
    marginVertical: 5,
  },
  valuePending: {
    fontWeight: '600',
    color: '#f57c00',
    fontSize: 14,
  },
  notesBox: {
    backgroundColor: '#ebf5fa',
    paddingTop: 5,
    paddingLeft: 16,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  noteAsterisk: {
    fontSize: 10,
    marginRight: 8,
    color: CssColors.black,
  },
  note: {
    fontSize: 10,
    color: CssColors.black
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: CssColors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  termsText: {
    fontSize: 8,
    color: CssColors.primaryPlaceHolderColor
  },
  readMore: {
    fontSize: 10,
    color: CssColors.primaryPlaceHolderColor,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  noButton: {
    borderWidth: 1,
    borderColor: CssColors.primaryBorder,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noButtonText: {
    color: CssColors.primaryColor,
    fontSize: 12,
    fontWeight: '600',
  },
  yesButton: {
    backgroundColor: CssColors.primaryColor,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesButtonText: {
    color: CssColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    elevation: 2,
    zIndex: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  }
});
 
export default BidCancelInfoSheet;