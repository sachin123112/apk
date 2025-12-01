import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import PolicySettings from '../pages/PolicySettings';

const PolicyModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const Wrapper = Platform.OS === 'ios' ? View : SafeAreaView;
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <Wrapper style={{ flex: 1, backgroundColor: '#fff' }}>
        <View
          style={[
            styles.container,
            Platform.OS === 'ios' && { paddingTop: insets.top }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={26} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <PolicySettings />
          </View>
        </View>
      </Wrapper>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
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
  },
  closeButton: {
    padding: 5,
  },
});

export default PolicyModal;