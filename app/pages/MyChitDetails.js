import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import common_styles from '../css/common_styles';
import { CssColors } from '../css/css_colors';
import { SiteConstants } from '../SiteConstants';
import CommonService from '../services/CommonService';
import DefaultBottomSheet from '../components/DefaultBottomSheet';
import CustomCheckBox from '../components/CustomCheckbox';
import {
  storeObjectData,
  getObjectData,
  storeStringData,
} from '../sharedComp/AsyncData';
import InfoText from '../sharedComp/InfoText';
import NameTitle from '../sharedComp/NameTitle';
import BidCancelPopUp from '../sharedComp/BidCancelPopUp';
import BidCancelInfoSheet from '../sharedComp/BidCancelInfoSheet';
import ChitIconDisplay from '../sharedComp/ChitIconDisplay';
import {
  certificateData,
  convertMillisecondsToDate,
  convertMillisecondsToTime,
  convertISOStringToMonthDay,
  openContact,
  ConvertToTime,
  convertISOStringToDateMonthYear,
  formatDateToToday,
  formatCurrency,
  convertISOStringToDateMonth,
  formatIndianNumber,
  isValidCertificatePath,
} from '../sharedComp/Utils';
import IconTwo from 'react-native-vector-icons/Feather';
import IconThree from 'react-native-vector-icons/Ionicons';
import IconFour from 'react-native-vector-icons/MaterialIcons';
import IconFive from 'react-native-vector-icons/FontAwesome';
import AuctionMyChitDetailsSVG from './svgs/AuctionMyChitDetailsSVG';
import CertificateIconSVG from './svgs/CertificateIconSVG';
import PDFIconTwoSVG from './svgs/PDFIconTwoSVG';
import CompleteChitEnrolmentSVG from './svgs/CompleteChitEnrolmentSVG';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import { SiteTexts } from '../texts/SiteTexts';
import PaymentCycleIconSVG from './svgs/PaymentCycleIconSVG';
import BottomPopUp from '../sharedComp/BottomSheet';
import MyChitTopIconAndSlider from '../sharedComp/MyChitTopIconAndSlider';
import { Linking } from 'react-native';
import PledgedChitSvg from './svgs/PledgedChitSvg';
import PolicyModal from '../sharedComp/PolicyModal';
import KeyboardAwareFooter from '../sharedComp/KeyboardAwareFooter';
import SkeletonLoader from '../components/loaders/SkeletonLoader';
import useNavigationGuard from '../hooks/useNavigationGuard';
import { verifyCashfreePayment } from '../utils/PaymentHelper';
import { useFocusEffect } from '@react-navigation/native';

const MyChitDetails = ({ route, navigation }) => {
  const { subscriptionId } = route.params;
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [finalChitsData, setFinalChitsData] = useState(null);
  const [amount, setAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [minAmount, setMinAmount] = useState(0);
  const [disableSubscribe, setDisableSubscribe] = useState(false);
  const [disableSubscribeNow, setDisableSubscribeNow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enableProceedToPay, setEnableProceedToPay] = useState(false);
  const [isChecked, setChecked] = useState(true);
  const [agreementSheet, setAgreementSheet] = useState(false);
  const [showPaymentCycle, setShowPaymentCycle] = useState(false);
  const [isPaymentChecked, setIsPaymentChecked] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [auctionDetails, setAuctionDetails] = useState({});
  const [memberId, setMemberId] = useState('');
  const [memberAccountId, setMemberAccountId] = useState('');
  const [chitGroupName, setChitGroupName] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [chitGroupNameTicket, setChitGroupNameTicket] = useState('');
  const [isEnrollmentChecked, setIsEnrollmentChecked] = useState(false);
  const [showCancelBid, setShowCancelBid] = useState(false);
  const [weeklyAmount, setWeeklyAmount] = useState(0);
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [dailyAmount, setDailyAmount] = useState(0);
  const [selectedChit, setSelectedChit] = useState({});
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showInvalidOTP, setShowInvalidOTP] = useState(false);
  const [showExpiredError, setShowExpiredError] = useState(false);
  const [bottomSheetData, setBottomSheetData] = useState({});
  const [bidCancelInfoData, setBidCancelInfoData] = useState({});
  const [pledgedChit, setPledgedChit] = useState(false);
  const [infoSheetVisible, setInfoSheetVisible] = useState(false);
  const [userNumber, setUserNumber] = useState('');
  const [showBidCancelMessage, setShowBidCancelMessage] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(120);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const footerInputRef = useRef(null);
  const otpTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const handledOrderIdsRef = useRef(new Set());
  const verifyInFlightRef = useRef(false);
  const lastVerifyAtRef = useRef(0);
  const today = new Date();
  const { navigateWithGuard } = useNavigationGuard(navigation);

  // Shared keyboard height for both platforms
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowListener = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height || 0);
    });

    const keyboardWillHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused with subscriptionId:', subscriptionId);
      setIsLoading(true);
      getChitDetails();

      return () => { };
    }, [subscriptionId]),
  );

  const navigateToParentScreen = useCallback(
    (screenName, params = {}) => {
      const parentNavigator = navigation.getParent();
      if (parentNavigator) {
        setTimeout(() => {
          parentNavigator.navigate(screenName, params);
        }, 100);
      } else {
        navigateWithGuard(screenName, params);
      }
    },
    [navigation, navigateWithGuard],
  );

  // Component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    setIsVisible(false);
    setAgreementSheet(false);
    setShowPaymentCycle(false);
    setShowInvalidOTP(false);
    setShowExpiredError(false);
    getChitDetails();

    return () => {
      console.log('[Component] Unmounting - cleaning up');
      isMountedRef.current = false;
      setIsVisible(false);
    };
  }, []);

  // Polling with isVisible dependency
  useEffect(() => {
    if (isVisible) {
      console.log('[Data] Skipping poll - payment in progress');
      return;
    }

    console.log('[Data] Starting 5-minute polling interval');
    const interval = setInterval(() => {
      getChitDetails();
    }, 60 * 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (showBidCancelMessage) {
      const timer = setTimeout(() => {
        setShowBidCancelMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showBidCancelMessage]);

  const getChitDetails = (bidCancelTriggered = false) => {
    (async () => {
      try {
        console.log('Inside getChitDetails', finalChitsData);
        console.log(
          'Fetching chit details for subscriptionId:',
          subscriptionId,
        );

        const url = `${SiteConstants.API_URL}chit-group/v2/getChitGroupDetailsV2/${subscriptionId}`;
        console.log('Url is ', url);

        const chitsData = await CommonService.commonGet(navigation, url);
        console.log('Output is ', chitsData);

        if (chitsData && typeof chitsData === 'object') {
          console.log(chitsData, 'chitsdata');

          if (chitsData?.bidCancelledApplied && bidCancelTriggered) {
            setShowBidCancelMessage(true);
            setTimeout(() => setShowBidCancelMessage(false), 10000);
          }

          calculatePayments(
            chitsData?.collectionCycle,
            chitsData?.collectionAmount,
          );

          const selectedChitData = {
            enrollmentStatus: chitsData?.enrollmentStatus,
            agreementStatus: chitsData?.agreementStatus,
            enrollmentAgreementStatus: chitsData?.enrollmentAgreementStatus,
            runningInstall: chitsData?.runningInstallment || 0,
            numberOfInstallment: chitsData?.numberOfInstallment || 10,
            id: chitsData?.chitId,
            subscriptionId: chitsData?.subscriberId,
            groupName: chitsData?.chitGroupName,
          };

          setSelectedChit(selectedChitData);
          setFinalChitsData(chitsData);
          updateLiveInfo(chitsData);

          setAmount(parseFloat(chitsData.payableAmount || 0).toFixed(0));

          if (chitsData.totalDue > 0) {
            setDueAmount(
              formatIndianNumber(
                parseFloat(chitsData.totalDue).toFixed(0),
              ),
            );
            setMinAmount(chitsData.totalDue);
          } else {
            setDueAmount(parseFloat(0).toFixed(0));
            setMinAmount(1);
            setDisableSubscribeNow(true);
          }

          setMemberId(chitsData?.memberId);
          setMemberAccountId(chitsData?.primaryMemberAccountId);
          setChitGroupName(chitsData?.groupName);
          setTicketNumber(chitsData?.ticketNumber);
          setChitGroupNameTicket(chitsData?.chitGroupName);

          if (chitsData.auctionType) {
            setPaymentType(chitsData.auctionType);
            setIsPaymentChecked(true);
          }

          setIsLoading(false);

          if (chitsData?.enrollmentStatus === 'PENDING') {
            setIsEnrollmentChecked(true);
          }
        } else {
          console.error('Invalid API response:', chitsData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching chit details:', error);
        setIsLoading(false);
      }
    })();
  };

  const calculatePayments = (cycle, amount) => {
    const numAmount = parseFloat(amount) || 0;
    let daily = 0,
      weekly = 0,
      monthly = 0;

    switch (cycle) {
      case 'Daily':
        daily = numAmount;
        weekly = (numAmount * 7).toFixed(0);
        monthly = (numAmount * 30).toFixed(0);
        break;
      case 'Weekly':
        daily = ((numAmount * 4) / 30).toFixed(0);
        weekly = numAmount;
        monthly = (numAmount * 4).toFixed(0);
        break;
      case 'Monthly':
        daily = (numAmount / 30).toFixed(0);
        weekly = (numAmount / 4).toFixed(0);
        monthly = numAmount;
        break;
      default:
        daily = weekly = monthly = 0;
    }
    setDailyAmount(daily);
    setWeeklyAmount(weekly);
    setMonthlyAmount(monthly);
  };

  const RoundBtn = () => {
    return (
      <View style={styles.roundBtnContainer}>
        {isEnrollmentChecked ? (
          <CompleteChitEnrolmentSVG width={'130'} height={'130'} />
        ) : (
          <CompleteChitEnrolmentSVG width={'130'} height={'130'} />
        )}
      </View>
    );
  };

  const continueToChit = () => {
    setAgreementSheet(false);
    if (selectedChit.enrollmentStatus === 'PENDING') {
      navigateWithGuard('ChitAgreementForm', {
        chitId: finalChitsData?.chitId ?? '',
        subscriptionId,
        selectedChit: selectedChit,
        memberIds: memberId,
      });
    } else if (selectedChit.agreementStatus === 'PENDING') {
      getUnstampedStatus();
    } else if (selectedChit.agreementStatus === 'UNSTAMPED') {
      navigateToDraft(null);
    } else if (selectedChit.agreementStatus === 'STAMPED') {
      navigateToFinal();
    }
  };

  const getUnstampedStatus = () => {
    setIsLoading(true);
    const chitGroupID = finalChitsData?.chitId ?? '';
    const url = `${SiteConstants.API_URL}enrollment/v2/agreement/unstamped-agreement/${chitGroupID}/${memberId}/${subscriptionId}`;
    console.log('Url is ', url);
    CommonService.commonPost(navigation, url, {})
      .then(async data => {
        setIsLoading(false);
        if (data !== undefined) {
          navigateToDraft(data);
        }
      })
      .catch(error => {
        console.log(error, 'error data');
        alert('Something went wrong');
        setIsLoading(false);
      });
  };

  const navigateToFinal = () => {
    const pdfPath = finalChitsData?.stampedPath;
    const subscriberId = finalChitsData?.subscriberId;
    navigateWithGuard('ChitFundAgreementFinal', {
      pdfPath,
      chitId: subscriptionId ?? '',
      subscriberId,
      subscriberType: 'mobile',
      memberId,
      selectedChit,
    });
  };

  const navigateToDraft = data => {
    const pdfPath = data
      ? data?.agreementFilePath
      : finalChitsData?.unStampedPath;
    const subScriberId = data
      ? data?.subscriberDTO?.subscriberId
      : finalChitsData?.subscriberId;
    navigateWithGuard('ChitFundAgreementDraft', {
      pdfPath,
      subScriberId,
      chitId: selectedChit.id ?? '',
      subscriberType: 'mobile',
      memberId,
      selectedChit: selectedChit,
    });
  };

  const changePaymentCycle = () => {
    console.log('change payment cycle');
  };

  const handleResendOtpCode = async () => {
    setOtpCountdown(120);
    startOtpCountdown();
    await fetchCancelBidOTP(userNumber);
  };

  const AuctionDetails = ({ finalChitsData }) => {
    const getData = key => {
      const payableData = finalChitsData?.payableRequestList?.[0];
      if (key === 'auctionNumber') {
        return (
          payableData?.auctionNumber || finalChitsData?.refAuctionNumber || '--'
        );
      }
      return payableData?.[key] || finalChitsData?.[key] || '--';
    };

    return (
      <>
        <View
          style={[
            common_styles.chit_container_row2,
            styles.borderBottom_1,
            styles.paddingLeft_10,
          ]}
        >
          <View style={styles.width33}>
            <NameTitle title="Auction date" />
            <InfoText
              content={convertISOStringToDateMonthYear(
                getData('auctionedDateTime'),
              )}
              isBold={true}
            />
          </View>
          <View style={styles.width33}>
            <NameTitle title="Auction time" />
            <InfoText
              content={ConvertToTime(getData('auctionedDateTime'))}
              isBold={true}
            />
          </View>
          <View
            style={[
              styles.width33,
              common_styles.chit_container_row2_inner_container_last,
            ]}
          >
            <NameTitle title="Auction num" />
            <InfoText content={getData('auctionNumber')} isBold={true} />
          </View>
        </View>

        <View
          style={[
            common_styles.chit_container_row2,
            styles.borderBottom_1,
            styles.paddingLeft_10,
          ]}
        >
          <View style={styles.width33}>
            <NameTitle title="Bid amount" />
            <InfoText
              content={formatCurrency(getData('bidAmount'))}
              isCurrency={true}
              isBold={true}
            />
          </View>
          <View style={styles.width33}>
            <NameTitle title="Prized amount" />
            <InfoText
              content={formatCurrency(getData('prizedAmount'))}
              isCurrency={true}
              isBold={true}
            />
          </View>
          <View
            style={[
              styles.width33,
              common_styles.chit_container_row2_inner_container_last,
            ]}
          >
            <NameTitle title="Status" />
            <InfoText content={getData('status')} isBold={true} />
          </View>
        </View>
      </>
    );
  };

  const MinAmountView = () => {
    return (
      <View
        style={[
          common_styles.min_amount_error_container,
          keyboardHeight > 0 && {
            marginBottom:
              Platform.OS === 'ios'
                ? keyboardHeight - insets.bottom
                : keyboardHeight,
          },
        ]}
      >
        <Text
          style={common_styles.min_amount_error_text}
          adjustsFontSizeToFit={true}
        >
          Pay minimum {'\u20B9'} 1
        </Text>
      </View>
    );
  };

  const initiateOrder = async () => {
    try {
      console.log('[Order] Initiating order with dueAmount:', dueAmount);

      setIsLoading(true);

      const cleanAmount = dueAmount.toString().replace(/,/g, '');
      const numAmount = parseFloat(cleanAmount);

      console.log('[Order] Cleaned amount:', numAmount);

      if (isNaN(numAmount)) {
        alert('Invalid amount. Please enter a valid number.');
        setIsLoading(false);
        return;
      }

      if (numAmount <= 0) {
        alert('Cannot proceed with zero or negative amount');
        setIsLoading(false);
        return;
      }

      if (numAmount > 1000000) {
        alert('Amount exceeds maximum limit of ₹10,00,000');
        setIsLoading(false);
        return;
      }

      if (!finalChitsData?.chitId) {
        alert('Chit information missing. Please refresh and try again.');
        setIsLoading(false);
        return;
      }

      const finalBody = {
        chitId: finalChitsData?.chitId ?? '',
        orderAmount: cleanAmount,
        paymentGateway: 'cashfree',
        memberId,
        subscriptionId,
      };

      console.log('[Order] Creating order with body:', {
        ...finalBody,
        orderAmount: `₹${cleanAmount}`,
      });

      CommonService.commonPostOld(
        navigation,
        `${SiteConstants.API_URL}payment/v2/createOrderForPayment`,
        finalBody,
      )
        .then(async data => {
          if (
            data !== undefined &&
            data.cfOrderId &&
            data.paymentSessionId &&
            data.orderId
          ) {
            console.log('[Order] Order created successfully:', data.cfOrderId);

            let chitDetailsStore = {
              achitId: finalChitsData?.chitId ?? ''.toString(),
              paymentGateway: data.paymentGateway || 'cashfree',
              CFOrderId: data.cfOrderId,
              paymentSessionId: data.paymentSessionId,
              aamount: cleanAmount,
              apaymentDate:
                data.paymentDate?.toString() || new Date().toISOString(),
              memberId: data.memberId || memberId,
              subscriberId: data.subscriberId || subscriptionId,
              ticketNumber: finalChitsData?.ticketNumber,
              myChit: true,
            };

            _startCheckout(
              data.orderId,
              data.paymentSessionId,
              chitDetailsStore,
            );
          } else {
            console.error('[Order] Invalid response from server:', data);
            setIsLoading(false);
            alert('Invalid payment response. Please try again.');
          }
        })
        .catch(error => {
          console.error('[Order] Error creating order:', error);
          setIsLoading(false);
          alert('Failed to create order. Please try again.');
        });
    } catch (error) {
      console.error('[Order] Unexpected error in initiateOrder:', error);
      setIsLoading(false);
      alert('An error occurred. Please try again.');
    }
  };

  const _startCheckout = async (orderId, sessionId, chitDetailsStore) => {
    try {
      console.log('[Checkout] Storing payment details:', {
        cfOrderId: chitDetailsStore.CFOrderId,
        amount: chitDetailsStore.aamount,
      });

      await storeObjectData('chitPaymentDetails', chitDetailsStore);
      const retrievedData = await getObjectData('chitPaymentDetails');
      if (
        !retrievedData ||
        retrievedData.CFOrderId !== chitDetailsStore.CFOrderId
      ) {
        throw new Error('Failed to store payment details in AsyncStorage');
      }

      try {
        CFPaymentGatewayService.removeCallback();
      } catch (e) { }

      CFPaymentGatewayService.setCallback({
        async onVerify(orderID) {
          console.log('[Cashfree] onVerify triggered with orderID:', orderID);

          const now = Date.now();
          if (now - lastVerifyAtRef.current < 4000) {
            console.log('[Cashfree] onVerify ignored: debounce window');
            return;
          }
          lastVerifyAtRef.current = now;

          if (verifyInFlightRef.current) {
            console.log(
              '[Cashfree] onVerify ignored: verification already in flight',
            );
            return;
          }
          if (handledOrderIdsRef.current.has(orderID)) {
            console.log('[Cashfree] onVerify ignored: order already handled');
            return;
          }
          verifyInFlightRef.current = true;
          handledOrderIdsRef.current.add(orderID);

          setIsLoading(true);
          try {
            const result = await verifyCashfreePayment(navigation, orderID);
            if (result?.success) {
              console.log('Payment verified successfully');
              setIsVisible(false);
              navigation.navigate('PaymentSuccess', {
                paymentOrderId: orderID,
                paymentVerified: true,
                result,
              });
            } else {
              console.log('Payment verification failed');
              setIsVisible(false);
              navigateToParentScreen('PaymentFail', { paymentOrderId: orderID });
            }
          } catch (err) {
            console.error('[Cashfree] Verification error:', err);
            setIsVisible(false);
            navigateToParentScreen('PaymentFail', {
              paymentOrderId: orderID,
            });
          } finally {
            setIsLoading(false);
            verifyInFlightRef.current = false;
            try {
              CFPaymentGatewayService.removeCallback();
            } catch (e) { }
          }
        },

        onError(error, orderID) {
          console.log('[Cashfree] onError triggered:', { error, orderID });

          try {
            CFPaymentGatewayService.removeCallback();
          } catch (e) { }

          if (verifyInFlightRef.current) {
            console.log('[Cashfree] onError ignored: verification in flight');
            return;
          }
          if (orderID && handledOrderIdsRef.current.has(orderID)) {
            console.log('[Cashfree] onError ignored: order already handled');
            return;
          }
          if (orderID) handledOrderIdsRef.current.add(orderID);

          setIsLoading(false);
          setIsVisible(false);
          navigateToParentScreen('PaymentFail', {
            paymentOrderId: orderID,
            errorMessage: error,
          });
        },
      });

      const session = new CFSession(sessionId, orderId, CFEnvironment.SANDBOX);
      console.log('[Checkout] Initiating Cashfree payment session');
      CFPaymentGatewayService.doWebPayment(session);
    } catch (e) {
      console.error('[Checkout] Error in _startCheckout:', e?.message);
      setIsLoading(false);
      setIsVisible(false);
      alert('Payment initiation failed: ' + e?.message);
    }
  };

  const updateAmount = value => {
    console.log('Updated amount:', value);

    if (value.startsWith('0') && value.length > 1) {
      value = value.replace(/^0+/, '');
    }

    if (!value || value === '' || value === '0') {
      setDueAmount('');
      setDisableSubscribe(true);
      setDisableSubscribeNow(true);
      return;
    }

    if (value === '.') {
      setDueAmount('');
      setDisableSubscribe(true);
      setDisableSubscribeNow(true);
      return;
    }

    const rawValue = value.toString().replace(/,/g, '');
    const [integerPart, decimalPart] = rawValue.split('.');

    if (decimalPart && decimalPart.length > 2) {
      setDisableSubscribe(true);
      setDisableSubscribeNow(true);
      setDueAmount(formatIndianNumber(rawValue));
      return;
    }

    const numericValue = parseFloat(rawValue) || 0;

    if (numericValue > 1000000) {
      console.log(numericValue, 'greater than 1000000');
      // setDisableSubscribe(true);
      setDisableSubscribeNow(true);
      setDueAmount(formatIndianNumber(rawValue));
      return;
    }

    setDisableSubscribeNow(false);

    if (isVisible) {
      termsChecked(isChecked, numericValue);
    }

    setDisableSubscribe(numericValue < 1);

    setDueAmount(formatIndianNumber(rawValue));
  };

  const termsChecked = (value, totalAmount = amount) => {
    setEnableProceedToPay(false);
    setChecked(value);
    if (value === false || totalAmount < 1) {
      setEnableProceedToPay(true);
    }
  };

  const certificateClicked = useCallback(
    selectedCertificateId => {
      const agreementData = finalChitsData?.agreementPath
        ? { ccCertLocation: finalChitsData.agreementPath }
        : null;

      const certData = certificateData(
        finalChitsData?.ccCertLocation
          ? { ccCertLocation: finalChitsData.ccCertLocation }
          : null,
        finalChitsData?.psoCertLocation
          ? { psoCertLocation: finalChitsData.psoCertLocation }
          : null,
        finalChitsData?.fdDocPath
          ? { fdDocPath: finalChitsData.fdDocPath }
          : null,
        agreementData,
      );

      navigateToParentScreen('Certificates', {
        itemId: selectedCertificateId,
        certificateData: certData,
        chitData: finalChitsData,
        chitId: finalChitsData?.chitId ?? '',
        myChit: true,
        memberId,
        isVacantChit: false,
      });
    },
    [navigateToParentScreen, finalChitsData, memberId],
  );

  const selectPriceType = type => {
    // noop for now
  };

  const updateLiveInfo = e => {
    if (e?.auctionDetails) {
      setAuctionDetails(e.auctionDetails);
    } else {
      setAuctionDetails({
        auctionEndDateTime: null,
        auctionNo: null,
        lastBidValue: null,
        currentBidValue: null,
      });
    }
  };

  useEffect(() => {
    if (auctionDetails?.auctionEndDateTime) {
      clearTimer(getDeadTime());
    }
  }, [auctionDetails]);

  const Ref = useRef(null);
  const [timer, setTimer] = useState('00d:00h:00m:00s');

  const getTimeRemaining = e => {
    const total = e - new Date();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = e => {
    let { total, days, hours, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      setTimer(
        (days > 0 ? days : '0' + days) +
        'd:' +
        (hours > 9 ? hours : '0' + hours) +
        'h:' +
        (minutes > 9 ? minutes : '0' + minutes) +
        'm:' +
        (seconds > 9 ? seconds : '0' + seconds) +
        's',
      );
    } else {
      if (Ref.current) clearInterval(Ref.current);
    }
  };

  const clearTimer = e => {
    setTimer('00d:00h:00m:00s');
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    if (!auctionDetails?.auctionEndDateTime) {
      return new Date();
    }
    return new Date(auctionDetails.auctionEndDateTime * 1000);
  };

  const manageBidNow = () => {
    if (finalChitsData.auctionEligibiltyType === 'ELIGIBLE') {
      // Implementation here
    } else if (finalChitsData.auctionEligibiltyType === 'ELIGIBLEBYCOMPANY') {
      if (finalChitsData.reasonNotToBid === 'CLEAR_THE_DUES') {
        setBottomSheetData({
          title: 'Clear the Dues',
          titleColor: '#ff4a00',
          description: 'Clear your dues and participate in auction',
          sendButtonTitle: `₹ ${dueAmount} Pay now`,
          sendButtonBGColor: '#072E77',
          totalButtons: 1,
          tag: 'navigate',
          showIcon: false,
          showIconName: 'clearDues',
          showSVG: true,
        });
        setShowBottomSheet(true);
      } else if (
        finalChitsData?.reasonNotToBid === 'INSTALLMENT_NOT_PAID_ONTIME'
      ) {
        setBottomSheetData({
          title: 'Clear the Dues',
          titleColor: '#ff4a00',
          description:
            'Clear your last three months dues\n otherwise your chit will be cancelled.',
          sendButtonTitle: `₹ ${finalChitsData?.totalDue || 0} Pay now`,
          sendButtonBGColor: '#072E77',
          totalButtons: 1,
          tag: 'navigate',
          showIcon: false,
          showIconName: 'clearDues',
          showSVG: true,
        });
        setShowBottomSheet(true);
      } else if (finalChitsData?.reasonNotToBid === 'AGGREEMENT_PENDING') {
        setBottomSheetData({
          title: 'Complete Chit Agreement',
          titleColor: '#072E77',
          description:
            'Agreement is pending.\nPlease complete following few steps.',
          sendButtonTitle: 'Continue',
          descTwoLines: true,
          sendButtonBGColor: '#072E77',
          totalButtons: 1,
          showIcon: false,
          showIconName: 'enroll',
          showSVG: true,
        });
        setShowBottomSheet(true);
      } else if (finalChitsData?.reasonNotToBid === 'ENROLMENT_PENDING') {
        setBottomSheetData({
          title: 'Complete Chit Enrolment',
          titleColor: '#072E77',
          description:
            'Enrolment is pending. \nPlease complete following few steps.',
          sendButtonTitle: 'Continue',
          descTwoLines: true,
          sendButtonBGColor: '#072E77',
          totalButtons: 1,
          showIcon: false,
          showIconName: 'enroll',
          showSVG: true,
        });
        setShowBottomSheet(true);
      } else if (finalChitsData?.reasonNotToBid === 'PLEDGED') {
        setBottomSheetData({
          title: 'Pledged chit',
          titleColor: '#072E77',
          description:
            'This chit is pledged. \nnot able to participate in auction.',
          sendButtonTitle: 'Close',
          sendButtonBGColor: '#072E77',
          totalButtons: 1,
          showIcon: false,
          showIconName: 'pledged',
          descTwoLines: true,
          showSVG: true,
        });
        setShowBottomSheet(true);
      } else {
        alert(
          'Due to some reason you are not allowed to participate in the auction',
        );
      }
    }
  };

  const cancelBid = () => {
    console.log(finalChitsData, 'inside cancel bid');
    const bidCancelInfoDataPrep = {
      auctionDate:
        finalChitsData?.successfulBidInformationDto?.auctionedDateTime,
      auctionNum: finalChitsData?.successfulBidInformationDto?.auctionNumber,
      bidAmount: finalChitsData?.successfulBidInformationDto?.bidAmount,
      prizedAmount: finalChitsData?.successfulBidInformationDto?.prizedAmount,
      status: finalChitsData?.successfulBidInformationDto?.status,
    };
    setBidCancelInfoData(bidCancelInfoDataPrep);
    setInfoSheetVisible(true);
  };

  const handleSubmitOTP = async otpValue => {
    setIsLoading(true);
    let phoneNumbers = null;
    const userData = await getObjectData('userData');
    phoneNumbers = userData?.phoneNumber || userData?.data?.phoneNumber;
    setUserNumber(phoneNumbers);
    if (!userData) {
      const newUserData = await fetchUserData();
      phoneNumbers = newUserData?.data?.phoneNumber;
      setUserNumber(phoneNumbers);
    }
    const confirmOTPData = await confirmOTP(phoneNumbers, otpValue);
    if (
      confirmOTPData.isSuccess === 'false' &&
      confirmOTPData.error === 'Invalid OTP'
    ) {
      console.log('error data');
      setShowInvalidOTP(true);
      setIsLoading(false);
      return;
    } else if (
      confirmOTPData.isSuccess === 'false' &&
      confirmOTPData.error === 'OTP time-limit exceeded'
    ) {
      console.log('error data');
      setShowExpiredError(true);
      setIsLoading(false);
      return;
    } else if (
      confirmOTPData.isSuccess === 'false' &&
      confirmOTPData.error === null
    ) {
      setShowCancelBid(false);
      setInfoSheetVisible(false);
      setIsLoading(false);
    }
    if (confirmOTPData.isSuccess === 'true') {
      console.log('inside bidCancelApply');
      const url = `${SiteConstants.API_URL}user/v2/bidCancelApply`;

      const payLoad = {
        memberId: finalChitsData?.memberId,
        chitId: finalChitsData?.chitGroupName,
        groupName: finalChitsData?.groupName,
        isDocProvided: false,
        ticketStatus: finalChitsData?.ticketStatus,
        docPath: '',
      };
      console.log(url, 'bidCancelApply url');
      console.log(payLoad, 'bidCancelApply payload');
      try {
        const confirmBidcancel = await CommonService.commonPost(
          navigation,
          url,
          payLoad,
        );
        console.log(confirmBidcancel);
        if (confirmBidcancel) {
          console.log(confirmBidcancel, 'bidCancelissuccess');
          setIsLoading(true);
          setAgreementSheet(false);
          setShowPaymentCycle(false);
          getChitDetails(true);
        } else {
          alert('Something went wrong in bid cancel, kindly try again later');
          setAgreementSheet(false);
          setShowPaymentCycle(false);
          setIsLoading(false);
        }
      } catch (error) {
        alert('Something went wrong in bid cancel, kindly try again later');
        setIsLoading(false);
        console.log(error, 'bidCancelApply API error');
        console.error('Error fetching Bid cancel:', error);
      }
    }
    setShowCancelBid(false);
  };

  const navigateToBidNow = e => {
    navigateToParentScreen('AuctionDetails', { data: e });
  };

  const handleSubmitCancelBid = async () => {
    setIsLoading(true);
    setShowInvalidOTP(false);
    setShowExpiredError(false);
    let phoneNumber = null;
    const userData = await getObjectData('userData');
    phoneNumber = userData?.data?.phoneNumber || userData?.phoneNumber;
    setUserNumber(phoneNumber);
    if (!userData) {
      const newUserData = await fetchUserData();
      phoneNumber = newUserData?.data?.phoneNumber || newUserData?.phoneNumber;
      setUserNumber(phoneNumber);
    }
    const sendOTP = await fetchCancelBidOTP(phoneNumber);
    if (sendOTP) {
      setOtpCountdown(120);
      startOtpCountdown();
      setInfoSheetVisible(false);
      setShowCancelBid(true);
      setIsLoading(false);
    }
  };

  const startOtpCountdown = () => {
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(otpTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchCancelBidOTP = async phoneNumber => {
    const url = `${SiteConstants.API_URL}sms/v2/generate-otp/${phoneNumber}`;
    console.log(url);
    try {
      const response = await CommonService.commonGet(navigation, url);
      return response;
    } catch (error) {
      console.log('catch ====>', error);
      setIsLoading(false);
      return 'null';
    }
  };

  const confirmOTP = async (phoneNumber, otpValue) => {
    const url = `${SiteConstants.API_URL}sms/v2/validate-otp?phoneNumber=${phoneNumber}&otp=${otpValue}`;
    console.log(url);
    try {
      const response = await CommonService.commonGet(navigation, url);
      console.log(response);
      return response;
    } catch (error) {
      console.log('catch ====>', error);
      setIsLoading(false);
      return 'null';
    }
  };

  const fetchUserData = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData('userData', response);
      await storeStringData('memberID', response.id ?? '');
      return response;
    } catch (error) {
      console.log('catch ====>', error);
      setIsLoading(false);
      return 'null';
    }
  };

  if (isLoading || !finalChitsData) {
    return (
      <View style={common_styles.center_align}>
        <SkeletonLoader cardTypeThree={4} />
      </View>
    );
  }

  return (
    <View
      style={[
        !isLoading
          ? [
            styles.container,
            insets.bottom > 20 ? { paddingBottom: insets.bottom } : {},
          ]
          : common_styles.center_align,
      ]}
    >
      {isLoading || !finalChitsData ? (
        <SkeletonLoader cardTypeThree={4} />
      ) : (
        <>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
            style={{ flex: 1 }}
          >
            <ScrollView>
              {showBidCancelMessage && (
                <View style={styles.paymentDetailsContainer}>
                  <Text style={styles.bidCancelAppliedOnText}>
                    Bid cancel request sent successfully
                  </Text>
                </View>
              )}
              {selectedChit.enrollmentAgreementStatus !== ' ' && (
                <View style={styles.notificationbar}>
                  <Pressable />
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      marginLeft: 5,
                    }}
                  >
                    To complete the agreement contact relationship manager
                  </Text>
                </View>
              )}

              {/* Chit Details */}
              <View
                style={[
                  common_styles.chit_container,
                  common_styles.marginTopTen,
                  styles.paddingLeft_0,
                  common_styles.shadowProp,
                ]}
              >
                <MyChitTopIconAndSlider
                  chitAmount={finalChitsData?.chitValue || 0}
                  chitGroupName={finalChitsData?.memberName || ''}
                  chitName={finalChitsData?.chitGroupName || ''}
                  runningInstall={finalChitsData?.runningInstallment || 0}
                  numberOfInstallment={finalChitsData?.numberOfInstallment || 10}
                />

                <View
                  style={[
                    common_styles.chit_container_row2,
                    styles.paddingLeft_10,
                    styles.borderBottom_1,
                    styles.paddingTop_20,
                  ]}
                >
                  <View style={styles.width33}>
                    <NameTitle title="Chit value" />
                    <InfoText
                      content={formatCurrency(
                        finalChitsData?.chitValue,
                      ) ?? '-'}
                      isCurrency={true}
                      isBold={true}
                    />
                  </View>
                  <View style={styles.width33}>
                    <NameTitle title="Instalments" />
                    <InfoText
                      content={`${finalChitsData?.numberOfInstallment || 0
                        } Months`}
                      isBold={true}
                    />
                  </View>
                  <View
                    style={[
                      common_styles.chit_container_row2_inner_container_last,
                      styles.width33,
                    ]}
                  >
                    <NameTitle title="Dividend earned" />
                    <InfoText
                      content={
                        formatCurrency(finalChitsData?.earnDividend) ?? ''
                      }
                      isCurrency={true}
                      isBold={true}
                      colorStyle={styles.greenText}
                    />
                  </View>
                </View>

                <View
                  style={[
                    common_styles.chit_container_row2,
                    styles.paddingLeft_10,
                    styles.borderBottom_1,
                  ]}
                >
                  <View style={styles.width33}>
                    <NameTitle title="Payable amount" />
                    <InfoText
                      content={formatCurrency(
                        finalChitsData?.payableAmount,
                      )}
                      isCurrency={true}
                      isBold={true}
                    />
                  </View>
                  <View style={styles.width33}>
                    <NameTitle title="Paid amount" />
                    <InfoText
                      content={formatCurrency(finalChitsData?.paidAmount)}
                      isCurrency={true}
                      isBold={true}
                    />
                  </View>
                  <View
                    style={[
                      common_styles.chit_container_row2_inner_container_last,
                      styles.width33,
                    ]}
                  >
                    <NameTitle title="Due amount" />
                    <InfoText
                      content={formatCurrency(finalChitsData?.totalDue)}
                      isCurrency={true}
                      colorStyle={styles.orangeText}
                      isBold={true}
                    />
                  </View>
                </View>

                <View
                  style={[
                    common_styles.chit_container_row2,
                    styles.paddingLeft_10,
                    styles.borderBottom_1,
                  ]}
                >
                  <View style={styles.width33}>
                    <NameTitle title="Status" />
                    <InfoText
                      content={finalChitsData?.ticketStatus}
                      isBold={true}
                    />
                  </View>
                  <View style={styles.width33}>
                    <NameTitle title="Auction type" />
                    <InfoText
                      content={finalChitsData?.auctionType ?? '--'}
                      isBold={true}
                    />
                  </View>
                  <View
                    style={[
                      common_styles.chit_container_row2_inner_container_last,
                      styles.width33,
                    ]}
                  >
                    <NameTitle title="Payment cycle" />
                    <Pressable
                      onPress={() =>
                        finalChitsData?.ticketStatus === 'PS'
                          ? alert(
                            'please contact your relationship manager to modify the payment cycle',
                          )
                          : setShowPaymentCycle(true)
                      }
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text
                          style={[
                            common_styles.chit_container_row2_inner_header_info,
                            styles.paymentCycleText,
                          ]}
                        >
                          {finalChitsData?.collectionCycle ?? ''}
                        </Text>
                        <PaymentCycleIconSVG width={24} height={24} />
                      </View>
                    </Pressable>
                  </View>
                </View>

                <View
                  style={[
                    common_styles.chit_container_row2,
                    styles.paddingLeft_10,
                  ]}
                >
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ marginTop: 5, paddingRight: 5 }}>
                      <NameTitle title="Due date" />
                    </View>
                    <InfoText
                      content={convertISOStringToDateMonth(
                        finalChitsData?.dueDate,
                      )}
                      isBold={true}
                    />
                  </View>
                </View>

                <View style={styles.relationshipContainer}>
                  <Text style={styles.relationshipText}>
                    Your relationship manager -{' '}
                    {finalChitsData?.serviceExecutiveName}
                  </Text>
                  <IconTwo
                    name="phone-call"
                    size={10}
                    style={styles.relationshipIcon}
                  />
                  <Pressable
                    onPress={() =>
                      openContact(
                        finalChitsData?.serviceExecutivePhoneNumber,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.relationshipText,
                        styles.fontWeight600,
                      ]}
                    >
                      {finalChitsData?.serviceExecutivePhoneNumber}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Auction details */}
              <View
                style={[
                  common_styles.chit_container,
                  styles.paddingLeft_0,
                  common_styles.shadowProp,
                ]}
              >
                <View
                  style={[
                    styles.auctionDetailsParent,
                    styles.paddingLeft_10,
                    styles.paddingBottom_10,
                    styles.borderBottom_1,
                  ]}
                >
                  <View style={styles.leftContainerAuction}>
                    <Text style={styles.chit_details_title}>
                      Auction details
                    </Text>
                  </View>
                  <View style={styles.rightContainerAuction}>
                    <Text style={[styles.timer, styles.marginRight10]}>
                      {timer}
                    </Text>
                    <AuctionMyChitDetailsSVG
                      width={25}
                      height={25}
                      style={{ marginRight: 10 }}
                    />
                  </View>
                </View>

                <View
                  style={[
                    common_styles.chit_container_row2,
                    styles.borderBottom_1,
                    styles.paddingLeft_10,
                  ]}
                >
                  <View style={styles.width33}>
                    <NameTitle title="Bidding mode" />
                    {finalChitsData?.bidType?.toUpperCase() === 'FIX' ? (
                      <Pressable
                        onPress={() => {
                          navigateToParentScreen('FixedBidDetails', {
                            schemeId: finalChitsData?.schemeId ?? '',
                            chitId: finalChitsData?.chitId ?? '',
                          });
                        }}
                      >
                        <Text
                          style={[
                            common_styles.chit_container_row2_inner_header_info,
                            styles.paymentCycleText,
                          ]}
                        >
                          {finalChitsData?.bidType ?? ''}
                        </Text>
                      </Pressable>
                    ) : (
                      <InfoText
                        content={
                          finalChitsData?.bidType?.toUpperCase() === 'OPEN'
                            ? 'Open bid'
                            : '--'
                        }
                      />
                    )}
                  </View>
                  <View style={[styles.width33]}>
                    <NameTitle title="End date & time" />
                    <InfoText
                      content={
                        convertMillisecondsToDate(
                          auctionDetails?.auctionEndDateTime,
                        ) ?? '-'
                      }
                      isBold={true}
                      reducedFontText={
                        ` ${convertMillisecondsToTime(
                          auctionDetails?.auctionEndDateTime,
                        )}` ?? '-'
                      }
                      reducedFontSizeStyle={{ fontSize: 8, fontWeight: '400' }}
                    />
                  </View>
                  <View
                    style={[
                      common_styles.chit_container_row2_inner_container_last,
                      styles.width33,
                    ]}
                  >
                    <NameTitle title="Auction num" />
                    <InfoText
                      content={auctionDetails?.auctionNo ?? '--'}
                      isBold={true}
                    />
                  </View>
                </View>

                <View
                  style={[
                    common_styles.chit_container_row2,
                    styles.paddingLeft_10,
                    styles.borderBottom_1,
                  ]}
                >
                  <View style={styles.width33}>
                    <NameTitle title="Last auction bid" />
                    <InfoText
                      content={
                        formatCurrency(
                          auctionDetails?.lastBidValue,
                        ) ?? '--'
                      }
                      isCurrency={true}
                    />
                  </View>
                  <View style={styles.width33}>
                    <NameTitle title="Current bid" />
                    <InfoText
                      content={
                        formatCurrency(
                          auctionDetails?.currentBidValue,
                        ) ?? '--'
                      }
                      isCurrency={true}
                      colorStyle={styles.orangeText}
                      isBold={true}
                    />
                  </View>
                  <View
                    style={[
                      common_styles.chit_container_row2_inner_container_last,
                      styles.width33,
                    ]}
                  >
                    <NameTitle title="Prize amount" />
                    <InfoText
                      content={
                        formatCurrency(
                          auctionDetails?.prizedAmount,
                        ) ?? '--'
                      }
                      isCurrency={true}
                      isBold={true}
                    />
                  </View>
                </View>

                <View
                  style={[
                    common_styles.chit_container_row2,
                    styles.borderBottom_1,
                    styles.paddingLeft_10,
                  ]}
                >
                  <View style={styles.width33}>
                    <NameTitle title="Min bid" />
                    <InfoText
                      content={formatCurrency(
                        (finalChitsData?.chitValue / 100) *
                        auctionDetails?.minimumBid,
                      )}
                      isCurrency={true}
                      reducedFontText={`(${auctionDetails?.minimumBid ?? '40'
                        }%)`}
                      reducedFontSizeStyle={{ fontSize: 8 }}
                    />
                  </View>
                  <View style={styles.width33}>
                    <NameTitle title="Max bid" />
                    <InfoText
                      content={formatCurrency(
                        (finalChitsData?.chitValue / 100) *
                        auctionDetails?.maximumBid,
                      )}
                      isCurrency={true}
                      reducedFontText={`(${auctionDetails?.maximumBid ?? '10'
                        }%)`}
                      reducedFontSizeStyle={{ fontSize: 8 }}
                    />
                  </View>
                  <View
                    style={[
                      common_styles.chit_container_row2_inner_container_last,
                      styles.width33,
                    ]}
                  >
                    <NameTitle title="Avg rate of int" />
                    <InfoText
                      content={
                        finalChitsData?.rateOfInterestPerMonth
                          ? finalChitsData?.rateOfInterestPerMonth?.toFixed(2)
                          : '--'
                      }
                      reducedFontText={'%'}
                      reducedFontSizeStyle={{ fontSize: 8 }}
                    />
                  </View>
                </View>

                <View style={styles.bidNowContainer}>
                  <>
                    <Pressable
                      style={[
                        styles.historyTextContainer,
                        styles.historyborder,
                      ]}
                      onPress={() =>
                        navigateToParentScreen('MyChitHistory', {
                          chitId: finalChitsData?.chitId ?? '',
                        })
                      }
                    >
                      <Text style={styles.historyText}>History</Text>
                    </Pressable>
                  </>
                  <>
                    <TouchableOpacity
                      style={[
                        common_styles.new_chits_primary_button_container_two,
                        (finalChitsData?.isliveAuction === false ||
                          finalChitsData?.ticketStatus === 'PS' ||
                          finalChitsData?.ticketStatus === 'SB' ||
                          (finalChitsData?.isliveAuction === true &&
                            finalChitsData?.auctionEligibiltyType ===
                            'NOTELIGIBLE')) && styles.disabledButton,
                      ]}
                      onPress={() => {
                        manageBidNow();
                      }}
                      disabled={
                        finalChitsData?.ticketStatus === 'PS' ||
                        finalChitsData?.isliveAuction === false ||
                        (finalChitsData?.isliveAuction === true &&
                          finalChitsData?.auctionEligibiltyType ===
                          'NOTELIGIBLE')
                      }
                    >
                      <Text
                        style={
                          common_styles.new_chits_primary_button_text
                        }
                      >
                        Bid now
                      </Text>
                    </TouchableOpacity>
                    {showBottomSheet && (
                      <BottomPopUp
                        data={bottomSheetData}
                        onClose={() => {
                          setShowBottomSheet(false);
                        }}
                        onSubmit={() => {
                          setShowBottomSheet(false);
                        }}
                      />
                    )}
                  </>
                </View>
              </View>

              {/* Successful bid info */}
              {finalChitsData?.ticketStatus === 'SB' &&
                finalChitsData?.successfulBidInformationDto && (
                  <View
                    style={[
                      common_styles.chit_container,
                      styles.paddingLeft_0,
                      common_styles.shadowProp,
                    ]}
                  >
                    <View
                      style={[
                        common_styles.chit_container_row1,
                        styles.paddingLeft_10,
                        styles.paddingBottom_10,
                        styles.borderBottom_1,
                      ]}
                    >
                      <Text style={styles.chit_details_title}>
                        Successful bid information
                      </Text>
                      <AuctionMyChitDetailsSVG
                        width={25}
                        height={25}
                        style={{ marginRight: 10 }}
                      />
                    </View>

                    <View
                      style={[
                        common_styles.chit_container_row2,
                        styles.borderBottom_1,
                        styles.paddingLeft_10,
                      ]}
                    >
                      <View style={styles.width33}>
                        <NameTitle title="Auction date" />
                        <InfoText
                          isBold={true}
                          content={
                            finalChitsData?.successfulBidInformationDto
                              ?.auctionedDateTime
                              ? convertISOStringToDateMonthYear(
                                finalChitsData?.successfulBidInformationDto
                                  ?.auctionedDateTime,
                              )
                              : '--'
                          }
                        />
                      </View>
                      <View
                        style={[
                          common_styles.chit_container_row2_inner_container_last,
                          styles.width33,
                        ]}
                      >
                        <NameTitle title="Auction time" />
                        <InfoText
                          isBold={true}
                          content={
                            finalChitsData?.successfulBidInformationDto
                              ?.auctionedDateTime
                              ? ConvertToTime(
                                finalChitsData
                                  ?.successfulBidInformationDto
                                  ?.auctionedDateTime,
                              )
                              : '--'
                          }
                        />
                      </View>
                      <View
                        style={[
                          common_styles.chit_container_row2_inner_container_last,
                          styles.width33,
                        ]}
                      >
                        <NameTitle title="Auction num" />
                        <InfoText
                          isBold={true}
                          content={
                            finalChitsData?.successfulBidInformationDto
                              ?.auctionNumber ?? '--'
                          }
                        />
                      </View>
                    </View>

                    <View
                      style={[
                        common_styles.chit_container_row2,
                        styles.borderBottom_1,
                        styles.paddingLeft_10,
                      ]}
                    >
                      <View style={styles.width33}>
                        <NameTitle title="Bid amount" />
                        <InfoText
                          isBold={true}
                          isCurrency={true}
                          content={
                            formatCurrency(
                              finalChitsData
                                ?.successfulBidInformationDto?.bidAmount,
                            ) ?? '--'
                          }
                        />
                      </View>
                      <View style={styles.width33}>
                        <NameTitle title="Prized amount" />
                        <InfoText
                          isBold={true}
                          isCurrency={true}
                          content={
                            formatCurrency(
                              finalChitsData
                                ?.successfulBidInformationDto?.prizedAmount,
                            ) ?? '--'
                          }
                        />
                      </View>
                      <View
                        style={[
                          common_styles.chit_container_row2_inner_container_last,
                          styles.width33,
                        ]}
                      >
                        <NameTitle title="Status" />
                        <InfoText
                          isBold={true}
                          content={
                            finalChitsData?.successfulBidInformationDto
                              ?.status ?? '--'
                          }
                        />
                      </View>
                    </View>
                    {!finalChitsData?.bidCancelledApplied && (
                      <Pressable
                        onPress={() => {
                          const bid =
                            finalChitsData?.successfulBidInformationDto || {};
                          const normalized = {
                            auctionLiveId:
                              bid.liveAuctionId || bid.auctionLiveId || '',
                            chitId: finalChitsData?.chitId ?? '',
                            groupName: finalChitsData?.groupName ?? '',
                            chitGroupName: finalChitsData?.chitGroupName ?? '',
                            ticketId: finalChitsData?.ticketId ?? '',
                            chitValue:
                              Number(finalChitsData?.chitValue) || 0,
                            maxBid: Number(finalChitsData?.maxBid) || 0,
                            auctionMode: (
                              finalChitsData?.bidType || 'OPEN'
                            ).toUpperCase(),
                            subscriptionId:
                              finalChitsData?.subscriptionId ?? '',
                            isforeman: false,
                            ticketStatus:
                              bid.status ||
                              finalChitsData?.ticketStatus ||
                              'PENDING',
                            ticketNumber: finalChitsData?.ticketNumber ?? '',
                            schemeId: finalChitsData?.schemeId ?? '',
                            refAuctionNumber: bid.auctionNumber ?? '',
                            lastBidValue: bid.bidAmount ?? 0,
                            prizedAmount: bid.prizedAmount ?? 0,
                          };

                          navigateToParentScreen('AuctionDetails', {
                            data: normalized,
                            isMyBidDetails: true,
                          });
                        }}
                      >
                        <View style={styles.paymentDetailsContainer}>
                          <View>
                            <Text
                              style={[
                                common_styles.fontsize14,
                                styles.bold,
                              ]}
                            >
                              Congratulations you have won the auction{'  '}
                              <Text
                                style={[
                                  common_styles.fontsize14,
                                  styles.underline,
                                ]}
                              >
                                View bid
                              </Text>
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    )}
                    {finalChitsData?.bidCancelledApplied && (
                      <View style={styles.bidCancelAppliedContainer}>
                        <View>
                          <Text style={styles.bidCancelAppliedOnText}>
                            Bid cancel applied on{' '}
                            {finalChitsData?.bidCancelledAppliedDate
                              ? convertISOStringToDateMonthYear(
                                finalChitsData?.bidCancelledAppliedDate,
                              )
                              : '--'}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.bidNowContainer}>
                      <>
                        <Pressable
                          style={[
                            styles.historyTextContainer,
                            finalChitsData &&
                              !finalChitsData?.bidCancelledApplied
                              ? styles.enabled
                              : styles.disabled,
                          ]}
                          onPress={() => {
                            if (
                              finalChitsData &&
                              !finalChitsData?.bidCancelledApplied
                            ) {
                              cancelBid();
                            }
                          }}
                          disabled={
                            !finalChitsData ||
                            finalChitsData?.bidCancelledApplied
                          }
                        >
                          <Text
                            style={[
                              styles.historyText,
                              styles.underline,
                            ]}
                          >
                            {finalChitsData &&
                              !finalChitsData?.bidCancelledApplied
                              ? 'Cancel bid'
                              : 'Bid cancel applied'}
                          </Text>
                        </Pressable>
                      </>
                      <>
                        <Pressable
                          style={[
                            common_styles
                              .new_chits_primary_button_container_two,
                            finalChitsData &&
                              !finalChitsData?.bidCancelledApplied
                              ? ''
                              : styles.disabledButton,
                          ]}
                          disabled={
                            !finalChitsData ||
                            finalChitsData?.bidCancelledApplied
                          }
                        >
                          <Text
                            style={
                              common_styles.new_chits_primary_button_text
                            }
                          >
                            Update surity
                          </Text>
                        </Pressable>
                      </>
                    </View>
                  </View>
                )}

              {/* Prized subscriber info */}
              {finalChitsData?.ticketStatus === 'PS' &&
                finalChitsData?.payableRequestList && (
                  <View
                    style={[
                      common_styles.chit_container,
                      styles.paddingLeft_0,
                      common_styles.shadowProp,
                    ]}
                  >
                    <View
                      style={[
                        styles.chit_container_row1_left_certificates,
                        styles.paddingLeft_10,
                        styles.paddingBottom_10,
                        styles.borderBottom_1,
                      ]}
                    >
                      <Text style={styles.chit_details_title}>
                        Successful Bidder Payment Information
                      </Text>
                      <AuctionMyChitDetailsSVG
                        width={25}
                        height={25}
                        style={{ marginRight: 10 }}
                      />
                    </View>

                    <AuctionDetails finalChitsData={finalChitsData} />

                    <Pressable
                      onPress={() =>
                        navigateToParentScreen('MyChitPaymentDetails', {
                          paymentDetails:
                            finalChitsData?.payableRequestList &&
                            finalChitsData?.payableRequestList[0],
                        })
                      }
                    >
                      <View style={styles.paymentDetailsContainer}>
                        <View>
                          <Text style={common_styles.fontsize16}>
                            Payment details
                          </Text>
                        </View>
                        <View>
                          <IconFive
                            name="angle-right"
                            size={24}
                            color={CssColors.primaryColor}
                            style={common_styles.margin_right_10}
                          />
                        </View>
                      </View>
                    </Pressable>
                  </View>
                )}

              {/* Account copy */}
              <Pressable
                onPress={() =>
                  navigateToParentScreen('AccountCopyDetailsView', {
                    memberId,
                    memberAccountId,
                    chitGroupName,
                    ticketNumber,
                    chitGroupNameTicket,
                    ticketStatus: finalChitsData?.ticketStatus,
                  })
                }
              >
                <View
                  style={[
                    common_styles.mychit_acc_copy_container,
                    common_styles.shadowProp,
                  ]}
                >
                  <View>
                    <Text style={common_styles.fontsize16}>
                      Account copy
                    </Text>
                    <Text style={common_styles.fontsize12}>
                      View breakdown of each Installments
                    </Text>
                  </View>
                  <View>
                    <IconFive
                      name="angle-right"
                      size={24}
                      color={CssColors.primaryColor}
                      style={common_styles.margin_right_10}
                    />
                  </View>
                </View>
              </Pressable>

              {/* Certificates */}
              {(finalChitsData.agreementPath ||
                finalChitsData?.fdDocPath ||
                finalChitsData?.psoCertLocation ||
                finalChitsData?.ccCertLocation) && (
                  <View
                    style={[
                      common_styles.chit_container,
                      styles.paddingLeft_0,
                      common_styles.shadowProp,
                    ]}
                  >
                    <View
                      style={[
                        styles.chit_container_row1_left_certificates,
                        styles.paddingLeft_10,
                        styles.paddingBottom_8,
                        styles.borderBottom_1,
                      ]}
                    >
                      <Text style={styles.chit_details_title}>
                        Certificates
                      </Text>
                      <CertificateIconSVG
                        width={24}
                        height={24}
                        style={{ marginRight: 10 }}
                      />
                    </View>
                    <View
                      style={[
                        common_styles.chit_container_row2,
                        styles.paddingLeft_10,
                        styles.justifyContent_spaceEvenly,
                      ]}
                    >
                      {finalChitsData.agreementPath && (
                        <React.Fragment key={4}>
                          <View
                            style={[
                              styles.alignItems_center,
                              styles.rowContainer,
                              styles.certificateItem,
                            ]}
                          >
                            <TouchableOpacity
                              onPress={() => certificateClicked('004')}
                            >
                              <PDFIconTwoSVG
                                width={24}
                                height={24}
                                style={[
                                  common_styles
                                    .new_chits_details_certificate_pdf_icon,
                                  styles.marginBottom_3,
                                ]}
                              />
                              <Text
                                style={[
                                  styles.new_chits_details_certificate_text,
                                ]}
                              >
                                Agreement
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </React.Fragment>
                      )}
                      {finalChitsData?.fdDocPath && (
                        <React.Fragment key={1}>
                          <View
                            style={[
                              styles.alignItems_center,
                              styles.rowContainer,
                              styles.certificateItem,
                            ]}
                          >
                            <TouchableOpacity
                              onPress={() => certificateClicked('001')}
                            >
                              <PDFIconTwoSVG
                                width={24}
                                height={24}
                                style={[
                                  common_styles
                                    .new_chits_details_certificate_pdf_icon,
                                  styles.marginBottom_3,
                                ]}
                              />
                              <Text
                                style={[
                                  styles.new_chits_details_certificate_text,
                                ]}
                              >
                                F.D.R
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </React.Fragment>
                      )}
                      {finalChitsData?.psoCertLocation && (
                        <React.Fragment key={2}>
                          <View
                            style={[
                              styles.alignItems_center,
                              styles.rowContainer,
                              styles.certificateItem,
                            ]}
                          >
                            <TouchableOpacity
                              onPress={() => certificateClicked('002')}
                            >
                              <PDFIconTwoSVG
                                width={24}
                                height={24}
                                style={[
                                  common_styles
                                    .new_chits_details_certificate_pdf_icon,
                                  styles.marginBottom_3,
                                ]}
                              />
                              <Text
                                style={[
                                  styles.new_chits_details_certificate_text,
                                ]}
                              >
                                P.S.O
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </React.Fragment>
                      )}
                      {finalChitsData?.ccCertLocation && (
                        <React.Fragment key={3}>
                          <View
                            style={[
                              styles.alignItems_center,
                              styles.rowContainer,
                              styles.certificateItem,
                            ]}
                          >
                            <TouchableOpacity
                              onPress={() => certificateClicked('003')}
                            >
                              <PDFIconTwoSVG
                                width={24}
                                height={24}
                                style={[
                                  common_styles
                                    .new_chits_details_certificate_pdf_icon,
                                  styles.marginBottom_3,
                                ]}
                              />
                              <Text
                                style={[
                                  styles.new_chits_details_certificate_text,
                                ]}
                              >
                                C.C
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </React.Fragment>
                      )}
                    </View>
                  </View>
                )}
            </ScrollView>
          </KeyboardAvoidingView>

          {disableSubscribe && <MinAmountView />}

          {/* Footer hidden when proceed-to-pay is open */}
          {!isVisible && (
            <View
              style={[
                common_styles.fixed_footer_one_container,
                keyboardHeight > 0 && {
                  bottom:
                    Platform.OS === 'ios'
                      ? Math.max(
                        0,
                        (keyboardHeight || 0) - insets.bottom,
                      )
                      : keyboardHeight,
                },
              ]}
            >
              <View
                style={common_styles.fixed_footer_one_container_inner}
              >
                <View
                  style={
                    common_styles.new_chit_fixed_footer_input_container
                  }
                >
                  <Text
                    style={
                      common_styles.new_chit_fixed_footer_input_prefix
                    }
                  >
                    ₹
                  </Text>
                  <TextInput
                    style={common_styles.new_chit_fixed_footer_input}
                    keyboardType="number-pad"
                    underlineColorAndroid="transparent"
                    ref={footerInputRef}
                    onChangeText={updateAmount}
                    value={dueAmount}
                  />
                </View>
                <Text style={common_styles.text_type_5}>My due</Text>
              </View>

              <View
                style={common_styles.fixed_footer_one_container_inner}
              >
                <TouchableOpacity
                  onPress={() => {
                    footerInputRef.current?.blur();
                    setIsVisible(true);
                  }}
                  disabled={
                    disableSubscribe || disableSubscribeNow || isVisible
                  }
                  style={[
                    common_styles.button_two,
                    (disableSubscribe ||
                      disableSubscribeNow ||
                      isVisible) &&
                    common_styles.button_two_disabled,
                  ]}
                >
                  <Text
                    style={[
                      common_styles.button_two_text,
                      (disableSubscribe ||
                        disableSubscribeNow ||
                        isVisible) &&
                      common_styles.button_two_text_disabled,
                    ]}
                  >
                    Pay now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Agreement bottomsheet */}
          {agreementSheet && (
            <DefaultBottomSheet
              visible={agreementSheet}
              onClose={() => setAgreementSheet(false)}
              height="auto"
            >
              <View style={{ backgroundColor: 'white', padding: 20 }}>
                <RoundBtn />
                <Text style={styles.complete_chit_popup_title}>
                  {isEnrollmentChecked
                    ? SiteTexts.chit_enrollment_pop_up_title
                    : SiteTexts.chit_agreement_pop_up_title}
                </Text>
                <Text style={styles.complete_chit_popup_sub_title}>
                  {isEnrollmentChecked
                    ? SiteTexts.chit_enrollment_pop_up_text_one
                    : SiteTexts.chit_agreement_pop_up_text_one}
                </Text>
                <Text
                  style={[
                    styles.complete_chit_popup_sub_title,
                    styles.marginBottom20,
                  ]}
                >
                  {isEnrollmentChecked
                    ? SiteTexts.chit_enrollment_pop_up_text_two
                    : SiteTexts.chit_agreement_pop_up_text_two}
                </Text>
                <Pressable
                  onPress={() => continueToChit()}
                  style={[
                    common_styles.button_three,
                    common_styles.marginTop20,
                    styles.marginBottom20,
                  ]}
                >
                  <Text style={common_styles.button_three_text}>
                    {SiteTexts.continue_text}
                  </Text>
                </Pressable>
              </View>
            </DefaultBottomSheet>
          )}

          {/* Payment Cycle bottomsheet */}
          {showPaymentCycle && (
            <DefaultBottomSheet
              visible={showPaymentCycle}
              onClose={() => setShowPaymentCycle(false)}
              height="auto"
            >
              <ScrollView>
                <View style={{ backgroundColor: 'white', padding: 20 }}>
                  <View
                    style={[
                      styles.paymentCycleInnerContainer,
                      finalChitsData?.collectionCycle === 'Daily'
                        ? styles.paymentCycleInnerContainerActive
                        : '',
                    ]}
                  >
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'baseline',
                          paddingBottom: 5,
                        }}
                      >
                        <Text style={styles.priceCycleamountText}>
                          {'\u20B9'} {dailyAmount}{' '}
                        </Text>
                        <Text style={styles.priceCycleamountType}>
                          Daily
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.priceCycleamountSubText}>
                          Daily Installment{' '}
                        </Text>
                        <Text
                          style={styles.priceCycleamountSubTextBold}
                        >
                          {'\u20B9'} {dailyAmount}/30days
                        </Text>
                      </View>
                    </View>
                    <View>
                      <IconThree
                        onPress={() => selectPriceType('Daily')}
                        name={
                          finalChitsData?.collectionCycle === 'Daily'
                            ? 'ios-radio-button-on'
                            : 'ios-radio-button-off'
                        }
                        size={30}
                        style={styles.radioButton}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.paymentCycleInnerContainer,
                      finalChitsData?.collectionInformation
                        ?.collectionCycle === 'Weekly'
                        ? styles.paymentCycleInnerContainerActive
                        : '',
                    ]}
                  >
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'baseline',
                          paddingBottom: 5,
                        }}
                      >
                        <Text style={styles.priceCycleamountText}>
                          {'\u20B9'} {weeklyAmount}{' '}
                        </Text>
                        <Text style={styles.priceCycleamountType}>
                          Weekly
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.priceCycleamountSubText}>
                          Weekly Installment{' '}
                        </Text>
                        <Text
                          style={styles.priceCycleamountSubTextBold}
                        >
                          {'\u20B9'} {weeklyAmount}/4weeks
                        </Text>
                      </View>
                    </View>
                    <View>
                      <IconThree
                        onPress={() => selectPriceType('Weekly')}
                        name={
                          finalChitsData?.collectionCycle === 'Weekly'
                            ? 'ios-radio-button-on'
                            : 'ios-radio-button-off'
                        }
                        size={30}
                        style={styles.radioButton}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.paymentCycleInnerContainer,
                      finalChitsData?.collectionInformation
                        ?.collectionCycle === 'Monthly'
                        ? styles.paymentCycleInnerContainerActive
                        : '',
                    ]}
                  >
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'baseline',
                          paddingBottom: 5,
                        }}
                      >
                        <Text style={styles.priceCycleamountText}>
                          {'\u20B9'} {monthlyAmount}{' '}
                        </Text>
                        <Text style={styles.priceCycleamountType}>
                          Monthly
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.priceCycleamountSubText}>
                          Monthly Installment{' '}
                        </Text>
                        <Text
                          style={styles.priceCycleamountSubTextBold}
                        >
                          {'\u20B9'} {monthlyAmount}/1Month
                        </Text>
                      </View>
                    </View>
                    <View>
                      <IconThree
                        onPress={() => selectPriceType('Monthly')}
                        name={
                          finalChitsData?.collectionCycle === 'Monthly'
                            ? 'ios-radio-button-on'
                            : 'ios-radio-button-off'
                        }
                        size={30}
                        style={styles.radioButton}
                      />
                    </View>
                  </View>

                  <View style={[styles.paymentCycleInnerContainerLast]}>
                    <View>
                      <IconFour
                        name={'check-box-outline-blank'}
                        size={30}
                        style={styles.radioButton}
                      />
                    </View>
                    <View style={{ paddingLeft: 10 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'baseline',
                          paddingBottom: 5,
                        }}
                      >
                        <Text style={styles.priceCycleamountType}>
                          NACH payment
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.priceCycleamountSubText}>
                          Enable monthly auto payment mode
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => changePaymentCycle()}
                    style={[
                      common_styles.button_three,
                      common_styles.marginTop20,
                      styles.marginBottom20,
                    ]}
                  >
                    <Text style={common_styles.button_three_text}>
                      Change payment cycle
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </DefaultBottomSheet>
          )}

          {/* Pledged chit bottomsheet */}
          {pledgedChit && (
            <DefaultBottomSheet
              visible={pledgedChit}
              onClose={() => setPledgedChit(false)}
              height="auto"
            >
              <View style={{ paddingBottom: 15 }}>
                <View style={common_styles.pledged_chit_container}>
                  <View style={common_styles.pledged_chit_icon_container}>
                    <PledgedChitSvg />
                  </View>
                  <Text
                    style={[
                      common_styles.bottomsheet_title1_secondary,
                      common_styles.padding_bottom_16,
                      {
                        fontSize: 22,
                      },
                    ]}
                  >
                    Chit is pledged
                  </Text>
                  <Text
                    style={[
                      common_styles.newChits_tags_text,
                      common_styles.padding_bottom_16,
                      { textAlign: 'center' },
                    ]}
                  >
                    {`Your Chit is pledged. For more information ${'\n'} contact customer care`}
                    <Text
                      style={[
                        common_styles.newChits_tags_text,
                        common_styles.padding_bottom_4,
                        { textDecorationLine: 'underline' },
                      ]}
                      onPress={() => {
                        Linking.openURL(`tel:${18004190157}`);
                      }}
                    >
                      1-800-419-0157
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPledgedChit(!pledgedChit)}
                  disabled={enableProceedToPay}
                  style={[
                    common_styles.button_three,
                    enableProceedToPay &&
                    common_styles.button_two_disabled,
                  ]}
                >
                  <Text
                    style={[
                      common_styles.button_three_text,
                      enableProceedToPay &&
                      common_styles.button_three_text_disabled,
                    ]}
                  >
                    {SiteTexts.done_text}
                  </Text>
                </TouchableOpacity>
              </View>
            </DefaultBottomSheet>
          )}

          {showCancelBid && (
            <BidCancelPopUp
              isVisible={showCancelBid}
              showError={showInvalidOTP}
              showExpiredError={showExpiredError}
              setIsVisible={setShowCancelBid}
              onSubmit={handleSubmitOTP}
              phoneNumber={userNumber}
              countdown={otpCountdown}
              onResend={handleResendOtpCode}
            />
          )}

          {infoSheetVisible && (
            <BidCancelInfoSheet
              bidCancelInfoData={bidCancelInfoData}
              isVisible={infoSheetVisible}
              setIsVisible={setInfoSheetVisible}
              onConfirmCancelBid={handleSubmitCancelBid}
            />
          )}

          {/* Payment bottomsheet */}
          <DefaultBottomSheet
            visible={isVisible}
            onClose={() => setIsVisible(false)}
            height="auto"
          >
            <ScrollView
              keyboardShouldPersistTaps={Platform.OS === 'ios' ? 'handled' : 'never'}
              contentContainerStyle={{
                paddingBottom:
                  Platform.OS === 'ios'
                    ? keyboardHeight > 0
                      ? keyboardHeight
                      : 20
                    : 5,
              }}
            >
              <View style={{ paddingBottom: 5 }}>
                <View
                  style={[
                    common_styles.chit_container_row1,
                    { marginBottom: 15 },
                  ]}
                >
                  <View style={common_styles.chit_container_row1_left}>
                    <ChitIconDisplay
                      chitValue={finalChitsData?.chitValue ?? '--'}
                      imageStyle={
                        common_styles.new_chits_logo_icon
                      }
                    />
                    <View style={{ flexDirection: 'column' }}>
                      <Text
                        style={[
                          common_styles.bottomsheet_title1,
                          common_styles.padding_bottom_4,
                        ]}
                      >
                        {finalChitsData?.chitGroupName}
                      </Text>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={common_styles.bottomsheet_title2}>
                          {'\u20B9'} {finalChitsData?.chitValue ?? '-'}{' '}
                          Chit
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View>
                    <Text style={common_styles.bottomsheet_title2}>
                      {formatDateToToday(today)}
                    </Text>
                  </View>
                </View>

                <View>
                  <View>
                    <Text style={common_styles.bottomsheet_text3}>
                      Net payable
                    </Text>
                    <View
                      style={[
                        common_styles
                          .new_chit_fixed_footer_input_container,
                        { width: '100%' },
                      ]}
                    >
                      <Text
                        style={
                          common_styles
                            .new_chit_fixed_footer_input_prefix
                        }
                      >
                        {'\u20B9'}
                      </Text>
                      <TextInput
                        style={common_styles.new_chit_fixed_footer_input}
                        value={dueAmount}
                        keyboardType="number-pad"
                        underlineColorAndroid="transparent"
                        onChangeText={value => updateAmount(value)}
                      />
                    </View>
                    <View style={common_styles.bottomsheet_checkbox1}>
                      <CustomCheckBox
                        style={{ width: 20, height: 20 }}
                        value={isChecked}
                        onValueChange={value => termsChecked(value)}
                        boxType="square"
                      />
                      <Text
                        style={[
                          common_styles.bottomsheet_text1,
                          { marginLeft: 10 },
                        ]}
                      >
                        By clicking proceed to pay you agree terms &
                        Conditions&nbsp;
                        <TouchableOpacity
                          onPress={() => {
                            setIsVisible(false);
                            setPolicyModalVisible(true);
                          }}
                        >
                          <Text style={common_styles.read_more}>
                            Read more
                          </Text>
                        </TouchableOpacity>
                      </Text>
                    </View>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={() => initiateOrder()}
                      disabled={
                        enableProceedToPay || disableSubscribeNow
                      }
                      style={[
                        common_styles.button_three,
                        (enableProceedToPay || disableSubscribeNow) &&
                        common_styles.button_two_disabled,
                      ]}
                    >
                      <Text
                        style={[
                          common_styles.button_three_text,
                          enableProceedToPay &&
                          common_styles.button_three_text_disabled,
                        ]}
                      >
                        {SiteTexts.text_proceed_to_pay}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={[
                      common_styles.bottomsheet_text2,
                      common_styles.padding_top_10,
                      { margin: 10 },
                    ]}
                  >
                    My due
                  </Text>
                </View>
              </View>
            </ScrollView>
          </DefaultBottomSheet>

          <PolicyModal
            visible={policyModalVisible}
            onClose={() => {
              setPolicyModalVisible(false);
              setIsVisible(true);
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bidCancelAppliedOnText: {
    color: CssColors.black,
    fontsize12: 12,
  },
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: '100%',
  },
  enabled: {
    opacity: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledButton: {
    backgroundColor: CssColors.lightGrey,
  },
  auctionDetailsParent: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  leftContainerAuction: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexBasis: '30%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainerAuction: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flexBasis: '70%',
    flexDirection: 'row',
  },
  bidNowContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 20,
    marginRight: 10,
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  paymentDetailsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    borderColor: '#34C85A',
    backgroundColor: '#EAF9EE',
    borderWidth: 1,
    borderRadius: 6,
    margin: 10,
  },
  bidCancelAppliedContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    borderColor: CssColors.textColorSecondary,
    backgroundColor: '#ffeae2',
    borderWidth: 1,
    borderRadius: 6,
    margin: 10,
  },
  historyTextContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 0,
  },
  historyborder: {
    borderColor: CssColors.primaryColor,
    borderWidth: 1,
  },
  underline: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  bold: {
    fontWeight: 'bold',
  },
  historyText: {
    color: CssColors.primaryColor,
    fontSize: 12,
  },
  strikeoutText: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  chit_details_container_row2_inner_header: {
    fontSize: 12,
    lineHeight: 12,
  },
  fontsize_14: {
    fontSize: 14,
  },
  fontsize_8: {
    fontSize: 8,
  },
  paddingLeft_0: {
    paddingLeft: 0,
  },
  paddingLeft_10: {
    paddingLeft: 10,
  },
  greenText: {
    color: CssColors.green,
  },
  greyText: {
    color: CssColors.primaryBorder,
  },
  primaryColorText: {
    color: CssColors.textColorSecondary,
  },
  borderBottom_1: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  borderBottom_2: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  paddingBottom_10: {
    paddingBottom: 10,
  },
  paddingBottom_8: {
    paddingBottom: 8,
  },
  chit_details_title: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  paddingTop_20: { paddingTop: 20 },
  justifyContent_spaceEvenly: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  certificateItem: {
    width: '25%',
    marginBottom: 10,
  },
  alignItems_center: { alignItems: 'center' },
  marginBottom_3: { marginBottom: 3 },
  new_chits_details_certificate_text: {
    color: CssColors.primaryColor,
    fontSize: 12,
    lineHeight: 16,
    textDecorationColor: CssColors.primaryColor,
    textDecorationLine: 'underline',
  },
  paymentCycleText: {
    fontSize: 12,
    fontWeight: '600',
    color: CssColors.monthlyCycle,
  },
  editIcon: { paddingTop: 6, paddingLeft: 2 },
  relationshipContainer: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: CssColors.lightGreyFive,
    borderRadius: 4,
    padding: 5,
    marginTop: 0,
  },
  relationshipText: { color: '#222B45', fontSize: 10 },
  relationshipIcon: {
    paddingLeft: 5,
    paddingRight: 5,
    position: 'relative',
    top: 3,
    color: '#222B45',
  },
  fontWeight600: { fontWeight: '600' },
  paddingTop20: { paddingTop: 20 },
  cancelBidText: {
    fontSize: 10,
    color: CssColors.errorTextColor,
    marginLeft: 10,
    textDecorationColor: CssColors.errorTextColor,
    textDecorationLine: 'underline',
  },
  marginRight10: {
    marginRight: 10,
  },
  whitetextWithUnderline: {
    fontSize: 12,
    color: CssColors.white,
    textDecorationColor: CssColors.white,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  notificationbar: {
    backgroundColor: CssColors.errorTextColor,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
  },
  marginBottom20: {
    marginBottom: 20,
  },
  roundBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    alignSelf: 'center',
    color: CssColors.textColorSecondary,
  },
  roundshape: {
    backgroundColor: '#004C8F1A',
    height: 120,
    width: 120,
    justifyContent: 'center',
    borderRadius: 60,
  },
  complete_chit_popup_title: {
    color: CssColors.primaryColor,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  complete_chit_popup_sub_title: {
    textAlign: 'center',
    color: CssColors.primaryColor,
    fontSize: 14,
  },
  paymentCycleTitle: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 22,
    fontWeight: '600',
  },
  paymentCycleInnerContainer: {
    minHeight: 90,
    marginBottom: 10,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderColor: '#8F9BB3',
    borderWidth: 1,
    borderRadius: 12,
  },
  paymentCycleInnerContainerLast: {
    minHeight: 90,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  paymentCycleInnerContainerActive: {
    backgroundColor: '#eaf9ee',
    borderColor: '#34C85A',
    borderWidth: 1,
  },
  radioButton: {
    color: CssColors.primaryColor,
  },
  orangeText: {
    color: CssColors.textColorSecondary,
  },
  priceCycleamountText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 22,
    fontWeight: '600',
  },
  priceCycleamountType: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 14,
  },
  priceCycleamountSubText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 10,
  },
  priceCycleamountSubTextBold: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 10,
    fontWeight: '600',
  },
  timer: {
    textAlign: 'center',
    color: CssColors.textColorSecondary,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: CssColors.textColorSecondary,
    borderRadius: 4,
    fontSize: 10,
  },
  width33: {
    width: '33.33%',
  },
  chit_container_row1_left_certificates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default MyChitDetails;
