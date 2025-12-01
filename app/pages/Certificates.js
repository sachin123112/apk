import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Image,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KeyboardAwareFooter from '../sharedComp/KeyboardAwareFooter';
import DefaultBottomSheet from '../components/DefaultBottomSheet';
import CustomCheckBox from '../components/CustomCheckbox';
import Pdf from 'react-native-pdf';
import common_styles from '../css/common_styles';
import { CssColors } from '../css/css_colors';
import CommonService from '../services/CommonService';
import { SiteConstants } from '../SiteConstants';
import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import { getObjectData, storeObjectData } from '../sharedComp/AsyncData';
import { formatDateToToday, formatIndianNumber } from '../sharedComp/Utils';
import PolicyModal from '../sharedComp/PolicyModal';
import ChitIconDisplay from '../sharedComp/ChitIconDisplay';
import CrashlyticsService from '../services/Crashlytics';
import { verifyCashfreePayment } from '../utils/PaymentHelper';
import useNavigationGuard from '../hooks/useNavigationGuard';

const Certificates = ({ route, navigation }) => {
  const {
    itemId,
    certificateData,
    chitData,
    chitId,
    myChit,
    memberId,
    isVacantChit,
    _timestamp,
  } = route.params;

  const insets = useSafeAreaInsets();
  const { navigateWithGuard } = useNavigationGuard(navigation);

  const [isLoading, setIsLoading] = useState(false);
  const [tagsData, setTagsData] = useState(
    Array.isArray(certificateData) ? certificateData : [],
  );
  const [pdfUrl, setPdfUrl] = useState(null);
  const [activeTag, setActiveTag] = useState();
  const [amount, setAmount] = useState('0');
  const [minAmount, setMinAmount] = useState(0);
  const [disableSubscribe, setDisableSubscribe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enableProceedToPay, setEnableProceedToPay] = useState(false);
  const [isChecked, setChecked] = useState(true);
  const [timePassed, setTimePassed] = useState(false);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [disableSubscribenow, setDisableSubscribeNow] = useState(false);
  const [isCurrentPdf, setIsCurrentPdf] = useState(true);

  const footerInputRef = useRef(null);
  const bottomSheetInputRef = useRef(null);

  const downloadTaskRef = useRef(null);
  const fileReaderRef = useRef(null);
  const fetchControllerRef = useRef(null);

  const handledOrderIdsRef = useRef(new Set());
  const verifyInFlightRef = useRef(false);
  const lastVerifyAtRef = useRef(0);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Mounted flag to prevent setState/navigation after unmount (swipe‑back)
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      if (!isMountedRef.current) return;
      setKeyboardHeight(e.endCoordinates.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (!isMountedRef.current) return;
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Back handler
  useEffect(() => {
    const backAction = () => {
      CrashlyticsService.log('Back button pressed - Certificates screen');
      if (!isMountedRef.current) return true;
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  // Remove Cashfree callback on unmount
  useEffect(() => {
    return () => {
      try {
        CFPaymentGatewayService.removeCallback();
      } catch (e) { }
    };
  }, []);

  // Initial load / refresh
  useEffect(() => {
    CrashlyticsService.log('Certificates component mounted/refreshed');
    CrashlyticsService.log(
      `ChitId: ${chitId}, ItemId: ${itemId}, IsVacantChit: ${isVacantChit}, TS: ${_timestamp}`,
    );

    if (!isMountedRef.current) return;

    setIsLoading(false);
    setPdfUrl(null);
    setTagsData(Array.isArray(certificateData) ? certificateData : []);
    setActiveTag(undefined);

    const list = Array.isArray(certificateData) ? certificateData : [];
    const defaultItem =
      list.find(i => i.id === itemId) || (list.length > 0 ? list[0] : undefined);

    if (defaultItem) {
      setActiveTag(defaultItem.id);
      setIsCurrentPdf(Boolean(defaultItem.isPdf));
      // small delay to avoid racing setState vs download
      setTimeout(() => {
        if (!isMountedRef.current) return;
        downloadPdf(defaultItem.location);
      }, 0);
    }

    const baseAmount = isVacantChit
      ? chitData?.netPayable
      : chitData?.scheme?.subscriptionAmount;
    const safeAmount = Number.parseFloat(baseAmount ?? 0);
    if (isMountedRef.current) {
      setAmount(
        formatIndianNumber(
          (Number.isFinite(safeAmount) ? safeAmount : 0).toFixed(0),
        ),
      );
      setMinAmount(chitData?.minSubscriptionAmount ?? 0);
    }

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setTimePassed(true);
      CrashlyticsService.log('Initial load timer completed - 4 seconds passed');
    }, 4000);

    return () => {
      clearTimeout(timer);

      if (downloadTaskRef.current) {
        downloadTaskRef.current.cancelled = true;
        CrashlyticsService.log('Download task cancelled in cleanup');
      }
      if (fetchControllerRef.current) {
        try {
          fetchControllerRef.current.abort();
          CrashlyticsService.log('Fetch request aborted in cleanup');
        } catch (e) {
          CrashlyticsService.recordError(e, 'cleanup_abort_fetch_error');
        }
      }
      if (fileReaderRef.current) {
        try {
          if (fileReaderRef.current.readyState === FileReader.LOADING) {
            fileReaderRef.current.abort();
            CrashlyticsService.log('FileReader aborted in cleanup');
          }
        } catch (e) {
          CrashlyticsService.recordError(e, 'cleanup_abort_filereader_error');
        }
      }
      downloadTaskRef.current = null;
      fetchControllerRef.current = null;
      fileReaderRef.current = null;
      CrashlyticsService.log('Certificates cleanup completed');
    };
  }, [
    itemId,
    _timestamp,
    certificateData,
    chitId,
    isVacantChit,
    chitData,
    navigation,
  ]);

  // Download PDF / image – now only guarded by isMounted + cancelled
  const downloadPdf = async location => {
    // Cancel previous download task if any
    if (downloadTaskRef.current) {
      downloadTaskRef.current.cancelled = true;
      CrashlyticsService.log('Previous download task cancelled');
    }
    if (fetchControllerRef.current) {
      try {
        fetchControllerRef.current.abort();
        CrashlyticsService.log('Previous fetch request aborted');
      } catch (e) {
        CrashlyticsService.recordError(e, 'abort_fetch_error');
      }
    }
    if (fileReaderRef.current) {
      try {
        if (fileReaderRef.current.readyState === FileReader.LOADING) {
          fileReaderRef.current.abort();
          CrashlyticsService.log('Previous FileReader operation aborted');
        }
      } catch (e) {
        CrashlyticsService.recordError(e, 'abort_filereader_error');
      }
    }

    const currentTask = { cancelled: false };
    downloadTaskRef.current = currentTask;

    if (!isMountedRef.current) return;
    setIsLoading(true);

    try {
      const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;

      const signedUrlData = await CommonService.commonBlobGet(
        navigation,
        url,
        location,
      );
      if (!isMountedRef.current || currentTask.cancelled) return;

      if (!signedUrlData || signedUrlData.byteLength === 0) {
        throw new Error('Empty response from server - no signed URL received');
      }

      const signedUrl = String.fromCharCode(...new Uint8Array(signedUrlData));
      if (!isMountedRef.current || currentTask.cancelled) return;

      if (!signedUrl.startsWith('http')) {
        throw new Error(
          `Invalid signed URL format - received: ${signedUrl.substring(0, 50)}`,
        );
      }

      const controller = new AbortController();
      fetchControllerRef.current = controller;

      const response = await fetch(signedUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf,application/octet-stream,image/*',
        },
        signal: controller.signal,
      });

      if (!isMountedRef.current || currentTask.cancelled) return;

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file: HTTP ${response.status} ${response.statusText}`,
        );
      }

      const contentType = response.headers.get('content-type') || '';
      const urlLower = signedUrl.toLowerCase();
      const isUrlPdf = urlLower.includes('.pdf');
      const isUrlImage = /\.(jpg|jpeg|png|gif|webp|bmp)/.test(urlLower);
      const isPdfContent =
        contentType.includes('application/pdf') || contentType.includes('pdf');
      const isImageContent = contentType.includes('image/');
      const isOctetStream = contentType.includes('application/octet-stream');

      let isFinalPdf = false;
      let isFinalImage = false;
      if (isPdfContent || isUrlPdf) isFinalPdf = true;
      else if (isImageContent || isUrlImage) isFinalImage = true;
      else if (isOctetStream)
        isFinalPdf = isUrlPdf ? true : isUrlImage ? false : true;

      if (!isMountedRef.current || currentTask.cancelled) return;

      setPdfUrl(null);

      await new Promise(resolve => setTimeout(resolve, 50));

      if (!isMountedRef.current || currentTask.cancelled) return;

      setPdfUrl(signedUrl);
      setIsCurrentPdf(isFinalPdf);
      setIsLoading(false);
    } catch (error) {
      if (!isMountedRef.current || currentTask.cancelled) return;

      setIsLoading(false);
      CrashlyticsService.recordPDFError(error, {
        operation: 'download_pdf_full_flow',
        location: location,
      });

      Alert.alert(
        'PDF Load Error',
        'Failed to load certificate. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: () => downloadPdf(location) },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    }
  };

  const navigateToParentScreen = useCallback(
    (screenName, params = {}) => {
      const parentNavigator = navigation.getParent();
      if (parentNavigator) {
        setTimeout(() => {
          if (!isMountedRef.current) return;
          parentNavigator.navigate(screenName, params);
        }, 100);
      } else {
        if (!isMountedRef.current) return;
        navigateWithGuard(screenName, params);
      }
    },
    [navigation, navigateWithGuard],
  );

  const tagPressTimeout = useRef(null);
  const [isSwitchingDoc, setIsSwitchingDoc] = useState(false);
  const lastSwitchAtRef = useRef(0);
  const tagPress = clickedId => {
    const now = Date.now();
    if (now - lastSwitchAtRef.current < 800) {
      return;
    }
    lastSwitchAtRef.current = now;

    if (isSwitchingDoc) return;
    if (tagPressTimeout.current) clearTimeout(tagPressTimeout.current);
    tagPressTimeout.current = setTimeout(async () => {
      const tag = (tagsData || []).find(item => item.id === clickedId);
      if (!tag || !isMountedRef.current) return;

      setIsSwitchingDoc(true);
      setIsLoading(true);
      setActiveTag(clickedId);
      setIsCurrentPdf(Boolean(tag.isPdf));

      try {
        await downloadPdf(tag.location);
      } finally {
        if (!isMountedRef.current) return;
        setIsSwitchingDoc(false);
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (downloadTaskRef.current) {
        downloadTaskRef.current.cancelled = true;
      }
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
    };
  }, []);


  const updateAmount = value => {
    if (value.startsWith('0') && value.length > 1) {
      value = value.replace(/^0+/, '');
    }
    if (value === '0') value = '';

    const cleanValue = Number(value.toString().replace(/,/g, ''));
    if (!isMountedRef.current) return;

    setAmount(formatIndianNumber(value));
    setDisableSubscribeNow(cleanValue > 1000000);
    setDisableSubscribe(cleanValue < minAmount);

    if (isVisible) {
      const shouldDisable = !isChecked || cleanValue < minAmount;
      setEnableProceedToPay(shouldDisable);
    }
  };

  const termsChecked = (value, totalAmount = amount) => {
    if (!isMountedRef.current) return;
    setChecked(value);
    setEnableProceedToPay(
      !value ||
      Number(
        (totalAmount || '0')
          .toString()
          .replace(/,/g, ''),
      ) < minAmount,
    );
  };

  const handlePdfTouch = () => {
    footerInputRef.current?.blur();
  };

  const renderPaymentLoader = () => {
    if (isLoading && pdfUrl) {
      return (
        <View style={styles.paymentLoaderOverlay}>
          <ActivityIndicator
            size="large"
            color={CssColors.textColorSecondary}
          />
        </View>
      );
    }
    return null;
  };

  const initiateOrder = async () => {
    Keyboard.dismiss();
    const cleanAmount = amount.toString().replace(/,/g, '');
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setIsVisible(false);

    const finalBody = {
      chitId,
      orderAmount: cleanAmount,
      paymentGateway: 'cashfree',
      memberId,
      subscriptionId: null,
    };

    CommonService.commonPostOld(
      navigation,
      `${SiteConstants.API_URL}payment/v2/createOrder`,
      finalBody,
    )
      .then(async data => {
        if (!isMountedRef.current) return;

        if (data !== undefined) {
          const chitDetailsStore = {
            achitId: chitId,
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
            data.paymentSessionId,
            data.orderId,
            chitDetailsStore,
          );
        } else {
          setIsLoading(false);
        }
      })
      .catch(e => {
        if (!isMountedRef.current) return;
        CrashlyticsService.recordError(e, 'payment_create_order_error');
        setIsLoading(false);
      });
  };

  const MinAmountView = () => (
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
        adjustsFontSizeToFit
      >
        Pay minimum {'\u20B9'} {formatIndianNumber(minAmount)} to Subscribe
      </Text>
    </View>
  );

  const _startCheckout = async (sessionId, orderId, chitDetailsStore) => {
    try {
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
          const now = Date.now();
          if (now - lastVerifyAtRef.current < 4000) {
            return;
          }
          lastVerifyAtRef.current = now;

          if (verifyInFlightRef.current) {
            return;
          }
          if (handledOrderIdsRef.current.has(orderID)) {
            return;
          }
          verifyInFlightRef.current = true;
          handledOrderIdsRef.current.add(orderID);

          if (!isMountedRef.current) {
            verifyInFlightRef.current = false;
            return;
          }

          setIsLoading(true);
          try {
            const result = await verifyCashfreePayment(navigation, orderID);
            if (!isMountedRef.current) return;

            if (result?.success) {
              setIsVisible(false);
              navigation.navigate('PaymentSuccess', {
                paymentOrderId: orderID,
                paymentVerified: true,
                result,
              });
            } else {
              setIsVisible(false);
              navigateToParentScreen('PaymentFail', {
                paymentOrderId: orderID,
              });
            }
          } catch (err) {
            if (!isMountedRef.current) return;
            setIsVisible(false);
            navigateToParentScreen('PaymentFail', {
              paymentOrderId: orderID,
            });
          } finally {
            if (!isMountedRef.current) return;
            setIsLoading(false);
            verifyInFlightRef.current = false;
            try {
              CFPaymentGatewayService.removeCallback();
            } catch (e) { }
          }
        },

        onError(error, orderID) {
          try {
            CFPaymentGatewayService.removeCallback();
          } catch (e) { }

          if (verifyInFlightRef.current) {
            return;
          }
          if (orderID && handledOrderIdsRef.current.has(orderID)) {
            return;
          }
          if (orderID) handledOrderIdsRef.current.add(orderID);

          if (!isMountedRef.current) return;

          setIsLoading(false);
          setIsVisible(false);
          navigateToParentScreen('PaymentFail', {
            paymentOrderId: orderID,
            errorMessage: error,
          });
        },
      });

      const session = new CFSession(sessionId, orderId, CFEnvironment.SANDBOX);
      CFPaymentGatewayService.doWebPayment(session);
    } catch (e) {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      setIsVisible(false);
      alert('Payment initiation failed: ' + e?.message);
    }
  };

  return (
    <>
      <View
        style={
          !isLoading
            ? [
              styles.container,
              insets.bottom > 20 ? { paddingBottom: insets.bottom } : {},
            ]
            : common_styles.center_align
        }
      >
        {isLoading && !pdfUrl ? (
          <ActivityIndicator
            size="large"
            color={CssColors.textColorSecondary}
          />
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.tagsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsScrollContent}
              >
                <View style={common_styles.newChits_tags}>
                  {(tagsData || []).map(item => (
                    <TouchableOpacity
                      key={`${item.id}`}
                      onPress={() => tagPress(item.id)}
                      style={
                        activeTag !== item.id
                          ? common_styles.newChits_tags_container
                          : common_styles.newChits_tags_container_active
                      }
                    >
                      <Text
                        style={
                          activeTag !== item.id
                            ? common_styles.newChits_tags_text
                            : common_styles.newChits_tags_text_active
                        }
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.pdfContainer}>
              {timePassed ? (
                isCurrentPdf ? (
                  <Pdf
                    key={`pdf_${pdfUrl}`}
                    trustAllCerts={false}
                    source={{ uri: pdfUrl, cache: false }}
                    style={styles.pdf}
                    onTouchStart={handlePdfTouch}
                    enablePaging
                    horizontal={false}
                  />
                ) : (
                  <Image
                    key={`img_${pdfUrl}`}
                    source={{ uri: pdfUrl }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoadEnd={() => {
                      if (!isMountedRef.current) return;
                      setIsLoading(false);
                    }}
                  />
                )
              ) : (
                <ActivityIndicator
                  style={styles.pdfLoader}
                  size="large"
                  color={CssColors.textColorSecondary}
                />
              )}
            </View>

            {disableSubscribe && <MinAmountView />}

            {!myChit && !isVisible && (
              <KeyboardAwareFooter
                enabled
                customOffset={Platform.OS === 'ios' ? 35 : 2}
              >
                <View style={common_styles.fixed_footer_one_container}>
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
                        {'\u20B9'}
                      </Text>
                      <TextInput
                        style={common_styles.new_chit_fixed_footer_input}
                        keyboardType="number-pad"
                        underlineColorAndroid="transparent"
                        ref={footerInputRef}
                        onChangeText={updateAmount}
                        value={amount}
                      />
                    </View>
                    <Text style={common_styles.text_type_5}>
                      Pay minimum {'\u20B9'}{' '}
                      {formatIndianNumber(minAmount)} to Subscribe
                    </Text>
                  </View>

                  <View
                    style={common_styles.fixed_footer_one_container_inner}
                  >
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
              </KeyboardAwareFooter>
            )}

            <DefaultBottomSheet
              visible={isVisible}
              onClose={() => {
                Keyboard.dismiss();
                setIsVisible(false);
              }}
              height="auto"
            >
              <ScrollView
                keyboardShouldPersistTaps={
                  Platform.OS === 'ios' ? 'handled' : 'never'
                }
                contentContainerStyle={{
                  paddingBottom:
                    Platform.OS === 'ios'
                      ? keyboardHeight > 0
                        ? keyboardHeight
                        : 20
                      : 5,
                }}
              >
                <View
                  style={[
                    common_styles.chit_container_row1,
                    { marginBottom: 15 },
                  ]}
                >
                  <View
                    style={common_styles.chit_container_row1_left}
                  >
                    <ChitIconDisplay
                      chitValue={amount}
                      imageStyle={
                        common_styles.new_chits_logo_icon
                      }
                    />
                    <View style={{ flexDirection: 'column' }}>
                      <Text
                        style={
                          common_styles.bottomsheet_title1
                        }
                      >
                        {chitData.groupName}
                      </Text>
                      <Text
                        style={
                          common_styles.bottomsheet_title2
                        }
                      >
                        {'\u20B9'}{' '}
                        {chitData.scheme?.schemeDetails?.chitValue ??
                          ''}{' '}
                        Chit
                      </Text>
                    </View>
                  </View>
                  <Text style={common_styles.bottomsheet_title2}>
                    {formatDateToToday(new Date())}
                  </Text>
                </View>

                <Text style={common_styles.bottomsheet_text3}>
                  Net payable
                </Text>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => bottomSheetInputRef.current?.focus()}
                >
                  <View
                    style={[
                      common_styles.new_chit_fixed_footer_input_container,
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
                      style={
                        common_styles
                          .new_chit_fixed_footer_input
                      }
                      keyboardType="number-pad"
                      value={amount}
                      onChangeText={updateAmount}
                      ref={bottomSheetInputRef}
                      autoFocus={false}
                      blurOnSubmit={false}
                    />
                  </View>
                </TouchableOpacity>

                <View style={common_styles.bottomsheet_checkbox1}>
                  <CustomCheckBox
                    value={isChecked}
                    onValueChange={termsChecked}
                    boxType="square"
                    style={{ width: 20, height: 20 }}
                  />
                  <Text
                    style={[
                      common_styles.bottomsheet_text1,
                      { marginLeft: 10 },
                    ]}
                  >
                    By clicking proceed to pay you agree to terms &
                    conditions
                    <TouchableOpacity
                      onPress={() => {
                        Keyboard.dismiss();
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

                <Text
                  style={[
                    common_styles.bottomsheet_text2,
                    common_styles.padding_top_10,
                  ]}
                >
                  Pay minimum {'\u20B9'} {minAmount} to Subscribe
                </Text>
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
        )}
      </View>
      {renderPaymentLoader()}
    </>
  );
};

const styles = StyleSheet.create({
  paymentLoaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CssColors.appBackground,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  tagsContainer: {
    backgroundColor: CssColors.white,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    zIndex: 1,
  },
  tagsScrollContent: {
    flexGrow: 1,
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: CssColors.appBackground,
  },
  pdfLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: CssColors.appBackground,
  },
});

export default Certificates;
