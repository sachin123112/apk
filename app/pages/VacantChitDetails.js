import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import common_styles from '../css/common_styles';
import { CssColors } from '../css/css_colors';
import { SiteConstants } from '../SiteConstants';
import { Slider } from '@miblanchard/react-native-slider';
import CommonService from '../services/CommonService';
import DefaultBottomSheet from '../components/DefaultBottomSheet';
import CustomCheckBox from '../components/CustomCheckbox';
import {
  storeObjectData,
  getStringData,
  getObjectData,
} from '../sharedComp/AsyncData';
import {
  certificateData,
  convertMillisecondsToDate,
  convertMillisecondsToTime,
  formatDateToToday,
  formatCurrency,
  formatIndianNumber,
} from '../sharedComp/Utils';
import AuctionMyChitDetailsSVG from './svgs/AuctionMyChitDetailsSVG';
import CertificateIconSVG from './svgs/CertificateIconSVG';
import PDFIconSVG from './svgs/PDFIconTwoSVG';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import { SiteTexts } from '../texts/SiteTexts';
import ChitIconDisplay from '../sharedComp/ChitIconDisplay';
import dayjs from 'dayjs';
import InfoText from '../sharedComp/InfoText';
import NameTitle from '../sharedComp/NameTitle';
import PolicyModal from '../sharedComp/PolicyModal';
import KeyboardAwareFooter from '../sharedComp/KeyboardAwareFooter';
import SkeletonLoader from '../components/loaders/SkeletonLoader';
import useNavigationGuard from '../hooks/useNavigationGuard';
import CrashlyticsService from '../services/Crashlytics';
import { verifyCashfreePayment } from '../utils/PaymentHelper';

const VacantChitDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [finalChitsData, setFinalChitsData] = useState({});
  const [amount, setAmount] = useState('');
  const [minAmount, setMinAmount] = useState(10);
  const [disableSubscribe, setDisableSubscribe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enableProceedToPay, setEnableProceedToPay] = useState(false);
  const [isChecked, setChecked] = useState(true);
  const [auctionDetails, setAuctionDetails] = useState({});
  const [memberId, setMemberId] = useState('');
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [pdfData, setPdfData] = useState([]);
  const [disableSubscribenow, setDisableSubscribeNow] = useState(false);
  const footerInputRef = useRef(null);
  const today = new Date();
  const { navigateWithGuard } = useNavigationGuard(navigation);

  const isNavigatingRef = useRef(false);

  // duplicate handling guards for Cashfree callback
  const handledOrderIdsRef = useRef(new Set());
  const verifyInFlightRef = useRef(false);
  const lastVerifyAtRef = useRef(0);

  // shared keyboard height
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowListener = Keyboard.addListener(
      showEvent,
      e => {
        setKeyboardHeight(e.endCoordinates.height || 0);
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      hideEvent,
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    CrashlyticsService.log('VacantChitDetails screen mounted');
    CrashlyticsService.log(`Chit ID: ${id}`);
    CrashlyticsService.setAttribute('screen', 'VacantChitDetails');
    CrashlyticsService.setAttribute('chit_id', String(id));

    const backAction = () => {
      CrashlyticsService.log(
        'Back button pressed - VacantChitDetails',
      );
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation, id]);

  const CustomThumb = currentMonth => (
    <View style={common_styles.customThumb}>
      <View style={common_styles.customThumbTextContainer}>
        <Text style={common_styles.customThumbText}>{currentMonth}</Text>
      </View>
    </View>
  );

  const getHighestIdAuctionDateTime = (auctions, isDate = true) => {
    if (!auctions || auctions.length === 0) return '-';

    const sortedAuctions = auctions.sort(
      (a, b) => b.auctionNo - a.auctionNo,
    );
    return isDate
      ? convertMillisecondsToDate(
        sortedAuctions[0].auctionEndDateTime,
      ) ?? '-'
      : convertMillisecondsToTime(
        sortedAuctions[0].auctionEndDateTime,
      ) ?? '-';
  };

  useEffect(() => {
    setIsLoading(true);
    setIsVisible(false);

    (async () => {
      try {
        CrashlyticsService.log(
          'Fetching chit data and member ID (VacantChitDetails)',
        );

        const isMemberId = await getStringData('memberID');
        setMemberId(isMemberId);

        CrashlyticsService.log(
          `Member ID retrieved: ${isMemberId}`,
        );

        const chitsData = await CommonService.commonGet(
          navigation,
          `${SiteConstants.API_URL}chit-group/v2/getChit/${id}`,
        );

        if (chitsData !== undefined) {
          console.log(
            chitsData,
            'chitsData in VacantChitDetails page',
          );
          CrashlyticsService.log('Chit data fetched successfully');

          setFinalChitsData(chitsData);

          const certData = certificateData(
            chitsData?.chitGroupCC,
            chitsData?.chitGroupPSO,
            chitsData?.fixedDepositDTO,
          );
          setPdfData(certData);

          CrashlyticsService.log(
            `Certificate data generated - Count: ${certData?.length || 0
            }`,
          );

          updateLiveInfo(chitsData);
          setAmount(
            formatIndianNumber(
              parseFloat(chitsData.netPayable).toFixed(0),
            ),
          );
          setMinAmount(chitsData.minSubscriptionAmount);
        } else {
          CrashlyticsService.log(
            'Chit data fetch returned undefined',
          );
        }
      } catch (error) {
        console.error(
          'Error in VacantChitDetails initialization:',
          error,
        );
        CrashlyticsService.recordError(
          error,
          'vacant_chit_details_init',
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, navigation, navigateWithGuard]);

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
          Pay minimum {'\u20B9'} {formatCurrency(minAmount)} to Subscribe
        </Text>
      </View>
    );
  };

  const initiateOrder = async () => {
    setIsLoading(true);
    const cleanAmount = amount.toString().replace(/,/g, '');

    CrashlyticsService.log(
      `Initiating payment order - Amount: ${cleanAmount}`,
    );

    const finalBody = {
      chitId: id,
      orderAmount: cleanAmount,
      paymentGateway: 'cashfree',
      memberId,
      subscriptionId: null,
    };

    console.log(finalBody, 'in VacantChitDetails page');

    try {
      const data = await CommonService.commonPostOld(
        navigation,
        `${SiteConstants.API_URL}payment/v2/createOrder`,
        finalBody,
      );

      if (data !== undefined) {
        CrashlyticsService.log(
          `Payment order created - OrderID: ${data.orderId}`,
        );

        const chitDetailsStore = {
          achitId: id.toString(),
          paymentGateway: data.paymentGateway,
          CFOrderId: data.cfOrderId,
          paymentSessionId: data.paymentSessionId,
          aamount: cleanAmount,
          apaymentDate: data.paymentDate.toString(),
          memberId: data.memberId,
          subscriberId: data.subscriberId,
          ticketNumber: null,
          myChit: false,
        };

        _startCheckout(
          data.orderId,
          data.paymentSessionId,
          chitDetailsStore,
        );
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      CrashlyticsService.recordPaymentError(error, {
        gateway: 'cashfree',
        stage: 'create_order',
        amount: cleanAmount,
        chitId: String(id),
      });
      setIsLoading(false);
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
          console.log(
            '[Cashfree] onVerify triggered with orderID:',
            orderID,
          );

          const now = Date.now();
          if (now - lastVerifyAtRef.current < 4000) {
            console.log(
              '[Cashfree] onVerify ignored: debounce window',
            );
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
            console.log(
              '[Cashfree] onVerify ignored: order already handled',
            );
            return;
          }
          verifyInFlightRef.current = true;
          handledOrderIdsRef.current.add(orderID);

          setIsLoading(true);
          try {
            const result = await verifyCashfreePayment(
              navigation,
              orderID,
            );
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
              navigateToParentScreen('PaymentFail', {
                paymentOrderId: orderID,
              });
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
          console.log('[Cashfree] onError triggered:', {
            error,
            orderID,
          });

          try {
            CFPaymentGatewayService.removeCallback();
          } catch (e) { }

          if (verifyInFlightRef.current) {
            console.log(
              '[Cashfree] onError ignored: verification in flight',
            );
            return;
          }
          if (orderID && handledOrderIdsRef.current.has(orderID)) {
            console.log(
              '[Cashfree] onError ignored: order already handled',
            );
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

      const session = new CFSession(
        sessionId,
        orderId,
        CFEnvironment.SANDBOX,
      );
      console.log('[Checkout] Initiating Cashfree payment session');
      CFPaymentGatewayService.doWebPayment(session);
    } catch (e) {
      console.error(
        '[Checkout] Error in _startCheckout:',
        e?.message,
      );
      setIsLoading(false);
      setIsVisible(false);
      alert('Payment initiation failed: ' + e?.message);
    }
  };

  console.log(finalChitsData, 'finalChitsData');

  const updateAmount = value => {
    const numericValue = value
      ? parseInt(value.toString().replace(/,/g, ''), 10)
      : 0;

    if (numericValue > 1000000) {
      console.log(numericValue, 'greater');
      setDisableSubscribeNow(true);
    } else {
      setDisableSubscribeNow(false);
    }

    setAmount(formatIndianNumber(numericValue));

    if (isVisible) {
      termsChecked(isChecked, numericValue);
    }

    if (!numericValue || numericValue < minAmount) {
      setDisableSubscribe(true);
    } else {
      setDisableSubscribe(false);
    }
  };

  const termsChecked = (value, totalAmount = amount) => {
    setEnableProceedToPay(false);
    setChecked(value);
    if (value === false || totalAmount < minAmount) {
      setEnableProceedToPay(true);
    }
  };

  const certificateClicked = useCallback(
    selectedCertificateId => {
      if (isNavigatingRef.current) {
        console.log(
          'Navigation already in progress, ignoring certificate click',
        );
        CrashlyticsService.log(
          'Certificate click ignored - navigation in progress',
        );
        return;
      }

      if (!pdfData || pdfData.length === 0) {
        console.warn('Certificate data (pdfData) not ready yet');
        CrashlyticsService.log(
          'Certificate click ignored - pdfData not ready',
        );
        return;
      }

      if (!finalChitsData || !finalChitsData.chitGroupCC) {
        console.warn('Chit data (finalChitsData) not ready yet');
        CrashlyticsService.log(
          'Certificate click ignored - finalChitsData not ready',
        );
        return;
      }

      CrashlyticsService.logUserAction('certificate_clicked', {
        certificateId: String(selectedCertificateId),
        chitId: String(id),
        screen: 'VacantChitDetails',
      });

      isNavigatingRef.current = true;

      requestAnimationFrame(() => {
        try {
          navigateWithGuard('Certificates', {
            itemId: selectedCertificateId,
            certificateData: pdfData,
            chitData: finalChitsData,
            chitId: id,
            myChit: false,
            memberId,
            isVacantChit: true,
          });

          CrashlyticsService.log(
            'Navigation to Certificates initiated successfully',
          );
        } catch (error) {
          console.error('Certificate navigation error:', error);
          CrashlyticsService.recordError(
            error,
            'certificate_navigation_error',
          );
        } finally {
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 1000);
        }
      });
    },
    [navigateWithGuard, pdfData, finalChitsData, id, memberId],
  );

  const updateLiveInfo = e => {
    let flag = false;
    e.liveAuctions?.forEach(item => {
      if (item.state.toLowerCase() === 'live') {
        setAuctionDetails(item);
        flag = true;
        return;
      }
      if (!flag) {
        if (
          item.state.toLowerCase() === 'inactive' &&
          item.status.toLowerCase() === 'success'
        ) {
          setAuctionDetails(item);
          flag = true;
          return;
        }
      }
    });
  };

  const handleFixedBidNavigation = useCallback(() => {
    CrashlyticsService.log('Fixed bid navigation clicked');
    navigateWithGuard('FixedBidDetails', {
      schemeId: finalChitsData.scheme?.id ?? '',
      chitId:
        finalChitsData.chitGroupApplyFD?.chitGroupId ?? '',
    });
  }, [navigateWithGuard, finalChitsData]);

  useEffect(() => {
    return () => {
      isNavigatingRef.current = false;
      CrashlyticsService.log(
        'VacantChitDetails unmounted - navigation flag reset',
      );
    };
  }, []);

  useEffect(() => { }, [auctionDetails]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          insets.bottom > 20 ? { paddingBottom: insets.bottom } : {},
        ]}
      >
        <SkeletonLoader
          cardTypeTwo={1}
          numberOfCards={2}
          order={['typeTwo', 'default']}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        insets.bottom > 20 ? { paddingBottom: insets.bottom } : {},
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
        style={{ flex: 1 }}
      >
        <ScrollView>
          {/* Chit Details */}
          <View
            style={[
              common_styles.chit_container,
              common_styles.marginTopTen,
              styles.paddingLeft_0,
              common_styles.shadowProp,
            ]}
          >
            <View
              style={[
                styles.chit_container_row1,
                styles.paddingLeft_10,
              ]}
            >
              <View style={common_styles.chit_container_row1_left}>
                <ChitIconDisplay
                  chitValue={
                    finalChitsData.scheme?.schemeDetails?.chitValue ||
                    0
                  }
                  imageStyle={common_styles.new_chits_logo_icon}
                />
                <View
                  style={{ flexDirection: 'column', paddingTop: 5 }}
                >
                  <Text style={common_styles.new_chits_amount_text}>
                    {'\u20B9'}{' '}
                    {formatCurrency(
                      finalChitsData.scheme?.schemeDetails?.chitValue,
                    )}
                    <Text
                      style={
                        common_styles.new_chits_amount_inner_text
                      }
                    >
                      {' '}
                      Chit
                    </Text>
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 4,
                    }}
                  >
                    <Text style={common_styles.new_chits_sub_tags}>
                      Max bid{' '}
                      {finalChitsData.scheme?.maximumBid ?? ''} %
                    </Text>
                    <Text style={common_styles.new_chits_sub_tags}>
                      {finalChitsData.scheme?.auctionType ?? ''}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.chit_container_row3_vacant}>
                <Text style={common_styles.vacant_chit_text2}>
                  01
                </Text>
                <View style={common_styles.sliderContainer}>
                  <Slider
                    minimumValue={0}
                    maximumValue={
                      finalChitsData.scheme?.schemeDetails
                        ?.numberOfInstallment ?? '0'
                    }
                    minimumTrackTintColor="#FF4A00"
                    maximumTrackTintColor="#8F9BB3"
                    disabled={true}
                    value={
                      finalChitsData.runningInstallment ?? '0'
                    }
                    renderThumbComponent={() =>
                      CustomThumb(
                        finalChitsData.runningInstallment ?? '0',
                      )
                    }
                    trackClickable={false}
                  />
                  <Text style={styles.runningInstall}>
                    Running Instalment
                  </Text>
                </View>
                <Text style={common_styles.vacant_chit_text2}>
                  {
                    finalChitsData.scheme?.schemeDetails
                      ?.numberOfInstallment ?? ''
                  }
                </Text>
              </View>
            </View>

            <View
              style={[
                common_styles.chit_container_row2,
                styles.paddingLeft_10,
                styles.borderBottom_1,
                styles.paddingTop_20,
              ]}
            >
              <View style={styles.width33}>
                <NameTitle title="Group name" />
                <InfoText
                  content={finalChitsData?.groupName ?? '-'}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                />
              </View>
              <View style={styles.width33}>
                <NameTitle title="Instalments" />
                <InfoText
                  content={`${finalChitsData?.scheme?.schemeDetails
                    ?.numberOfInstallment
                    } Months` ?? '-'}
                  isBold={true}
                />
              </View>
              <View
                style={[
                  common_styles.chit_container_row2_inner_container_last,
                  styles.width33,
                ]}
              >
                <NameTitle title="Start date" />
                <InfoText
                  content={
                    dayjs(
                      new Date(
                        parseInt(
                          finalChitsData.chitGroupCreatedDate *
                          1000,
                          10,
                        ),
                      ),
                    ).format('DD-MMM-YYYY') ?? '-'
                  }
                  isBold={true}
                />
              </View>
            </View>

            <View
              style={[
                common_styles.chit_container_row2,
                styles.paddingLeft_10,
              ]}
            >
              <View
                style={[
                  common_styles.chit_container_row2_inner_container_last,
                  styles.width33,
                ]}
              >
                <NameTitle title="You Paying Now" />
                <InfoText
                  content={`${formatCurrency(
                    finalChitsData?.totalPayable -
                    finalChitsData?.dividend,
                  ) ?? '--'
                    } `}
                  isCurrency={true}
                  isBold={true}
                  colorStyle={styles.orangeText}
                />
                <View
                  style={{
                    position: 'relative',
                    alignSelf: 'flex-start',
                  }}
                >
                  <View
                    style={{
                      position: 'relative',
                      display: 'inline',
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        textDecorationLine: 'line-through',
                        fontSize: 10,
                        color: CssColors.lightGreyTwo,
                      }}
                    >
                      ₹{' '}
                      {formatCurrency(
                        finalChitsData?.totalPayable,
                      )}
                    </Text>
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '50%',
                        height: 1,
                        backgroundColor: 'red',
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.width33}>
                <NameTitle title="Get Instant Dividend" />
                <InfoText
                  content={
                    formatCurrency(
                      finalChitsData?.dividend,
                    ) ?? '-'
                  }
                  isCurrency={true}
                  colorStyle={styles.greenText}
                  isBold={true}
                />
              </View>
              <View style={styles.width33}>
                <NameTitle title="Your Total Savings" />
                <InfoText
                  content={
                    formatCurrency(
                      finalChitsData?.totalPayable,
                    ) ?? '-'
                  }
                  isCurrency={true}
                  isBold={true}
                />
              </View>
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
                common_styles.chit_container_row1,
                styles.paddingLeft_10,
                styles.paddingBottom_10,
                styles.borderBottom_1,
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={styles.chit_details_title}>
                  Auction details
                </Text>
                <View>
                  {finalChitsData.bidType === 'FIX' ? (
                    <Pressable onPress={handleFixedBidNavigation}>
                      <Text
                        style={[
                          styles.new_chits_sub_tags,
                          styles.paymentCycleText,
                        ]}
                      >
                        Fixed bid
                      </Text>
                    </Pressable>
                  ) : (
                    <Text style={[styles.new_chits_sub_tags]}>
                      Open bid
                    </Text>
                  )}
                </View>
              </View>
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
                <NameTitle title="End Date & Time" />
                <InfoText
                  content={getHighestIdAuctionDateTime(
                    finalChitsData?.liveAuctions,
                    true,
                  )}
                  isBold={true}
                  reducedFontText={` ${getHighestIdAuctionDateTime(
                    finalChitsData?.liveAuctions,
                    false,
                  )}`}
                  reducedFontSizeStyle={{
                    fontSize: 8,
                    fontWeight: '400',
                  }}
                />
              </View>
              <View style={styles.width33}>
                <NameTitle title="Min bid" />
                <InfoText
                  content={
                    formatCurrency(
                      (parseInt(
                        finalChitsData?.scheme?.schemeDetails
                          ?.chitValue,
                        10,
                      ) /
                        100) *
                      parseInt(
                        finalChitsData?.scheme?.minimumBid,
                        10,
                      ),
                    ) ?? '-'
                  }
                  isCurrency={true}
                  reducedFontText={`(${finalChitsData?.scheme?.minimumBid}%)`}
                  reducedFontSizeStyle={{
                    fontSize: 8,
                    fontWeight: '400',
                  }}
                />
              </View>
              <View
                style={[
                  common_styles.chit_container_row2_inner_container_last,
                  styles.width33,
                ]}
              >
                <NameTitle title="Max bid" />
                <InfoText
                  content={
                    formatCurrency(
                      (parseInt(
                        finalChitsData?.scheme?.schemeDetails
                          ?.chitValue,
                        10,
                      ) /
                        100) *
                      parseInt(
                        finalChitsData?.scheme?.maximumBid,
                        10,
                      ),
                    ) ?? '-'
                  }
                  isCurrency={true}
                  reducedFontText={`(${finalChitsData?.scheme?.maximumBid}%)`}
                  reducedFontSizeStyle={{
                    fontSize: 8,
                    fontWeight: '400',
                  }}
                />
              </View>
            </View>
            <View
              style={[
                common_styles.chit_container_row2,
                styles.paddingLeft_10,
              ]}
            >
              <View style={styles.width33}>
                <NameTitle title="Current bid" />
                <InfoText
                  content={
                    formatCurrency(
                      auctionDetails?.currentBidValue,
                    ) ?? '--'
                  }
                  isBold={true}
                  isCurrency={true}
                />
              </View>
              <View style={styles.width33}>
                <NameTitle title="Net Amount" />
                <InfoText
                  content={
                    formatCurrency(
                      finalChitsData?.bidInformationForTicket
                        ?.netPrizedAmount,
                    ) ?? '--'
                  }
                  isCurrency={true}
                />
              </View>
              <View
                style={[
                  common_styles.chit_container_row2_inner_container_last,
                  styles.width33,
                ]}
              >
                <NameTitle title="Appx intr earn" />
                <InfoText
                  content={
                    finalChitsData?.appxInterestEarning ?? '--'
                  }
                  isBold={true}
                  reducedFontText={'% An'}
                  reducedFontSizeStyle={{
                    fontSize: 8,
                    fontWeight: '400',
                  }}
                />
              </View>
            </View>
          </View>

          {/* Certificates details */}
          {pdfData && pdfData.length > 0 && (
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
                  { alignItems: 'center' },
                ]}
              >
                <Text style={styles.chit_details_title}>
                  Certificates
                </Text>
                <CertificateIconSVG
                  width={25}
                  height={25}
                  style={{ marginRight: 10 }}
                />
              </View>
              <View
                style={[
                  common_styles.chit_container_row2,
                  styles.paddingLeft_10,
                  styles.paddingRight_15,
                  styles.justifyContent_spaceEvenly,
                ]}
              >
                {pdfData.map((cerData, index) => (
                  <React.Fragment key={index}>
                    <View
                      style={[
                        {
                          flexDirection: 'row',
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        onPress={() =>
                          certificateClicked(cerData.id)
                        }
                      >
                        <PDFIconSVG
                          width={25}
                          height={25}
                          style={[
                            common_styles.new_chits_details_certificate_pdf_icon,
                            styles.marginBottom_3,
                          ]}
                        />
                        <Text
                          style={[
                            styles.new_chits_details_certificate_text,
                          ]}
                        >
                          {cerData.name}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {disableSubscribe && <MinAmountView />}

      {/* Footer fixed at bottom, moves with keyboard on both platforms */}
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
          <View style={common_styles.fixed_footer_one_container_inner}>
            <View
              style={
                common_styles.new_chit_fixed_footer_input_container
              }
            >
              <Text
                style={common_styles.new_chit_fixed_footer_input_prefix}
              >
                {'\u20B9'}
              </Text>
              <TextInput
                style={common_styles.new_chit_fixed_footer_input}
                keyboardType="number-pad"
                underlineColorAndroid="transparent"
                ref={footerInputRef}
                onChangeText={value => updateAmount(value)}
                value={amount}
              />
            </View>
            <Text style={common_styles.text_type_5}>
              Pay minimum {'\u20B9'} {formatCurrency(minAmount)} to
              Subscribe
            </Text>
          </View>
          <View style={common_styles.fixed_footer_one_container_inner}>
            <TouchableOpacity
              onPress={() => {
                footerInputRef.current?.blur();
                setIsVisible(true);
              }}
              disabled={disableSubscribe || disableSubscribenow}
              style={[
                common_styles.button_two,
                (disableSubscribe || disableSubscribenow) &&
                common_styles.button_two_disabled,
              ]}
            >
              <Text
                style={[
                  common_styles.button_two_text,
                  disableSubscribe &&
                  common_styles.button_two_text_disabled,
                ]}
              >
                {SiteTexts.text_subscribe_now}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom sheet with keyboard-aware padding */}
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
                  chitValue={
                    finalChitsData?.scheme?.schemeDetails?.chitValue
                  }
                  imageStyle={common_styles.new_chits_logo_icon}
                />
                <View style={{ flexDirection: 'column' }}>
                  <Text
                    style={[
                      common_styles.bottomsheet_title1,
                      common_styles.padding_bottom_4,
                    ]}
                  >
                    {finalChitsData?.groupName}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={common_styles.bottomsheet_title2}>
                      {'\u20B9'}{' '}
                      {
                        finalChitsData?.scheme?.schemeDetails
                          ?.chitValue
                      }{' '}
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
                    value={amount}
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
                  disabled={enableProceedToPay || disableSubscribenow}
                  style={[
                    common_styles.button_three,
                    (enableProceedToPay || disableSubscribenow) &&
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
                ]}
              >
                Pay minimum {'\u20B9'} {formatCurrency(minAmount)} to
                Subscribe
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: '100%',
  },
  strikeoutText: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    textDecorationColor: CssColors.textColorSecondary,
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
  paddingRight_15: {
    paddingRight: 15,
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
  paddingBottom_10: {
    paddingBottom: 10,
  },
  chit_details_title: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  paddingTop_20: { paddingTop: 20 },
  justifyContent_spaceEvenly: { justifyContent: 'space-evenly' },
  alignItems_center: { alignItems: 'center' },
  marginBottom_3: { marginBottom: 3 },
  new_chits_details_certificate_text: {
    color: CssColors.primaryColor,
    fontSize: 12,
    lineHeight: 20,
    textDecorationColor: CssColors.primaryColor,
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    marginLeft: 3,
  },
  chit_container_row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chit_container_row3_vacant: {
    flexDirection: 'row',
    width: 150,
    paddingRight: 10,
    justifyContent: 'flex-end',
  },
  width33: {
    width: '33.33%',
  },
  paymentCycleText: {
    fontSize: 8,
    color: CssColors.monthlyCycle,
    textDecorationColor: CssColors.monthlyCycle,
    textDecorationLine: 'underline',
  },
  fixed_bg: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 10,
    backgroundColor: CssColors.homeDetailsBorder,
    padding: 2,
    borderRadius: 4,
    marginRight: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    paddingBottom: 3,
  },
  fontWeight600: { fontWeight: '600' },
  orangeText: { color: CssColors.textColorSecondary },
  new_chits_sub_tags: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 8,
    backgroundColor: CssColors.newChitTagBackground,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 2,
    marginLeft: 5,
  },
  runningInstall: {
    color: CssColors.lightGreyTwo,
    fontSize: 9,
    minWidth: 120,
    marginLeft: -18,
    marginTop: -13,
  },
});

export default VacantChitDetails;
