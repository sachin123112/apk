import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  Alert,
  Platform,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  Modal,
  StatusBar,
  BackHandler,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import IconTwo from 'react-native-vector-icons/MaterialCommunityIcons';
import {SiteConstants} from '../../SiteConstants';
import CommonService from '../../services/CommonService';
import common_styles from '../../css/common_styles';
import {CssColors} from '../../css/css_colors';
import dayjs from 'dayjs';
import DownIcon from 'react-native-vector-icons/AntDesign';
import RightIcon from 'react-native-vector-icons/AntDesign';
import BottomPopUp from '../../sharedComp/BottomSheet';
import DefaultBottomSheet from '../../components/DefaultBottomSheet';
import SpinnerWheel from './wheel';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';
import {getStringData} from '../../sharedComp/AsyncData';
import {useServerDateTimeFnc} from '../../sharedComp/ServerDateTime';
import EventSource from 'react-native-sse';
import {BlurView} from '@react-native-community/blur';
import KeyboardAwareFooter from '../../sharedComp/KeyboardAwareFooter';
import SkeletonLoader from '../../components/loaders/SkeletonLoader';

const SIZE = 300;

const AuctionDetails = ({route, navigation}) => {
  const {data, isMyBidDetails} = route.params;
  const insets = useSafeAreaInsets();

  // Core state variables
  const [isLoading, setIsLoading] = useState(false);
  const [auctionType, setAuctionType] = useState('');
  const [auctionDetails, setAuctionDetails] = useState({});
  const [bidHistory, setBidHistory] = useState([]);
  const [priceText, onChangePriceText] = useState('');
  const [isShowOPenBidMenu, setIsShowOPenBidMenu] = useState(false);
  const [selectedID, setSelectedId] = useState('');
  const [previousBidAmount, setPreviousBidAmount] = useState('');
  const [openBidOptions, setOpenBidOptions] = useState([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetData, setBottomSheetData] = useState({});
  const [displayWheel, setDisplayWheel] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [timer, setTimer] = useState('--:--:--');
  const [timePassed, setTimePassed] = useState(false);
  const [winnerData, setWinneData] = useState({});
  const [bidHistoryRaw, setBidHistoryRaw] = useState([]);
  const [isSubmitHide, setIsSubmitHide] = useState(false);
  const [userInteraction, setUserInteraction] = useState('auto');
  const [sseStatus, setSseStatus] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [lastbidAmount, setLastbidAmount] = useState('');
  const [bidRawHistory, setBidRawHistory] = useState([]);
  const [bidMaxHistory, setBidMaxHistory] = useState([]);
  const [isMychitDetails, setIsMychitDetails] = useState(false);
  const [isTimeEnded, setIsTimeEnded] = useState(false);
  const [lastTicketNumber, setLastTicketNumber] = useState(null);
  const [historyReloadCount, setHistoryReloadCount] = useState(10);
  const [isWinnerInfoAPI, setIsWinnerInfoAPI] = useState(false);
  const [isWinnerInfoResp, setIsWinnerInfoResp] = useState(false);
  const [winnerPayload, setWinnerPayload] = useState(null);
  const [submitButtonUserInteraction, setSubmitButtonUserInteraction] =
    useState('auto');

  // Shimmer and loading states
  const [pendingBid, setPendingBid] = useState(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);

  // Refs for timers, SSE, and performance optimization
  const Ref = useRef(null);
  const sectionListRef = useRef(null);
  const sseRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const bidProcessingRef = useRef(false);
  const aDetailsRef = useRef({});

  const handleFooterLayout = useCallback(event => {
    const {height} = event.nativeEvent.layout;
    setFooterHeight(height);
  }, []);

  // Memoized open bid options
  const memoizedOpenBidOptions = useMemo(() => {
    if (!data.chitValue || !data.maxBid) return [];
    const chitValue = parseInt(data.chitValue);
    return [
      {id: 1, title: '+ ' + chitValue * 0.001, amount: chitValue * 0.001},
      {id: 2, title: '+ ' + chitValue * 0.002, amount: chitValue * 0.002},
      {id: 3, title: '+ ' + chitValue * 0.005, amount: chitValue * 0.005},
      {id: 4, title: '+ ' + chitValue * 0.1, amount: chitValue * 0.1},
      {id: 5, title: '+ ' + chitValue * 0.2, amount: chitValue * 0.2},
      {
        id: 6,
        title: 'Place Max Bid',
        amount: (chitValue * parseInt(data.maxBid)) / 100,
      },
    ];
  }, [data.chitValue, data.maxBid]);

  // BidShimmer Component
  const BidShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }, [shimmerAnim]);

    const shimmerStyle = {
      opacity: shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      }),
    };

    return (
      <View style={[styles.item, styles.itemOutShimmer]}>
        <View style={[styles.balloon, styles.shimmerBalloon]}>
          <View style={styles.shimmerContainer}>
            <Animated.View
              style={[styles.shimmerLine, styles.shimmerAmount, shimmerStyle]}
            />
            <Animated.View
              style={[styles.shimmerLine, styles.shimmerTicket, shimmerStyle]}
            />
          </View>
        </View>
      </View>
    );
  };

  // History processing
  const processHistoryData = useCallback(biddingHistory => {
    if (!Array.isArray(biddingHistory) || biddingHistory.length === 0) {
      return {processedHistory: [], lastBid: null, uniqueHistory: [], rawHistory: []};
    }
    const processedData = biddingHistory
      .map(item => ({
        ...item,
        transactionDate: new Date(item.txnDateTime * 1000),
      }))
      .sort((a, b) => a.transactionDate - b.transactionDate);

    const uniqueMap = new Map();
    processedData.forEach(item => {
      uniqueMap.set(item.ticketNumber, item);
    });
    const uniqueHistory = Array.from(uniqueMap.values());
    const lastBid = processedData[processedData.length - 1];

    const groupedData = processedData.reduce((acc, item) => {
      const dateKey = item.transactionDate.toLocaleDateString('en-IN');
      if (!acc[dateKey]) acc[dateKey] = {title: dateKey, data: []};
      acc[dateKey].data.push(item);
      return acc;
    }, {});
    const groupedArray = Object.values(groupedData);

    return {
      processedHistory: groupedArray,
      lastBid,
      uniqueHistory,
      rawHistory: processedData,
    };
  }, []);

  // SSE handler - no bidHistory.length dependency
  const handleSSEUpdate = useCallback(
    eventData => {
      if (bidProcessingRef.current) return;
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 500) return;
      lastUpdateTimeRef.current = now;
      bidProcessingRef.current = true;

      try {
        const chitBid = JSON.parse(eventData);
        setBidRawHistory(prev => {
          const next = [...prev, chitBid];
          const {processedHistory, lastBid} = processHistoryData(next);
          setBidHistory(processedHistory);
          if (lastBid) {
            setPreviousBidAmount(String(lastBid.amount));
            setLastbidAmount(String(lastBid.amount));
            setLastTicketNumber(lastBid.ticketNumber);
            if (priceText === '' || priceText === '0') {
              onChangePriceText(String(lastBid.amount));
            }
          }
          return next;
        });
        // Auto-scroll to last
        setTimeout(() => {
          if (!sectionListRef.current) return;
          setBidHistory(prevBidHistory => {
            if (prevBidHistory.length > 0) {
              const lastSectionIndex = prevBidHistory.length - 1;
              const lastItemIndex =
                prevBidHistory[lastSectionIndex]?.data?.length - 1;
              if (lastItemIndex >= 0) {
                sectionListRef.current.scrollToLocation({
                  sectionIndex: lastSectionIndex,
                  itemIndex: lastItemIndex,
                  animated: true,
                });
              }
            }
            return prevBidHistory;
          });
        }, 100);
      } catch (e) {
        console.log('SSE parse/update error', e);
      } finally {
        bidProcessingRef.current = false;
      }
    },
    [priceText, processHistoryData],
  );

  // SSE setup with safe cleanup (no removeAllEventListeners)
  const cleanupSSEConnection = useCallback(() => {
    const es = sseRef.current;
    if (es) {
      try {
        es.close?.();
      } catch (e) {
        console.log('SSE cleanup error', e);
      }
      sseRef.current = null;
      setSseStatus(false);
    }
  }, []);

  const setupSSEConnection = useCallback(() => {
    if (
      !auctionDetails.chitGroupId ||
      !auctionDetails.auctionLiveId ||
      !authToken
    ) {
      return;
    }
    if (sseRef.current) return;

    const sseUrl = `${SiteConstants.API_URL}auction/registerChatClient/${auctionDetails.chitGroupId}/${auctionDetails.auctionLiveId}`;
    const es = new EventSource(sseUrl, {
      headers: {Authorization: `Bearer ${authToken}`},
    });
    const topic = `${auctionDetails.chitGroupId}_${auctionDetails.auctionLiveId}`;
    let reconnectTimer;

    es.addEventListener('open', () => {
      setSseStatus(true);
    });

    es.addEventListener(topic, event => {
      handleSSEUpdate(event.data);
    });

    es.addEventListener('error', () => {
      setSseStatus(false);
      if (sseRef.current === es) {
        reconnectTimer = setTimeout(() => {
          cleanupSSEConnection();
          setupSSEConnection();
        }, 3000);
      }
    });

    sseRef.current = es;

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (sseRef.current === es) {
        cleanupSSEConnection();
      }
    };
  }, [
    auctionDetails.chitGroupId,
    auctionDetails.auctionLiveId,
    authToken,
    handleSSEUpdate,
    cleanupSSEConnection,
  ]);

  // History loading
  const getHistory = useCallback(async () => {
    try {
      const biddingHistory = await CommonService.commonGet(
        navigation,
        `${SiteConstants.API_URL}auction/auction-bidding-history?live-auction-id=${data.auctionLiveId}`,
      );
      if (biddingHistory !== undefined) {
        const {processedHistory, lastBid, uniqueHistory, rawHistory} =
          processHistoryData(biddingHistory);

        setBidHistoryRaw(uniqueHistory);
        setBidHistory(processedHistory);
        setBidRawHistory(rawHistory);

        if (lastBid) {
          setPreviousBidAmount(String(lastBid.amount));
          setLastbidAmount(String(lastBid.amount));
          setLastTicketNumber(lastBid.ticketNumber);
          onChangePriceText(String(lastBid.amount));
        } else {
          setPreviousBidAmount('0');
          onChangePriceText('0');
        }

        getNPS_Status(rawHistory);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [data.auctionLiveId, navigation, processHistoryData]);

  // Auction details loading with sequencing
  const getAuctiondetails = useCallback(async () => {
    try {
      const token = await getStringData('token');
      if (!token) {
        throw new Error('No auth token found');
      }
      setAuthToken(token);

      const auctionDetailsData = await CommonService.commonGet(
        navigation,
        `${SiteConstants.API_URL}auction/bid-info/${data.auctionLiveId}`,
      );

      if (!auctionDetailsData) {
        throw new Error('No auction data received');
      }

      setAuctionDetails(auctionDetailsData);
      aDetailsRef.current = auctionDetailsData;

      if (bidHistory.length === 0) {
        await getHistory();
      }
    } catch (error) {
      console.error('Error loading auction details:', error);
      Alert.alert('Error', 'Failed to load auction details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [data.auctionLiveId, navigation, bidHistory.length, getHistory]);

  // Fallback polling
  const setupFallbackPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    const interval = sseStatus ? 120000 : 30000;
    pollingIntervalRef.current = setInterval(() => {
      if (!sseStatus) {
        getAuctiondetails();
      }
    }, interval);
  }, [sseStatus, getAuctiondetails]);

  // Initialization
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    if (isMyBidDetails === true) setIsMychitDetails(true);
    setAuctionType(data.auctionMode);
    setOpenBidOptions(memoizedOpenBidOptions);

    const initialize = async () => {
      setIsLoading(true);
      try {
        await getAuctiondetails();
        manageUserEvents();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();

    return () => {
      backHandler.remove();
      cleanupSSEConnection();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (Ref.current) {
        clearInterval(Ref.current);
      }
    };
  }, []);

  // SSE connection effect
  useEffect(() => {
    if (
      auctionDetails?.chitGroupId &&
      auctionDetails?.auctionLiveId &&
      authToken
    ) {
      if (sseRef.current) {
        cleanupSSEConnection();
      }
      const disposer = setupSSEConnection();
      return () => {
        if (typeof disposer === 'function') disposer();
        else cleanupSSEConnection();
      };
    }
    return () => {};
  }, [
    auctionDetails?.chitGroupId,
    auctionDetails?.auctionLiveId,
    authToken,
    setupSSEConnection,
    cleanupSSEConnection,
  ]);

  // Polling effect
  useEffect(() => {
    setupFallbackPolling();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [setupFallbackPolling]);

  // Timer effect guarded
  useEffect(() => {
    if (auctionDetails?.auctionEndDateTime) {
      clearTimer(getDeadTime());
    }
  }, [auctionDetails?.auctionEndDateTime]);

  // Auto-scroll effect
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      if (
        sectionListRef.current &&
        bidRawHistory.length > 3 &&
        bidHistory.length > 0
      ) {
        const lastSectionIndex = bidHistory.length - 1;
        const lastItemIndex = bidHistory[lastSectionIndex]?.data?.length - 1;
        if (lastItemIndex >= 0) {
          sectionListRef.current.scrollToLocation({
            sectionIndex: lastSectionIndex,
            itemIndex: lastItemIndex,
            animated: true,
            viewPosition: -1,
          });
        }
      }
    }, 300);
    return () => clearTimeout(scrollTimeout);
  }, [bidRawHistory.length, bidHistory.length]);

  // Winner-related effects
  useEffect(() => {
    if (!auctionDetails.auctionEndDateTime) return;
    const findByItems = eq => arr =>
      arr.filter((x, i) => arr.find((y, j) => i !== j && eq(x, y)));
    const duplicatedItems = findByItems((a, b) => a.amount === b.amount);
    const dups = duplicatedItems(bidRawHistory);
    const {total} = getTimeRemaining(
      new Date(auctionDetails.auctionEndDateTime * 1000),
    );
    if (total < 999 && isMyBidDetails == false) {
      doSpin();
    }
  }, [auctionDetails.auctionEndDateTime, bidRawHistory.length, timer]);

  useEffect(() => {
    let closeTimer;
    if (showWinner) {
      closeTimer = setTimeout(() => {
        setShowWinner(false);
        setIsSubmitHide(true);
        navigation.pop();
      }, 8000);
    }
    return () => {
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [showWinner]);

  useEffect(() => {
    if (isWinnerInfoAPI) {
      resendCount(historyReloadCount);
    }
  }, [historyReloadCount, isWinnerInfoAPI, isWinnerInfoResp]);

  const resendCount = count => {
    if (historyReloadCount > 0) {
      setTimeout(() => setHistoryReloadCount(count - 1), 5000);
    }
    if (count > 0) {
      pushWinnerInfo(null, bidRawHistory, auctionDetails);
    } else {
      setIsLoading(false);
      setIsTimeEnded(false);
      setIsWinnerInfoAPI(false);
      setHistoryReloadCount(0);
      if (!isWinnerInfoResp) {
        showAlertWithTwobuttonsWithPopNavigation(
          '',
          'Unable to display winner info',
        );
      }
    }
  };

  useEffect(() => {
    if (winnerData?.auctionBidInfoDTO?.ticketNumber != null) {
      setDisplayWheel(false);
      setShowSpinner(true);
    }
  }, [winnerData]);

  // Helpers
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{text: 'OK', onPress: () => {}}]);
  };

  const showAlertWithTwobuttons = (title, message) => {
    Alert.alert(title, message, [
      {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      {text: 'OK', onPress: () => pushOpenBidAuction()},
    ]);
  };

  const showAlertWithTwobuttonsWithPopNavigation = (title, message) => {
    Alert.alert(title, message, [
      {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      {text: 'OK', onPress: () => navigation.pop()},
    ]);
  };

  const manageUserEvents = useCallback(() => {
    const ticketStatus = data.ticketStatus;
    if (['CANCELLED', 'ASB', 'SB', 'PS'].includes(ticketStatus)) {
      setUserInteraction('none');
    } else {
      setUserInteraction('auto');
    }
  }, [data.ticketStatus]);

  const getNPS_Status = useCallback(
    async auctionBidHistory => {
      try {
        const memberId = await getStringData('memberID');
        await CommonService.commonGet(
          navigation,
          `${SiteConstants.API_URL}auction/bidding-status?member-id=${memberId}&groupName=${data.groupName}&ticketNumber=${data.ticketNumber}`,
        ).then(() => {
          checkForOpenMaxBid(auctionBidHistory);
        });
      } catch (error) {
        console.error('Error getting NPS status:', error);
      }
    },
    [navigation, data.groupName, data.ticketNumber],
  );

  const checkForOpenMaxBid = useCallback(
    auctionBidHistory => {
      const myBids = auctionBidHistory.filter(
        ({ticketNumber}) => ticketNumber == data.ticketNumber,
      );
      const bidAmount = parseInt(data.chitValue) * parseInt(data.maxBid);
      const haveMaxBid = myBids.filter(({amount}) => amount == bidAmount / 100);
      if (haveMaxBid.length > 0) {
        setUserInteraction('none');
      }
    },
    [data.ticketNumber, data.chitValue, data.maxBid],
  );

  // Spin and winner logic
  const doSpin = () => {
    var itemWithHighestPrice = bidRawHistory.reduce(function (
      highest,
      item,
      index,
    ) {
      if (index === 0 || item.amount > highest.amount) {
        return item;
      }
      return highest;
    },
    {});
    if (data.isforeman == true) {
      setIsTimeEnded(true);
      updateAuctionInfo(itemWithHighestPrice, bidRawHistory);
    } else {
      if (data.auctionMode === 'FIX') {
        bidRawHistory.length > 2 ? setDisplayWheel(true) : setIsTimeEnded(true);
        updateAuctionInfo(itemWithHighestPrice, bidRawHistory);
      } else {
        const findByItems = eq => arr =>
          arr.filter((x, i) => arr.find((y, j) => i !== j && eq(x, y)));
        const duplicatedItems = findByItems((a, b) => a.amount === b.amount);
        const dups = duplicatedItems(bidRawHistory);

        if (dups.length >= 2) {
          setDisplayWheel(true);
          updateAuctionInfo(itemWithHighestPrice, bidRawHistory);
        } else {
          var itemWithHighestPrice1 = bidRawHistory.reduce(function (
            highest,
            item,
            index,
          ) {
            if (index === 0 || item.amount > highest.amount) {
              return item;
            }
            return highest;
          },
          {});
          setIsTimeEnded(true);
          updateAuctionInfo(itemWithHighestPrice1, bidRawHistory);
        }
      }
    }
  };

  const updateAuctionInfo = async (obj, bidHistory) => {
    setIsShowOPenBidMenu(false);
    setIsWinnerInfoAPI(true);
    const details = auctionDetails.id ? auctionDetails : aDetailsRef.current;
    pushWinnerInfo(obj, bidHistory, details);
  };

  const pushWinnerInfo = async (obj, bidHistory, bidDetails) => {
    try {
      var applyRequestObject = winnerPayload;
      if (applyRequestObject == null) {
        applyRequestObject = {
          id: bidDetails.id,
          lastModifiedOn: bidDetails.lastModifiedOn,
          lastModifiedBy: bidDetails.lastModifiedBy,
          chitGroupId: obj?.chitGroupId || bidDetails.chitGroupId,
          auctionLiveId: bidDetails.auctionLiveId,
          auctionChatList: bidHistory,
        };
        setWinnerPayload(applyRequestObject);
      }
      await CommonService.commonPost(
        navigation,
        `${SiteConstants.API_URL}auction/get-winner-bid-info`,
        applyRequestObject,
      ).then(response => {
        if (response !== undefined) {
          setIsTimeEnded(false);
          setWinneData(response);
          if (!showSpinner && !displayWheel) {
            setShowWinner(true);
          }
          setIsWinnerInfoResp(true);
          setHistoryReloadCount(0);
        } else {
          setIsLoading(false);
          setIsTimeEnded(false);
        }
      });
    } catch (error) {
      if (historyReloadCount === 0) {
        setIsLoading(false);
        setIsTimeEnded(false);
      }
    }
  };

  const validateBidInfo = () => {
    const maxAmount = Math.max(...bidHistoryRaw.map(o => o.amount));
    const maximumBids = bidRawHistory.filter(e => e.amount == maxAmount);
    const maxBids = maximumBids.filter(e => e.ticketNumber != '00');
    setBidMaxHistory(maxBids);
    if (winnerData?.auctionBidInfoDTO?.ticketNumber != null) {
      setShowSpinner(true);
    }
  };

  const validateShowSpinner = () => {
    if (showSpinner && bidMaxHistory.length >= 2) {
      return (
        <DefaultBottomSheet
          visible={showSpinner}
          onClose={() => setShowSpinner(false)}
          height="auto">
          <View style={{justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <SpinnerWheel
              historyData={bidMaxHistory}
              winner={'17'}
              onClose={value => {
                setShowSpinner(false);
                setShowWinner(false);
                setIsSubmitHide(true);
                if (!isEmpty(winnerData)) {
                  setShowWinner(true);
                } else {
                  Alert.alert('Unable to display winner info');
                }
              }}
            />
          </View>
        </DefaultBottomSheet>
      );
    }
  };

  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  const getUniqueHistoryData = (arr, index) => {
    var unique = arr
      .map(e => e[index])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter(e => arr[e])
      .map(e => arr[e]);
    return unique;
  };

  const manageFooterMessage = () => {
    if (auctionType === 'FIX' && !data.isforeman) {
      return <Text style={styles.footerMessage}>Fixed auction amount</Text>;
    } else if (data.isforeman) {
      return (
        <View style={styles.foreManMessage}>
          <Text style={styles.foreManMessageData}>
            Foremen auction is running
          </Text>
        </View>
      );
    } else {
      return <></>;
    }
  };

  const manageFooter = () => {
    if (auctionType === 'FIX' && !data.isforeman) {
      let status = userInteraction == 'auto' ? true : false;
      return (
        <View
          style={[status ? styles.footer : styles.footerDisable]}
          pointerEvents={userInteraction}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputs} underlineColorAndroid="transparent">
              {' '}
              ₹ {auctionDetails.bidAmount}
            </Text>
          </View>
          {isSubmitHide ? (
            <></>
          ) : (
            <TouchableOpacity
              style={styles.btnSend}
              onPress={() => applyButtonTapped('FIX')}
              pointerEvents={submitButtonUserInteraction}>
              <Text style={{color: 'white'}}>Apply</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    } else if (auctionType === 'OPEN' && !data.isforeman) {
      let status = userInteraction == 'auto' ? true : false;
      return (
        <View
          style={[status ? styles.footer : styles.footerDisable]}
          pointerEvents={userInteraction}>
          <TouchableOpacity
            style={styles.btnShow}
            onPress={() => manageOpenBidMenu()}>
            <DownIcon
              name={isShowOPenBidMenu ? 'up' : 'down'}
              style={common_styles.upload_icon}
              size={24}
              color={CssColors.white}
            />
          </TouchableOpacity>
          <TextInput
            style={[styles.inputContainer, common_styles.padding_left_10]}
            placeholder="Placeholder"
            underlineColorAndroid="transparent"
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            value={priceText}
            onChangeText={value => {
              onChangePriceText(value.replace(/[^0-9]/g, ''));
            }}
          />
          {isSubmitHide ? (
            <></>
          ) : (
            <TouchableOpacity
              style={styles.btnSend1}
              onPress={() => applyButtonTapped()}
              pointerEvents={submitButtonUserInteraction}>
              <RightIcon
                name="arrowright"
                style={common_styles.upload_icon}
                size={24}
                color={CssColors.white}
              />
            </TouchableOpacity>
          )}
        </View>
      );
    } else if (data.isforeman) {
      return <></>;
    } else {
      return <></>;
    }
  };

  const manageOpenBidMenu = () => {
    let toggleChange = isShowOPenBidMenu ? false : true;
    setIsShowOPenBidMenu(toggleChange);
    if (toggleChange == false) {
      onChangePriceText(previousBidAmount);
    }
  };

  const applyButtonTapped = type => {
    if (type === 'FIX') {
      setIsSubmitHide(true);
      manageFixedAuction();
    } else {
      manageOpenBidAuction();
    }
  };

  const manageFixedAuction = async () => {
    const myBid = bidHistoryRaw.filter(
      ({ticketNumber}) => ticketNumber == data.ticketNumber,
    );
    if (myBid.length < 1) {
      setPendingBid({
        amount: auctionDetails.bidAmount,
        ticketNumber: data.ticketNumber,
        timestamp: new Date(),
      });
      setIsSubmittingBid(true);

      const serverTimeVar = await useServerDateTimeFnc(navigation);
      if (serverTimeVar != '') {
        try {
          const applyRequestObject = {
            id: auctionDetails.id,
            lastModifiedOn: auctionDetails.lastModifiedOn,
            lastModifiedBy: auctionDetails.lastModifiedBy,
            chitGroupId: auctionDetails.chitGroupId,
            amount: auctionDetails.bidAmount,
            ticketId: data.ticketId,
            bidder: 'admin',
            ticketNumber: data.ticketNumber,
            auctionLiveId: auctionDetails.auctionLiveId,
            bidInfoId: 0,
            chitId: data.chitId,
            memberId: '',
            txnDateTime: serverTimeVar,
            subscriptionId: data.subscriptionId,
          };
          await CommonService.commonPost(
            navigation,
            `${SiteConstants.API_URL}auction/auction-bidding`,
            applyRequestObject,
          ).then(auctionApplyData => {
            if (auctionApplyData !== undefined) {
              setIsLoading(false);
              getAuctiondetails();
            }
            setIsSubmittingBid(false);
            setPendingBid(null);
            setIsSubmitHide(false);
          });
        } catch (error) {
          setIsSubmittingBid(false);
          setPendingBid(null);
          setIsSubmitHide(false);
        }
      } else {
        setIsSubmittingBid(false);
        setPendingBid(null);
        setIsSubmitHide(false);
        Alert.alert('Unable to bid now. Please try again');
      }
    } else {
      setIsSubmitHide(false);
      showAlert('Alert', 'Bid amount is already posted.');
    }
  };

  const manageOpenBidAuction = () => {
    let bidAmount = parseInt(data.chitValue) * parseInt(data.maxBid);
    let min_Amount = parseInt(data.chitValue) * 0.001 + parseInt(lastbidAmount);
    if (parseInt(priceText) == bidAmount / 100) {
      let maxBid = bidHistoryRaw.filter((a, b) => a.amount > b.amount);
      let myBid = maxBid.filter(a => a.ticketNumber == data.ticketNumber);
      if (myBid.length < 1) {
        setBottomSheetData({
          title: 'Are you sure?',
          titleColor: `${CssColors.primaryColor}`,
          description: 'You want to Bid maximum?',
          sendButtonTitle: 'Confirm',
          sendButtonBGColor: '#072E77',
          cancelButtonTitle: 'Cancel',
          cancelButtonBGColor: '#F7F9FC',
          totalButtons: 2,
        });
        setShowBottomSheet(true);
      } else {
        showAlert('Alert', 'Already placed max bid.');
      }
    } else if (parseInt(priceText) % 100 != 0) {
      showAlert('Alert', 'Please enter amount with multiples of 100');
    } else if (parseInt(priceText) <= parseInt(lastbidAmount)) {
      showAlert('Alert', 'Please enter amount greater than ' + lastbidAmount);
    } else if (parseInt(priceText) < min_Amount) {
      showAlert('Alert', 'Please enter amount greater than ' + min_Amount);
    } else if (parseInt(priceText) > bidAmount / 100) {
      showAlert(
        'Alert',
        'Please enter amount lesser than max bid ' + bidAmount / 100,
      );
    } else {
      if (selectedID == '4') {
        setBottomSheetData({
          title: 'Are you sure?',
          titleColor: '#072E77',
          description: 'You want to Bid 10% higher the running price?',
          sendButtonTitle: 'Confirm',
          sendButtonBGColor: '#072E77',
          cancelButtonTitle: 'Cancel',
          cancelButtonBGColor: '#F7F9FC',
          totalButtons: 2,
        });
        setShowBottomSheet(true);
      } else if (selectedID == '5') {
        setBottomSheetData({
          title: 'Are you sure?',
          titleColor: '#F7F9FC',
          description: 'You want to Bid maximum?',
          sendButtonTitle: 'Confirm',
          sendButtonBGColor: '#072E77',
          cancelButtonTitle: 'Cancel',
          cancelButtonBGColor: '#F7F9FC',
          totalButtons: 2,
        });
        setShowBottomSheet(true);
      } else {
        pushOpenBidAuction();
      }
    }
  };

  const pushOpenBidAuction = useCallback(async () => {
    setIsShowOPenBidMenu(false);
    setPendingBid({
      amount: priceText,
      ticketNumber: data.ticketNumber,
      timestamp: new Date(),
    });
    setIsSubmittingBid(true);
    setIsSubmitHide(true);

    try {
      const serverTimeVar = await useServerDateTimeFnc(navigation);
      if (serverTimeVar) {
        const applyRequestObject = {
          lastModifiedOn: auctionDetails.lastModifiedOn,
          lastModifiedBy: auctionDetails.lastModifiedBy,
          chitGroupId: auctionDetails.chitGroupId,
          amount: priceText,
          ticketId: data.ticketId,
          bidder: 'admin',
          ticketNumber: data.ticketNumber,
          auctionLiveId: auctionDetails.auctionLiveId,
          bidInfoId: 0,
          chitId: data.chitId,
          memberId: '',
          txnDateTime: serverTimeVar,
          subscriptionId: data.subscriptionId,
        };
        const result = await CommonService.commonPost(
          navigation,
          `${SiteConstants.API_URL}auction/auction-bidding`,
          applyRequestObject,
        );
        if (result !== undefined) {
          // wait for SSE to reflect
        }
      } else {
        Alert.alert('Unable to bid now. Please try again');
      }
    } catch (error) {
      console.error('Bid submission error:', error);
      Alert.alert('Error', 'Failed to submit bid. Please try again.');
    } finally {
      setIsSubmittingBid(false);
      setPendingBid(null);
      setIsSubmitHide(false);
    }
  }, [priceText, data, auctionDetails, navigation]);

  const handleOpendOnpressOptions = (id, amount) => {
    if (id == 6) {
      setSelectedId(id);
      onChangePriceText(amount.toString());
    } else {
      setSelectedId(id);
      if (priceText == '') {
        onChangePriceText(
          (parseInt(previousBidAmount) + parseInt(amount)).toString(),
        );
      } else {
        onChangePriceText((parseInt(priceText) + parseInt(amount)).toString());
      }
    }
  };

  const manageOpenBidMenuOptions = () => {
    return (
      <View style={{height: 70, backgroundColor: '#F7F9FC'}}>
        <FlatList
          style={{marginLeft: 10, marginRight: 10, backgroundColor: '#F7F9FC'}}
          horizontal
          data={memoizedOpenBidOptions}
          extraData={selectedID}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleOpendOnpressOptions(item.id, item.amount)}>
              <Text
                style={
                  item.id === selectedID
                    ? styles.openSelectedItem
                    : styles.openItem
                }>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const validateMaxBid = () => {
    let bidAmount = parseInt(data.chitValue) * parseInt(data.maxBid);
    if (parseInt(priceText) <= bidAmount / 100) {
      pushOpenBidAuction();
    } else {
      showAlert(
        'Alert',
        'Please enter amount lesser than max bid ' + bidAmount / 100,
      );
    }
  };

  const getTimeRemaining = e => {
    const total = e - new Date();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return {total, days, hours, minutes, seconds};
  };

  const startTimer = e => {
    let {total, days, hours, minutes, seconds} = getTimeRemaining(e);
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
      if (total > 0 && total < 200) {
        setTimer('00d:00h:00m:00s');
      }
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
    let deadline = new Date(auctionDetails.auctionEndDateTime * 1000);
    return deadline;
  };

  const showBidInfo = () => {
    getUpdatedData();
  };

  const getUpdatedData = async () => {
    setIsLoading(true);
    await CommonService.commonGet(
      navigation,
      `${SiteConstants.API_URL}auction/bid-info/${data.auctionLiveId}`,
    ).then(resp => {
      setIsLoading(false);
      if (resp != undefined) {
        navigation.navigate('AuctionInfo', {
          data: resp,
          id: data.auctionLiveId,
        });
      }
    });
  };
console.log ('data.chitGroupName', data.chitGroupName);
console.log ('data', data);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container]}>
        {isLoading ? (
          <SkeletonLoader
            headerTwo={true}
            chat={true}
            order={['headerTwo', 'chat']}
          />
        ) : (
          <View style={{flex: 1}}>
            <View style={styles.timerInfo}>
              <Text
                style={[styles.ticketNumberText, {flex: 2}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {data.chitGroupName}
              </Text>
              <Text style={styles.verticalDividerTwo} />
              <Text style={[styles.ticketNumberTextTwo, {flex: 1.2}]}>
                Ticket No {data.ticketNumber}
              </Text>
              <View style={[styles.timerContainer, {flex: 2.2}]}>
                <IconTwo
                  name="timer-outline"
                  size={16}
                  color={CssColors.textColorSecondary}
                />
                <Text style={styles.timer}>{timer}</Text>
              </View>
            </View>
            <View style={[styles.headerinfo, common_styles.shadowProp]}>
              <View style={styles.headerOuterInfo}>
                <View style={styles.headerinfoInner}>
                  <View style={[styles.topContainerInnerData]}>
                    <Text style={styles.topBoxDataTitleTextHeader}>
                      Highest bid
                    </Text>
                    <Text style={styles.topBoxDataTitleText}>
                      {'\u20B9'} {lastbidAmount}
                    </Text>
                  </View>
                  <View style={styles.verticalDividerThree} />
                  <View style={[styles.topContainerInnerData]}>
                    <Text style={styles.topBoxDataTitleTextHeader}>
                      Prize Amount
                    </Text>
                    <Text style={styles.topBoxDataTitleText}>
                      {'\u20B9'} {auctionDetails.priceAmount}
                    </Text>
                  </View>
                  <View style={styles.verticalDividerThree} />
                  <View style={styles.topContainerInnerData}>
                    <Text style={styles.topBoxDataTitleTextHeader}>
                      Ticket No
                    </Text>
                    <Text style={styles.topBoxDataTitleText}>
                      {lastTicketNumber}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerSecondBottomContainer}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.avgInterest}>Avg interest: </Text>
                    <Text style={styles.avgInterestAmount}>
                      {auctionDetails.roi != undefined
                        ? auctionDetails.roi.toFixed(2) ?? auctionDetails.roi
                        : '--'}
                      {auctionDetails.roi != undefined ? '%' : ''}
                    </Text>
                    <Text style={styles.avgInterest}> Month </Text>
                  </View>
                  <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center'}}
                    onPress={() => {
                      showBidInfo();
                    }}>
                    <Text
                      style={{
                        color: CssColors.primaryPlaceHolderColor,
                        fontSize: 8,
                      }}>
                      More info
                    </Text>
                    <RightIcon
                      name="right"
                      size={10}
                      color={CssColors.primaryPlaceHolderColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <SectionList
              ref={sectionListRef}
              style={styles.list}
              sections={bidHistory}
              renderItem={({item}) => {
                let inMessage =
                  parseInt(item.ticketNumber, 10) !==
                  parseInt(data.ticketNumber, 10);
                let itemStyle = inMessage ? styles.itemIn : styles.itemOut;
                return (
                  <View style={[styles.item, itemStyle]}>
                    <View style={[styles.balloon]}>
                      <Text style={styles.amountText}>₹ {item.amount}</Text>
                      <Text style={styles.amountTicketNumber}>
                        Ticket no :{item.ticketNumber}{' '}
                        {dayjs(new Date(item.transactionDate)).format(
                          'hh:mm:ss a',
                        )}
                      </Text>
                    </View>
                  </View>
                );
              }}
              renderSectionHeader={({section}) => (
                <Text style={styles.sectionHeader}>{section.title}</Text>
              )}
              ListFooterComponent={() => {
                if (isSubmittingBid && pendingBid) {
                  return <BidShimmer />;
                }
                return null;
              }}
              onScrollToIndexFailed={info => {
                setTimeout(() => {
                  if (sectionListRef.current && bidHistory.length > 0) {
                    const lastSectionIndex = bidHistory.length - 1;
                    if (lastSectionIndex >= 0) {
                      const lastItemIndex =
                        bidHistory[lastSectionIndex]?.data?.length - 1;
                      if (lastItemIndex >= 0) {
                        sectionListRef.current.scrollToLocation({
                          sectionIndex: lastSectionIndex,
                          itemIndex: lastItemIndex,
                          animated: true,
                        });
                      }
                    }
                  }
                }, 100);
              }}
            />
            {manageFooterMessage()}
            {isMychitDetails ? (
              <View style={styles.paymentDetailsContainer}>
                <View>
                  <Text style={[common_styles.fontsize14, styles.bold]}>
                    Congratulations you have won the auction{'  '}
                    <Text style={[common_styles.fontsize14, styles.underline]}>
                      Update Surety
                    </Text>
                  </Text>
                </View>
              </View>
            ) : isTimeEnded ? (
              <View style={[styles.timeEndContainer]}>
                <View style={[styles.headerinfoInner]}>
                  <View style={{justifyContent: 'center', paddingRight: 20}}>
                    <ActivityIndicator
                      size={'large'}
                      color={CssColors.textColorSecondary}
                    />
                  </View>
                  <View style={{width: '95%'}}>
                    <Text style={[styles.title, {color: '#072E77'}]}>
                      Bidding time has ended
                    </Text>
                    <Text style={[styles.description]} numberOfLines={2}>
                      {[
                        "Now it's time for announcing the Auction",
                        'Winner',
                      ].join('\n')}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <KeyboardAwareFooter
                enabled={true}
                customOffset={Platform.OS === 'ios' ? -10 : 2}>
                <View onLayout={handleFooterLayout}>
                  {manageFooter()}
                  {isShowOPenBidMenu ? manageOpenBidMenuOptions() : <></>}
                </View>
              </KeyboardAwareFooter>
            )}
          </View>
        )}

        {showBottomSheet && (
          <BottomPopUp
            data={bottomSheetData}
            onClose={() => {
              setShowBottomSheet(false);
            }}
            onSubmit={() => {
              setShowBottomSheet(false);
              validateMaxBid();
            }}
          />
        )}

        {displayWheel && (
          <DefaultBottomSheet
            visible={displayWheel}
            onClose={() => setDisplayWheel(false)}
            height="auto">
            <View style={{justifyContent: 'center', alignItems: 'center', margin: 5}}>
              <View>
                <CountdownCircleTimer
                  isPlaying={true}
                  duration={15}
                  colors="#FF4A00"
                  size={90}
                  strokeWidth={5}
                  onComplete={() => {
                    if (winnerData?.auctionBidInfoDTO?.ticketNumber != null) {
                      setDisplayWheel(false);
                    }
                    validateBidInfo();
                  }}>
                  {({remainingTime}) => (
                    <Text style={{fontSize: 22, color: '#072E77'}}>
                      00.{remainingTime}
                    </Text>
                  )}
                </CountdownCircleTimer>
              </View>
              <Text style={styles.titleInfo}>
                We received several of the same requests.
              </Text>
              <Text style={{color: '#072E77', margin: 10}}>
                Soon, the spinning wheel will start.
              </Text>
            </View>
          </DefaultBottomSheet>
        )}

        {validateShowSpinner()}

        {showWinner && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showWinner}
            onRequestClose={() => {}}
            style={{backgroundColor: 'gray'}}>
            <View style={{height: '100%', backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <Image
                key={'blurryImage'}
                source={require('../../../assets/blur_bg.png')}
                style={styles.absolute}
              />
              <BlurView
                style={styles.absolute}
                blurType="dark"
                blurAmount={4}
                reducedTransparencyFallbackColor="black"
              />
              <View
                style={{
                  height: 'auto',
                  margin: 10,
                  marginTop: 'auto',
                  backgroundColor: 'white',
                }}>
                <View style={{height: 280, margin: 10}}>
                  <ImageBackground
                    style={styles.backgroundImage}
                    source={require('../../../assets/congratulations.png')}>
                    <View style={{top: -5, position: 'absolute', width: '100%'}}>
                      <Text
                        style={[
                          styles.titleInfo,
                          {color: 'white', alignSelf: 'center'},
                        ]}>
                        Ticket Id
                      </Text>
                    </View>
                    <View style={{alignItems: 'center'}}>
                      <Text
                        style={[
                          {
                            color: '#f4e294',
                            top: 60,
                            fontSize: 45,
                            fontWeight: 'bold',
                          },
                        ]}>
                        {winnerData.auctionBidInfoDTO?.ticketNumber}
                      </Text>
                    </View>
                    <View style={{bottom: -5, position: 'absolute', width: '100%'}}>
                      <Text
                        style={[
                          styles.congrasInfo,
                          {color: 'white', alignSelf: 'center'},
                        ]}>
                        Congratulations
                      </Text>
                    </View>
                  </ImageBackground>

                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 3}}>
                      <Text style={styles.textInfo1}>
                        Winner ticket id -{' '}
                        {winnerData.auctionBidInfoDTO?.ticketNumber}
                      </Text>
                      <Text style={styles.textInfo2}>
                        {winnerData.auctionBidInfoDTO?.auctionSequenceNo ?? ''}
                        th Auction
                      </Text>
                    </View>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                      <Pressable
                        style={[styles.historyTextContainer, styles.historyborder]}
                        onPress={() => {
                          setShowWinner(false);
                          setIsSubmitHide(true);
                          navigation.pop();
                        }}>
                        <Text style={styles.historyText}>Close</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: CssColors.white, height: '100%'},
  kview: {flex: 1},
  avgInterest: {color: CssColors.primaryPlaceHolderColor, fontSize: 8},
  avgInterestAmount: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSecondBottomContainer: {
    flexDirection: 'row',
    backgroundColor: CssColors.backgroundGrey,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  topBoxDataTitleTextHeader: {
    fontSize: 8,
    lineHeight: 16,
    color: CssColors.primaryBorder,
  },
  topBoxDataTitleText: {
    fontSize: 16,
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
    fontWeight: 'bold',
  },
  topContainerInnerData: {flexDirection: 'column', width: '25%'},
  ticketNumberText: {fontSize: 14, fontWeight: '600', color: CssColors.white},
  ticketNumberTextTwo: {fontSize: 12, color: CssColors.white},
  amountTicketNumber: {
    color: CssColors.primaryBorder,
    fontSize: 13,
    fontWeight: 'normal',
    lineHeight: 18,
    marginTop: 8,
  },
  amountText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  headerinfo: {
    flexDirection: 'column',
    backgroundColor: CssColors.white,
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 10,
  },
  headerinfoInner: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 10,
  },
  headerOuterInfo: {
    flexDirection: 'column',
    backgroundColor: CssColors.appBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CssColors.borderOne,
  },
  headerinfo2: {backgroundColor: '#072E77', flexDirection: 'row', height: 30},
  headerChild: {flexDirection: 'column', flex: 2},
  headerChild2: {flexDirection: 'column', flex: 1},
  headerChild3: {flexDirection: 'column', flex: 1},
  ticketContainer: {flexDirection: 'row', alignItems: 'center'},
  timerContainer: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CssColors.white,
    borderRadius: 6,
    padding: 6,
  },
  verticleDivider: {height: '80%', width: 1, backgroundColor: '#4B6595', margin: 10},
  verticalDividerTwo: {width: 1, height: '80%', backgroundColor: CssColors.primaryBorder, margin: 10},
  verticalDividerThree: {width: 1, height: '90%', backgroundColor: CssColors.homeDetailsBorder},
  list: {paddingHorizontal: 17, flexGrow: 1, backgroundColor: CssColors.white},
  item: {marginVertical: 4, flex: 1, flexDirection: 'row', padding: 1},
  balloon: {maxWidth: 250, paddingHorizontal: 15, paddingVertical: 5},
  itemIn: {
    alignSelf: 'flex-start',
    borderTopEndRadius: 14,
    borderBottomEndRadius: 14,
    borderBottomStartRadius: 14,
    borderColor: CssColors.homeDetailsBorder,
    borderWidth: 0.6,
  },
  itemOut: {
    alignSelf: 'flex-end',
    backgroundColor: CssColors.auctionInputBg,
    borderTopEndRadius: 14,
    borderTopStartRadius: 14,
    borderBottomStartRadius: 14,
  },
  itemOutShimmer: {
    alignSelf: 'flex-end',
    backgroundColor: CssColors.auctionInputBg,
    borderTopEndRadius: 4,
    borderTopStartRadius: 4,
    borderBottomStartRadius: 4,
    borderBottomEndRadius: 4,
  },
  footer: {flexDirection: 'row', height: 60, backgroundColor: CssColors.appBackground},
  footerDisable: {flexDirection: 'row', height: 60, backgroundColor: CssColors.homeDetailsBorder, opacity: 0.5},
  inputContainer: {
    borderColor: CssColors.auctionInputBg,
    backgroundColor: CssColors.white,
    borderRadius: 2,
    borderWidth: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    margin: 10,
    color: CssColors.primaryPlaceHolderColor,
  },
  inputs: {height: 40, marginLeft: 10, flex: 1, top: 10, color: CssColors.primaryBorder},
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: CssColors.primaryColor,
  },
  btnSend: {
    width: 66,
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CssColors.textColorSecondary,
    color: CssColors.white,
    marginTop: 10,
    marginRight: 10,
  },
  btnSend1: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CssColors.textColorSecondary,
    color: CssColors.white,
    marginTop: 10,
    marginRight: 10,
  },
  btnShow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#072E77',
    color: CssColors.white,
    marginTop: 10,
    marginLeft: 10,
  },
  footerMessage: {
    paddingHorizontal: 5,
    paddingVertical: 6,
    color: CssColors.white,
    fontSize: 12,
    lineHeight: 12,
    backgroundColor: CssColors.primaryBorder,
    marginLeft: 8,
    marginRight: 8,
  },
  foreManMessage: {
    display: 'flex',
    justifyContent: 'center',
    margin: 10,
    paddingHorizontal: 10,
    minHeight: 50,
    backgroundColor: CssColors.primaryBorder,
    marginBottom: 30,
  },
  foreManMessageData: {color: CssColors.white, fontSize: 12, lineHeight: 12},
  openItem: {
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    fontSize: 14,
    borderRadius: 18,
    backgroundColor: CssColors.white,
    borderColor: '#072E77',
    borderWidth: 1,
    color: '#072E77',
  },
  openSelectedItem: {
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    fontSize: 14,
    borderRadius: 18,
    backgroundColor: '#072E77',
    borderColor: '#072E77',
    borderWidth: 1,
    color: CssColors.white,
  },
  itemWrapper: {justifyContent: 'center', alignItems: 'center'},
  centerWheel: {width: SIZE, height: 700, alignSelf: 'center', justifyContent: 'center', alignItems: 'center'},
  prizeText: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  timerInfo: {
    backgroundColor: '#072E77',
    height: 44,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timer: {textAlign: 'center', color: CssColors.textColorSecondary, paddingLeft: 5, fontSize: 13},
  titleInfo: {color: '#072E77', fontSize: 18, fontWeight: 'bold', alignContent: 'center', margin: 16, justifyContent: 'center'},
  congrasInfo: {color: '#072E77', fontSize: 24, fontWeight: 'bold', alignContent: 'center', margin: 16, justifyContent: 'center'},
  winnerInfo: {flexDirection: 'row', marginTop: 20},
  textInfo1: {paddingTop: 10, paddingLeft: 16, alignContent: 'center', color: '#072E77', fontSize: 16},
  textInfo2: {paddingTop: 10, paddingLeft: 16, alignContent: 'center', color: '#34C85A', fontSize: 14},
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
    marginBottom: 30,
  },
  underline: {textDecorationLine: 'underline', textDecorationStyle: 'solid'},
  bold: {fontWeight: 'bold'},
  title: {textAlign: 'left', fontSize: 20, fontWeight: '600', color: CssColors.primaryTitleColor},
  description: {textAlign: 'left', fontSize: 14, marginTop: 15, marginRight: 10, color: '#34C85A'},
  timeEndContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    borderColor: '#34C85A',
    borderWidth: 1,
    borderRadius: 6,
    margin: 10,
    marginBottom: 30,
  },
  backgroundImage: {flex: 1, resizeMode: 'cover'},
  historyTextContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyborder: {borderColor: CssColors.primaryColor, borderWidth: 1},
  historyText: {color: CssColors.primaryColor, fontSize: 14},
  centeredView: {flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start'},
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  absolute: {position: 'absolute', top: 0, left: 0, bottom: 0, right: 0},
  shimmerBalloon: {
    backgroundColor: CssColors.auctionInputBg,
    alignSelf: 'flex-end',
    borderTopEndRadius: 5,
    borderTopStartRadius: 5,
    borderBottomStartRadius: 5,
    maxWidth: 250,
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 5,
  },
  shimmerContainer: {paddingHorizontal: 15, paddingVertical: 3},
  shimmerLine: {backgroundColor: 'rgba(0, 0, 0, 0.08)', borderRadius: 4, marginVertical: 2},
  shimmerAmount: {height: 15, width: 90, right: 10, marginBottom: 8},
  shimmerTicket: {height: 15, right: 10, width: 130},
});

export default AuctionDetails;
