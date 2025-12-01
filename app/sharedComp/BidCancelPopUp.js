import React, { useState, useEffect, useRef } from 'react';
import DefaultBottomSheet from '../components/DefaultBottomSheet';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import { CssColors } from '../css/css_colors';
 
const BidCancelPopUp = ({
  isVisible,
  showError,
  showExpiredError,
  setIsVisible,
  onSubmit,
  phoneNumber,
  countdown,
  onResend,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [showErrorState, setShowErrorState] = useState(showError);
  const [showExpiredErrorState, setShowExpiredErrorState] = useState(showExpiredError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);
  const errorTimerRef = useRef(null);
 
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isMountedRef = useRef(false);
 
  useEffect(() => {
    isMountedRef.current = true;
 
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
 
    const showSub = Keyboard.addListener(showEvent, e => {
      if (!isMountedRef.current) return;
      setKeyboardHeight(e?.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (!isMountedRef.current) return;
      setKeyboardHeight(0);
    });
 
    return () => {
      isMountedRef.current = false;
      showSub.remove();
      hideSub.remove();
    };
  }, []);
 
  useEffect(() => {
    if (isVisible) {
      setOtp(['', '', '', '', '', '']);
      setIsButtonEnabled(false);
      setShowErrorState(showError);
      setShowExpiredErrorState(showExpiredError);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [isVisible, showError, showExpiredError]);
 
  useEffect(() => {
    const isComplete = otp.every(digit => digit !== '');
    setIsButtonEnabled(isComplete);
  }, [otp]);
 
  useEffect(() => {
    if (countdown === 0) {
      setIsResendDisabled(false);
    } else {
      setIsResendDisabled(true);
    }
  }, [countdown]);
 
  const handleOtpChange = (value, index) => {
    if (value !== '' && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setShowErrorState(false);
    setShowExpiredErrorState(false);
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
 
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
 
  const handleResendCode = async () => {
    setOtp(['', '', '', '', '', '']);
    setShowErrorState(false);
    setShowExpiredErrorState(false);
    setIsButtonEnabled(false);
    inputRefs.current[0]?.focus();
    await onResend();
  };
 
  const handleSubmit = async () => {
    if (!isButtonEnabled) return;
 
    if (countdown === 0) {
      setShowExpiredErrorState(true);
      setShowErrorState(false);
      return;
    }
 
    setIsSubmitting(true);
    const otpValue = otp.join('');
    await onSubmit(otpValue);
    setIsSubmitting(false);
  };
 
  const getMaskedPhoneNumber = number => {
    if (!number) return '';
    const last3 = number.slice(-3);
    return `+91 ******${last3}`;
  };
 
  const handleSheetClose = () => {
    Keyboard.dismiss();
    setIsVisible(false);
  };
 
  return (
    <DefaultBottomSheet
      visible={isVisible}
      onClose={handleSheetClose}
      height="auto"
    >
      <ScrollView
        keyboardShouldPersistTaps={Platform.OS === 'ios' ? 'handled' : 'never'}
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'ios' && keyboardHeight > 0
            ? keyboardHeight + 24
            : 24,
        }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>To process the bid cancel,</Text>
          <Text style={styles.subtitle}>
            Please confirm by entering the OTP sent to your mobile number: {getMaskedPhoneNumber(phoneNumber)}
          </Text>
          <Text style={styles.otpLabel}>Enter OTP</Text>
 
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                returnKeyType={index === 5 ? 'done' : 'next'}
              />
            ))}
          </View>
 
          {showExpiredErrorState ? (
            <Text style={styles.errorText}>The OTP entered is expired</Text>
          ) : showErrorState ? (
            <Text style={styles.errorText}>The OTP entered is invalid</Text>
          ) : null}
 
          <View style={styles.resendContainer}>
            <Text style={styles.timerText}>
              Your code will expire in {countdown} seconds
            </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={isResendDisabled}>
              <Text style={[styles.resendText, isResendDisabled && styles.disabledText]}>
                Resend code
              </Text>
            </TouchableOpacity>
          </View>
 
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!isButtonEnabled || isSubmitting) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!isButtonEnabled || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </DefaultBottomSheet>
  );
};
 
const styles = StyleSheet.create({
  container: { padding: 24 },
  errorText: {
    fontSize: 12,
    color: CssColors.errorTextColor,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CssColors.errorTextColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: CssColors.primaryPlaceHolderColor,
    marginBottom: 18,
  },
  otpLabel: {
    fontSize: 12,
    color: CssColors.primaryBorder,
    marginBottom: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderBottomColor: CssColors.primaryPlaceHolderColor,
    fontSize: 14,
    fontWeight: 'bold',
    color: CssColors.black,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 12,
    color: CssColors.primaryPlaceHolderColor,
    marginRight: 5,
  },
  resendText: {
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  disabledText: {
    color: '#999',
  },
  continueButton: {
    backgroundColor: '#18233d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
 
export default BidCancelPopUp;