import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Platform,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import common_styles from '../css/common_styles';
import ChitIconDisplay from '../sharedComp/ChitIconDisplay';
import { CssColors } from '../css/css_colors';
import { SiteConstants } from '../SiteConstants';
import CommonService from '../services/CommonService';
import DefaultBottomSheet from '../components/DefaultBottomSheet';
import CustomCheckBox from '../components/CustomCheckbox';
import { getObjectData, storeObjectData } from '../sharedComp/AsyncData';
import {
  convertMillisecondsToTime,
  certificateData,
  formatDateToToday,
  formatCurrency,
  convertMillisecondsToDate,
  formatIndianNumber,
} from '../sharedComp/Utils';
import AuctionMyChitDetailsSVG from './svgs/AuctionMyChitDetailsSVG';
import CertificateIconSVG from './svgs/CertificateIconSVG';
import PDFIconSVG from './svgs/PDFIconTwoSVG';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import dayjs from 'dayjs';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import InfoText from '../sharedComp/InfoText';
import NameTitle from '../sharedComp/NameTitle';
import PolicyModal from '../sharedComp/PolicyModal';
import KeyboardAwareFooter from '../sharedComp/KeyboardAwareFooter';
import SkeletonLoader from '../components/loaders/SkeletonLoader';
import useNavigationGuard from '../hooks/useNavigationGuard';
import { verifyCashfreePayment } from '../utils/PaymentHelper';
import CrashlyticsService from '../services/Crashlytics';

const NewChitDetails = ({ route, navigation }) => {
  const { itemId } = route.params;
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [finalChitsData, setFinalChitsData] = useState();
  const [amount, setAmount] = useState('');
  const [minAmount, setMinAmount] = useState(0);
  const [disableSubscribe, setDisableSubscribe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enableProceedToPay, setEnableProceedToPay] = useState(false);
  const [isChecked, setChecked] = useState(true);
  const [pdfData, setPdfData] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [disableSubscribenow, setDisableSubscribeNow] = useState(false);
  const footerInputRef = useRef(null);
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

  // duplicate‑guard refs for payment callback
  const handledOrderIdsRef = useRef(new Set());
  const verifyInFlightRef = useRef(false);
  const lastVerifyAtRef = useRef(0);

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

  useEffect(() => {
    setIsLoading(true);
    setIsVisible(false);
    (async () => {
      try {
        const userUrl = `${SiteConstants.API_URL}user/v2/getUser`;
        const response = await CommonService.commonGet(navigation, userUrl);
        if (response) {
          setMemberId(response.id);
        }

        const chitsData = await CommonService.commonGet(
          navigation,
          `${SiteConstants.API_URL}chit-group/v2/getChit/${itemId}`,
        );

        if (chitsData !== undefined) {
          setFinalChitsData(chitsData);
          setMinAmount(chitsData.minSubscriptionAmount);
          setAmount(
            formatIndianNumber(
              parseFloat(chitsData.scheme.subscriptionAmount).toFixed(0),
            ),
          );

          if (
            chitsData?.chitGroupCC !== undefined ||
            chitsData?.chitGroupPSO !== undefined ||
            chitsData?.fixedDepositDTO !== undefined
          ) {
            const certData = certificateData(
              chitsData?.chitGroupCC,
              chitsData?.chitGroupPSO,
              chitsData?.fixedDepositDTO,
            );
            setPdfData(certData);
          }
        }
      } catch (e) {
        console.error('Error loading NewChitDetails:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [itemId, navigation]);

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
          Pay minimum {'\u20B9'} {formatIndianNumber(minAmount)} to Subscribe
        </Text>
      </View>
    );
  };

  const initiateOrder = async () => {
    setIsLoading(true);
    const cleanAmount = amount.toString().replace(/,/g, '');
    console.log(`Initiating payment order - Amount: ${cleanAmount}`);

    const finalBody = {
      chitId: finalChitsData.id,
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
          achitId: itemId.toString(),
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

        _startCheckout(data.orderId, data.paymentSessionId, chitDetailsStore);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      CrashlyticsService.recordPaymentError(error, {
        gateway: 'cashfree',
        stage: 'create_order',
        amount: cleanAmount,
        chitId: String(itemId),
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
    const numericValue = value
      ? parseInt(value.toString().replace(/,/g, ''), 10)
      : 0;

    if (numericValue > 1000000) {
      console.log(numericValue, 'greater');
      setDisableSubscribeNow(true);
      console.log('Disable Subscribe Now:', true);
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
      navigateWithGuard('Certificates', {
        itemId: selectedCertificateId,
        certificateData: pdfData,
        chitData: finalChitsData,
        chitId: itemId,
        myChit: false,
        memberId,
        isVacantChit: false,
      });
    },
    [navigateWithGuard, pdfData, finalChitsData, itemId, memberId],
  );

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

  if (!finalChitsData) {
    return (
      <View style={common_styles.center_align}>
        <Text>Unable to load chit details.</Text>
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
              styles.marginTop_15,
              styles.paddingLeft_0,
              common_styles.shadowProp,
            ]}
          >
            <View
              style={[
                common_styles.chit_container_row1,
                styles.paddingLeft_10,
              ]}
            >
              <View style={common_styles.chit_container_row1_left}>
                <ChitIconDisplay
                  chitValue={finalChitsData.scheme.schemeDetails.chitValue}
                  imageStyle={common_styles.new_chits_logo_icon}
                />
                <View style={{ flexDirection: 'column', paddingTop: 5 }}>
                  <Text style={common_styles.new_chits_amount_text}>
                    {'\u20B9'}{' '}
                    {formatCurrency(
                      finalChitsData?.scheme?.schemeDetails?.chitValue,
                    )}
                    <Text style={common_styles.new_chits_amount_inner_text}>
                      {' '}
                      Chit
                    </Text>
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <Text style={common_styles.new_chits_sub_tags}>
                      Max bid {finalChitsData?.scheme?.maximumBid}%
                    </Text>
                    <Text style={common_styles.new_chits_sub_tags}>
                      {finalChitsData.scheme.auctionType}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{ flexDirection: 'column', alignItems: 'flex-end' }}
              >
                <ImageBackground
                  source={require('../../assets/icons/tag_bg.png')}
                  resizeMode="contain"
                  style={common_styles.new_chits_tag_container}
                >
                  <Text style={common_styles.new_chits_tag_text}>
                    {finalChitsData.tag}
                  </Text>
                </ImageBackground>
              </View>
            </View>

            <View
              style={[
                common_styles.chit_container_row2,
                styles.paddingLeft_10,
                styles.borderBottom_1,
                styles.paddingTop_15,
              ]}
            >
              <View style={styles.width33}>
                <NameTitle title="Group name" />
                <InfoText
                  content={finalChitsData?.groupName ?? '-'}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                />
              </View>
              <View style={styles.width33}>
                <NameTitle title="Instalments" />
                <InfoText
                  content={`${finalChitsData?.scheme?.schemeDetails?.numberOfInstallment} Months` ?? '-'}
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
                          finalChitsData.chitGroupCreatedDate * 1000,
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
              <View style={styles.width33}>
                <NameTitle title="Subscription" />
                <InfoText
                  content={
                    formatCurrency(
                      finalChitsData?.scheme?.subscriptionAmount,
                    ) ?? '-'
                  }
                  isCurrency={true}
                  isBold={true}
                />
              </View>
              <View style={styles.width33}>
                <NameTitle title="Dividend up to" />
                <InfoText
                  content={
                    formatCurrency(finalChitsData?.dividendUpTo) ?? '-'
                  }
                  isBold={true}
                  isCurrency={true}
                  reducedFontText={'/M'}
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
                <NameTitle title="Appx intr earn" />
                <InfoText
                  content={
                    finalChitsData?.appxInterestEarning?.toFixed(2) ??
                    '-'
                  }
                  isBold={true}
                  isCurrency={true}
                  reducedFontText={'% year'}
                  reducedFontSizeStyle={{
                    fontSize: 8,
                    fontWeight: '400',
                  }}
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.chit_details_title}>
                  Auction details
                </Text>
                <View>
                  {finalChitsData.bidType === 'FIX' ? (
                    <Pressable
                      onPress={() => {
                        navigation.navigate('FixedBidDetails', {
                          schemeId: finalChitsData.scheme?.id ?? '',
                          chitId:
                            finalChitsData.chitGroupApplyFD.chitGroupId ??
                            '',
                        });
                      }}
                    >
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
                styles.paddingLeft_10,
              ]}
            >
              <View style={styles.width33}>
                <NameTitle title="First auction date" />
                <InfoText
                  content={
                    convertMillisecondsToDate(
                      finalChitsData?.chitGroupAuctions[0]?.startDateTime,
                    ) ?? '-'
                  }
                  isBold={true}
                  reducedFontText={` ${convertMillisecondsToTime(
                    finalChitsData?.chitGroupAuctions[0]?.startDateTime,
                  )}` ?? '-'}
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
                        finalChitsData?.scheme?.schemeDetails?.chitValue,
                        10,
                      ) /
                        100) *
                      parseInt(
                        finalChitsData?.scheme?.minimumBid,
                        10,
                      ),
                    ) ?? '-'
                  }
                  isBold={true}
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
                        finalChitsData?.scheme?.schemeDetails?.chitValue,
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
                  styles.alignItems_center,
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
                  styles.justifyContent_spaceEvenly,
                ]}
              >
                {pdfData.map((cerData, index) => (
                  <React.Fragment key={index}>
                    <View style={[{ flexDirection: 'row' }]}>
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

      {/* Footer hidden when bottom sheet is open */}
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
              style={common_styles.new_chit_fixed_footer_input_container}
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
              Pay minimum {'\u20B9'} {formatIndianNumber(minAmount)} to
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
                Subscribe now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom sheet */}
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
                  chitValue={finalChitsData.scheme.schemeDetails.chitValue}
                  imageStyle={common_styles.new_chits_logo_icon}
                />
                <View style={{ flexDirection: 'column' }}>
                  <Text
                    style={[
                      common_styles.bottomsheet_title1,
                      common_styles.padding_bottom_4,
                    ]}
                  >
                    {finalChitsData.groupName}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={common_styles.bottomsheet_title2}>
                      {'\u20B9'}{' '}
                      {finalChitsData.scheme.schemeDetails.chitValue} Chit
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
                    common_styles.new_chit_fixed_footer_input_container,
                    { width: '100%' },
                  ]}
                >
                  <Text
                    style={common_styles.new_chit_fixed_footer_input_prefix}
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
                    Proceed to pay
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  common_styles.bottomsheet_text2,
                  common_styles.padding_top_10,
                ]}
              >
                Pay minimum {'\u20B9'} {formatIndianNumber(minAmount)} to
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
  transparent_bg: {
    backgroundColor: CssColors.primaryButtonDisabledBgColor,
    opacity: 0.3,
  },
  new_chits_sub_tags: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 8,
    backgroundColor: CssColors.newChitTagBackground,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 2,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: '100%',
  },
  new_details_chits_sub_tags: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chit_details_container_row2_inner_header: {
    fontSize: 12,
    lineHeight: 12,
  },
  paddingLeft_0: {
    paddingLeft: 0,
  },
  paddingLeft_10: {
    paddingLeft: 10,
  },
  paddingLeftRight_10: { paddingHorizontal: 10 },
  greenText: {
    color: CssColors.green,
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
    lineHeight: 16,
    fontWeight: '600',
  },
  paddingTop_20: { paddingTop: 20 },
  paddingTop_15: { paddingTop: 15 },
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
  marginTop_15: {
    marginTop: 15,
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
});

export default NewChitDetails;
