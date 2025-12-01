import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import common_styles from '../css/common_styles';
import { CssColors } from '../css/css_colors';
import CommonService from '../services/CommonService';
import { SiteConstants } from '../SiteConstants';
import { formatCurrency, useCustomBackHandler } from '../sharedComp/Utils';
import dayjs from 'dayjs';
import { storeObjectData, storeStringData } from '../sharedComp/AsyncData';
import ImageCarousel from '../sharedComp/ImageCarousel';
import { CacheService, CACHE_CONFIG } from '../sharedComp/CacheService';
import BlinkingDot from '../sharedComp/BlinkingDot';
import FinancialSummaryCard from '../sharedComp/FinancialSummaryCard';
import BottomPopUp from '../sharedComp/BottomSheet';
import HomeQuickLinks from '../sharedComp/HomeQuickLinks';
import LightningSVG from "./svgs/LightningSVG";
import SkeletonLoader from "../components/loaders/SkeletonLoader";
import FastImage from "@d11/react-native-fast-image";
import { getStringData } from '../sharedComp/AsyncData';

const Home = ({ navigation }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [isBannerLoading, setIsBannerLoading] = useState(false);
  const [isKtrsLoading, setIsKtrsLoading] = useState(false);
  const [isReferralLoading, setIsReferralLoading] = useState(false);
  const [sliderData, setSliderData] = useState([]);
  const [ktrsData, setKtrsData] = useState('');
  const [referralBanner, setReferralBanner] = useState('');
  const [newChitQuickAction, setNewChitQuickAction] = useState([]);
  const [dueQuickAction, setDueQuickAction] = useState([]);
  const [liveQuickAction, setLiveQuickAction] = useState([]);
  const [overDueQuickAction, setOverDueQuickAction] = useState([]);
  const [agreementStatusQuickAction, setAgreementStatusQuickAction] = useState([]);
  const [enrollmentStatusQuickAction, setEnrollmentStatusQuickAction] = useState([]);
  const [kycStatusQuickAction, setKycStatusQuickAction] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [financealData, setFinancealData] = useState({});
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetData, setBottomSheetData] = useState({});

  // Use back handler → exit app when on Home
  useCustomBackHandler(navigation, true);


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(async () => {
      try {
        // Clear all cache - banners, user data, and financial data
        await CacheService.clearCache(CACHE_CONFIG.homeBanners.key);
        await CacheService.clearCache(CACHE_CONFIG.userData.key);
        await CacheService.clearCache(CACHE_CONFIG.financialData.key);
        await getHomeBanners();
        await getQuickActions();
        const userData = await fetchUserData();
        if (userData?.id) {
          await fetchFinanceSummary(userData.id);
        }
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        setRefreshing(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Fetch banners/quickActions ASAP; show cached instantly inside functions
        await Promise.all([
          getHomeBanners(),
          getQuickActions(),
        ]);

        const userData = await fetchUserData(); // wait for user data
        if (userData?.id) {
          await fetchFinanceSummary(userData.id); // pass memberID explicitly
        }

      } catch (error) {
        console.error('Initial data fetch error:', error);
      }
    })();

    const unsubscribe = navigation.addListener('focus', () => {
      // refresh quick actions on focus without toggling global loaders
      getQuickActions();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const processImage = async (location, type) => {
    try {
      // Assuming mainSliderImage is the working function for all image types
      const data = await mainSliderImage(location);
      return data;
    } catch (error) {
      console.error(`Error processing ${type} image:`, error);
      return null;
    }
  };



const getHomeBanners = async () => {
  try {
    const cacheKey = CACHE_CONFIG.homeBanners.key;

    // 1. Show cached banners immediately (if available)
    const cachedBanners = await CacheService.getCachedData(cacheKey);
    if (cachedBanners) {
      console.log("✅ Using cached banner data");
      setSliderData(cachedBanners.banners || []);
      setKtrsData(cachedBanners.ktrs || "");
      setReferralBanner(cachedBanners.referral || "");
    } else {
      // show skeleton only if nothing cached
      setIsBannerLoading(true);
      setIsKtrsLoading(true);
      setIsReferralLoading(true);
    }

    // 2. Always fetch fresh data in background (stale-while-revalidate)
    const url = `${SiteConstants.API_URL}home/getHomeBanners`;
    const homeBannerData = await CommonService.commonGet(navigation, url);

    const bannerResults = { banners: [], ktrs: "", referral: "" };

    // 2a. Load main banners and then update state once to avoid flicker/duplication
    if (homeBannerData?.banners?.length) {
      try {
        const bannerObjs = await Promise.all(
          homeBannerData.banners.map(async (item) => {
            const imageUri = await mainSliderImage(item.location);
            if (imageUri) {
              FastImage.preload([{ uri: imageUri }]);
              return { uri: imageUri, href: item.href };
            }
            return null;
          })
        );
        const filtered = bannerObjs.filter(Boolean);
        bannerResults.banners = filtered;
        if (filtered.length) {
          setSliderData(filtered);
        }
      } catch (err) {
        console.log("Banner images load error:", err);
      }
    }

    // 2b. Load KTRS banner
    if (homeBannerData?.ktrsBanners?.length) {
      try {
        const ktrsImage = await processImage(
          homeBannerData.ktrsBanners[0].location,
          "ktrs"
        );
        if (ktrsImage) {
          setKtrsData(ktrsImage);
          bannerResults.ktrs = ktrsImage;
          console.log(ktrsImage, 'ktrs image');
          FastImage.preload([{ uri: ktrsImage }]);
        }
      } catch (err) {
        console.log("KTRS image load error:", err);
      }
    }

    // 2c. Load referral banner
    if (homeBannerData?.referralBanners?.length) {
      try {
        const referralImage = await processImage(
          homeBannerData.referralBanners[0].location,
          "referral"
        );
        if (referralImage) {
          setReferralBanner(referralImage);
          bannerResults.referral = referralImage;
          console.log(referralImage, 'referral image');
          FastImage.preload([{ uri: referralImage }]);
        }
      } catch (err) {
        console.log("Referral image load error:", err);
      }
    }

    // 3. Save fresh banners to cache
    await CacheService.setCachedData(cacheKey, bannerResults);
  } catch (error) {
    console.error("❌ Error in getHomeBanners:", error);
  } finally {
    setIsBannerLoading(false);
    setIsKtrsLoading(false);
    setIsReferralLoading(false);
  }
};


  const fetchUserData = async () => {
    try {
      // Try to get cached user data first
      const cachedUserData = await CacheService.getCachedData(CACHE_CONFIG.userData.key);
      if (cachedUserData) {
        console.log('Using cached user data');
        await storeObjectData('userData', cachedUserData);
        console.log(cachedUserData);
        await storeStringData('memberID', cachedUserData.id ?? '');
        setIsLoading(false);
        return cachedUserData;
      }

      // If no cache, fetch from API
      const unikKey = await getStringData("unikKey");
      const url = `${SiteConstants.API_URL}user/v2/getUser?isReferesh=${unikKey}`;
      const response = await CommonService.commonGet(navigation, url);
      console.log(response, 'for token');
      await storeObjectData('userData', response);
      await storeStringData('memberID', response.id ?? '');

      // Cache the user data
      await CacheService.setCachedData(CACHE_CONFIG.userData.key, response);

      setIsLoading(false);
      return response;
    } catch (error) {
      console.log('catch ====>', error);
      setIsLoading(false);
      return 'null';
    }
  };

  const fetchFinanceSummary = async (memberID) => {
    try {
      const cachedFinancialData = await CacheService.getCachedData(CACHE_CONFIG.financialData.key);
      if (cachedFinancialData) {
        console.log(cachedFinancialData, memberID, 'using cached finance data');
        setFinancealData(cachedFinancialData);
      }
      const unikKey = await getStringData("unikKey");
      const url = `${SiteConstants.API_URL}chit-group/v2/summary-chits/${memberID}?isReferesh=${unikKey}`;
      const response = await CommonService.commonGet(navigation, url);

      await CacheService.setCachedData(CACHE_CONFIG.financialData.key, response);
      setFinancealData(response);
    } catch (error) {
      console.log('catch ====>', error);
    }
  };
  const updateQuickActionStates = (data) => {
  if (!data) return;

  setNewChitQuickAction(data.newChitQuickAction || []);
  setDueQuickAction(data.dueQuickAction || []);
  setLiveQuickAction(data.actionQuickAction || []);
  setOverDueQuickAction(data.overDueQuickAction || []);
  setAgreementStatusQuickAction(data.agreementStatusQuickAction || []);
  setEnrollmentStatusQuickAction(data.enrollmentStatusQuickAction || []);
  setKycStatusQuickAction(data.kycStatusQuickAction || {});
};

const getQuickActions = async (useCache = true) => {
  const unikKey = await getStringData("unikKey");
  const url = `${SiteConstants.API_URL}quick-action/v1/get-quick-auction?isReferesh=${unikKey}`;

  try {
    if (useCache) {
      const cached = await CacheService.getCachedData(CACHE_CONFIG.quickActions.key);
      if (cached) {
        console.log("📦 Using cached quick actions");
        updateQuickActionStates(cached);
        // 🚀 Fetch fresh in background to refresh cache
        fetchAndUpdateQuickActions(url, true);
        return;
      }
    }
    // 🚀 No valid cache → fetch fresh
    await fetchAndUpdateQuickActions(url, false);
  } catch (err) {
    console.error("❌ getQuickActions error:", err);
  }
};

// 🟢 Background + fresh fetcher
const fetchAndUpdateQuickActions = async (url, isBackground = false) => {
  try {
    const quickActionData = await CommonService.commonGet(navigation, url);
    if (!quickActionData) return;

    // ✅ Update states
    updateQuickActionStates(quickActionData);

    // 🗄️ Update cache via CacheService (handles TTL automatically)
    await CacheService.setCachedData(
      CACHE_CONFIG.quickActions.key,
      quickActionData
    );
  } catch (err) {
    console.error("❌ fetchAndUpdateQuickActions error:", err);
  }
};

useEffect(() => {
  if (sliderData?.length > 0) {
    const urls = sliderData.map(item => ({ uri: item.uri, priority: FastImage.priority.high }));
    FastImage.preload(urls);
  }

  if (referralBanner) {
    FastImage.preload([{ uri: referralBanner }]);
  }

  if (ktrsData) {
    FastImage.preload([{ uri: ktrsData }]);
  }
}, [sliderData, referralBanner, ktrsData]);

const mainSliderImage = async (location) => {
  const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;
  try {
    const cachedImage = await CacheService.getCachedData(
      CACHE_CONFIG.homeBanners.key,
      location
    );
    if (cachedImage) return cachedImage; // cached signed URL

    // Fetch signed URL
    const response = await CommonService.commonBlobGet(navigation, url,location);
    let binary = '';
    const bytes = new Uint8Array(response);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    console.log(binary, 'image URI');
    console.log(binary, 'response for image URL',url);
    const signedUrl = binary;

    if (signedUrl) {
      await CacheService.setCachedData(CACHE_CONFIG.homeBanners.key, signedUrl, location);
      return signedUrl;
    }
    return null;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};




  const Refer = () => (
    <View>
      <FastImage
        source={{ uri: referralBanner }}
        resizeMode="contain"
        style={{
          width: null,
          height: 145,
          marginHorizontal: 10,
          marginTop: 4,
        }}
      />
    </View>
  );

  const Explore = () => (
    <View>
      <FastImage
        source={{ uri: ktrsData }}
        resizeMode="contain"
        style={{
          width: null,
          height: 100,
          marginHorizontal: 10,
        }}
      />
    </View>
  );

  const navigateToNewChitDetails = (data) => {
    navigation.navigate('NewChitDetails', {
      itemId: data.id,
    });
  };
  
  const navigateToMyChitDetails = data => {
    navigation.navigate('MyChitsNavigator', {
      screen: 'MyChits',
      params: { isFromPayment: false }
    });
 
    setTimeout(() => {
      navigation.navigate('MyChitsNavigator', {
        screen: 'MyChitDetails',
        params: { subscriptionId: data.subscriberId }
      });
    }, 0);
  };

  const getAuctionList = async () => {
    setIsLoading(true);
    try {
      const auctionData = await CommonService.commonGet(
        navigation,
        `${SiteConstants.API_URL}auction/auction-list`
      );
      const filteredData = auctionData.filter(item => !item.foremanTicket);
      if (filteredData !== undefined) {
        console.log(auctionData, 'auction list');
        return filteredData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching auction data:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const manageBidNow = async (subscriberData) => {
    try {
      // Call getAuctionList and await its result
      const auctionList = await getAuctionList();
      // setIsLoading(true);
      // Find the matching auction
      const subscriberKey = `${subscriberData.chitGroupName}-${subscriberData.ticketNumber}`;
      const matchingAuction = auctionList.find(auction => auction.chitId === subscriberKey);

      if (matchingAuction) {
        performNavigation(matchingAuction);
      } else {
        alert(`This chit ${subscriberKey} is not in auction anymore"`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in manageBidNow:', error);
      setIsLoading(false);
    }
  };

  const validateEnrolementStatus = (val) => {
    switch (val) {
      case 'APPROVED':
        return false;
      default:
        return true;
    }
  };

  const validateAgreementStatus = (val) => {
    switch (val) {
      case ('COMPLETED', 'APPROVED'):
        return false;
      default:
        return true;
    }
  };

  const performNavigation = (object) => {
    const minVal = (parseInt(object.chitValue) * 0.1) / 100;

    if (validateEnrolementStatus(object.enrollmentStatus) == true) {
      setBottomSheetData({
        title: 'Enrollment is Pending',
        titleColor: '#072E77',
        description: 'Enrollment is pending.\nPlease complete following steps.',
        sendButtonTitle: 'Done',
        descTwoLines: true,
        sendButtonBGColor: '#072E77',
        totalButtons: 1,
        showIcon: false,
        showIconName: 'enroll',
        showSVG: true,
      });
      setShowBottomSheet(true);
      setIsLoading(false);
    } else if (validateAgreementStatus(object.agreementStatus) == true) {
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
      setIsLoading(false);
    } else if (object.reasonNotToBid === 'PLEDGED') {
      setBottomSheetData({
        title: 'Pledged chit',
        titleColor: '#072E77',
        description: 'This chit is pledged. \nnot able to participate in auction.',
        sendButtonTitle: 'Close',
        sendButtonBGColor: '#072E77',
        totalButtons: 1,
        showIcon: false,
        showIconName: 'pledged',
        descTwoLines: true,
        showSVG: true,
      });
      setShowBottomSheet(true);
      setIsLoading(false);
    } else if (object.state != 'live') {
      alert('This chit is ' + object.state);
      setIsLoading(false);
    } else if (object.ticketStatus == 'ACNPS') {
      setBottomSheetData({
        title: 'Clear the Dues.',
        titleColor: '#ff4a00',
        description: 'Clear your last three months dues otherwise your chat will be cancelled.',
        sendButtonTitle: `₹ ${object.totalDue} Pay now`,
        sendButtonBGColor: '#072E77',
        totalButtons: 1,
        tag: 'navigate',
        showIcon: false,
        showIconName: 'clearDues',
        showSVG: true,
        navigateToMyChit: true,
        subscriptionId: object.subscriptionId
      });
      setShowBottomSheet(true);
      setIsLoading(false);
    } else if (minVal < parseInt(object.totalDue)) {
      setBottomSheetData({
        title: 'Clear the Dues',
        titleColor: '#ff4a00',
        description: 'Clear your dues and participate in auction',
        sendButtonTitle: `₹ ${object.totalDue} Pay now`,
        sendButtonBGColor: '#072E77',
        totalButtons: 1,
        tag: 'navigate',
        showIcon: false,
        showIconName: 'clearDues',
        showSVG: true,
        navigateToMyChit: true,
        subscriptionId: object.subscriptionId
      });
      setShowBottomSheet(true);
      setIsLoading(false);
    } else {
      // navigation.navigate('AuctionDetails', {
      //   data: object,
      //   isMyBidDetails: false,
      // });
      setIsLoading(false);
    }
  };

  const navigateAuctionToMyChitDetail = (selectedObj) => {
    if (selectedObj.navigateToMyChit) {
      navigation.navigate('MyChitsNavigator', {
        screen: 'MyChitDetails',
        params: { subscriptionId: selectedObj.subscriptionId }
      });
    }
  };

  const QuickActionsTwo = () => {
    // Check if there's any quick action data
      const hasQuickActions =
      kycStatusQuickAction ||
      (overDueQuickAction && overDueQuickAction.length > 0) ||
      (dueQuickAction && dueQuickAction.length > 0) ||
      (enrollmentStatusQuickAction && enrollmentStatusQuickAction.length > 0) ||
      (agreementStatusQuickAction && agreementStatusQuickAction.length > 0) ||
      (liveQuickAction && liveQuickAction.length > 0) ||
      (newChitQuickAction && newChitQuickAction.length > 0);

    // If no data, return null
    if (!hasQuickActions) {
      return null;
    }
    return (
      <View>
        <View style={styles.mySavingsTopContainer}>
          <LightningSVG width={16} height={16} style={{marginTop: 2}} />
          <Text style={styles.mySavingsTopTitle}>Quick Actions</Text>
        </View>
        <ScrollView
          style={{ paddingLeft: 12, marginTop: 10, flex: 1, flexDirection: 'row' }} 
          horizontal
          showsHorizontalScrollIndicator={true}
          indicatorStyle="white"
        >
          {kycStatusQuickAction &&
          kycStatusQuickAction.status === 'INCOMPLETE' &&
          <View style={[styles.quickActionbackgroundImage]}>
            <View style={[styles.quickActionCardContainer, common_styles.shadowPropQuickAction]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.quickActionMandatoryStepText}>Mandatory step</Text>
                <View style={styles.quickActionRibbon}>
                  <Text style={styles.quickActionRibbonText}>Pending</Text>
                </View>
              </View>
              <Text style={styles.quickActionChitValueText}>Complete KYC</Text>
              <Text style={[styles.quickActionSubscriptionAmountText, styles.marginTop10, styles.marginBotton9]}>
                {'Personal information\nGov. approved document only'}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Document')}
                style={[styles.quickActionSubscribeNowButtonContainer]}
              >
                <Text style={styles.quickActionSubscribeNowText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
          }

          {liveQuickAction && liveQuickAction.map((data, index) => {
            return (
              <View
                style={[styles.quickActionbackgroundImage]}
                key={index}
              >
                <View style={[styles.quickActionCardContainer, common_styles.shadowPropQuickAction]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.quickActionTicketLeftText}
                      numberOfLines={1}
                      ellipsizeMode="tail">{data.subscriberName}</Text>
                    <View style={styles.quickActionRibbonLive}>
                      <Text style={styles.quickActionLiveText}>Live</Text>
                      <BlinkingDot size={4} color={CssColors.green} duration={500} />
                    </View>

                  </View>
                  <Text
                    style={styles.quickActionChitGroupNameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >{data.chitGroupName}-{data.ticketNumber}</Text>
                  <Text style={[styles.quickActionStartDateText, {marginTop: 10}]}>
                    Previous Bid - {'\u20B9'} {formatCurrency(data.lastBidValue)} ({data.lastBidPercentage} %)
                  </Text>
                  <Text style={styles.quickActionStartDateText}>Current Bid - {'\u20B9'} {formatCurrency(data.currentBidValue)} ({data.currentBidPercentage} %)</Text>
                  <TouchableOpacity
                    onPress={() => { manageBidNow(data); }}
                    style={[styles.quickActionSubscribeNowButtonContainer, styles.marginTop17, {justifyContent: 'flex-end'}]}
                  >
                    <Text style={styles.quickActionSubscribeNowText}>Bid now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {overDueQuickAction &&
          overDueQuickAction.map((data, index) => {
            return (
              <View
                style={[styles.quickActionbackgroundImage]}
                key={index}
              >
                <View style={[styles.quickActionCardContainer, common_styles.shadowPropQuickAction]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 8 }}>
                    <Text style={styles.quickActionTicketLeftText}
                      numberOfLines={1}
                      ellipsizeMode="tail">{data.subscriberName}</Text>
                    <View style={styles.quickActionRibbon}>
                      <Text style={styles.quickActionRibbonText}>Overdue</Text>
                    </View>
                  </View>
                  <Text
                    style={styles.quickActionChitGroupNameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >{data.chitId}</Text>
                  <Text style={[styles.quickActionStartDateText, {marginTop: 10}]}>
                    Due date - {dayjs(new Date(parseInt(data.dueDate * 1000))).format('DD-MMM-YYYY')}
                  </Text>
                  <Text style={styles.quickActionStartDateText}>Due amount - {'\u20B9'} {formatCurrency(data.dueAmount)}</Text>
                  <TouchableOpacity
                    onPress={() => navigateToMyChitDetails(data)}
                    style={[styles.quickActionSubscribeNowButtonContainer, styles.marginTop17, {justifyContent: 'flex-end'}]}
                  >
                    <Text style={styles.quickActionSubscribeNowText}>Pay now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {dueQuickAction &&
          dueQuickAction.map((data, index) => {
            return (
              <View
                style={[styles.quickActionbackgroundImage]}
                key={index}
              >
                <View style={[styles.quickActionCardContainer, common_styles.shadowPropQuickAction]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 3 }}>
                    <Text
                      style={styles.quickActionTicketLeftText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {data.subscriberName}
                    </Text>
                    <View style={styles.quickActionRibbon}>
                      <Text style={styles.quickActionRibbonText}>Due</Text>
                    </View>
                  </View>
                  <Text
                    style={styles.quickActionChitGroupNameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >{data.chitId}</Text>
                  <Text style={[styles.quickActionStartDateText, {marginTop: 10}]}>
                    Due date - {dayjs(new Date(parseInt(data.dueDate * 1000))).format('DD-MMM-YYYY')}
                  </Text>
                  <Text style={styles.quickActionStartDateText}>Due amount - {'\u20B9'} {formatCurrency(data.dueAmount)}</Text>
                  <TouchableOpacity
                    onPress={() => navigateToMyChitDetails(data)}
                    style={[styles.quickActionSubscribeNowButtonContainer, styles.marginTop17]}
                  >
                    <Text style={styles.quickActionSubscribeNowText}>Pay now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {enrollmentStatusQuickAction &&
          enrollmentStatusQuickAction.map((data, index) => {
            return (
              <View
                style={[styles.quickActionbackgroundImage]}
                key={index}
              >
                <View style={[styles.quickActionCardContainer, common_styles.shadowPropQuickAction]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.quickActionMandatoryStepText}>Mandatory step</Text>
                    <View style={styles.quickActionRibbon}>
                      <Text style={styles.quickActionRibbonText}>Enrollment pending</Text>
                    </View>
                  </View>
                  <Text
                    style={styles.quickActionChitGroupNameTextTwo}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >{data.chitGroupName}-{data.ticketNumber}</Text>
                  <Text style={[styles.quickActionSubscriptionAmountText, styles.marginTop10, {marginBottom: 6}]}>
                    {'Personal information\nGov. approved document only'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigateToMyChitDetails(data)}
                    style={[styles.quickActionSubscribeNowButtonContainer, {marginTop: 12}]}
                  >
                    <Text style={styles.quickActionSubscribeNowText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {agreementStatusQuickAction &&
          agreementStatusQuickAction.map((data, index) => {
            return (
              <View
                style={[styles.quickActionbackgroundImage]}
                key={index}
              >
                <View style={[styles.quickActionCardContainer, common_styles.shadowPropQuickAction]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.quickActionMandatoryStepText}>Mandatory step</Text>
                    <View style={styles.quickActionRibbon}>
                      <Text style={styles.quickActionRibbonText}>Agreement pending</Text>
                    </View>
                  </View>
                  <Text
                    style={styles.quickActionChitGroupNameTextThree}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >{data.chitGroupName}-{data.ticketNumber}</Text>
                  <Text style={[styles.quickActionSubscriptionAmountText]}>
                    {'Personal information Gov.\napproved documents only'}
                  </Text>
                  <Text style={styles.quickActionSubscriptionAmountTextTwo}> Enrollment request approved</Text>
                  <TouchableOpacity
                    onPress={() => navigateToMyChitDetails(data)}
                    style={[styles.quickActionSubscribeNowButtonContainer, {marginTop: 15}]}
                  >
                    <Text style={styles.quickActionSubscribeNowText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {newChitQuickAction &&
            newChitQuickAction.map((data, index) => {
              return (
                <View
                  style={[styles.quickActionbackgroundImage]}
                  key={index}
                >
                  <View style={[styles.quickActionCardContainer, common_styles.shadowPropQuickAction]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 5 }}>
                      <Text style={styles.quickActionTicketLeftText}>{data.noOfTicketLeft} tickets left</Text>
                      <View style={styles.quickActionRibbon}>
                        <Text style={styles.quickActionRibbonText}>{data && data.tag ? data.tag : 'Popular'}</Text>
                      </View>
                    </View>
                    <Text style={styles.quickActionChitValueText}>{'\u20B9'} {formatCurrency(data.chitValue)} Chit</Text>
                    <Text style={styles.quickActionSubscriptionAmountText}>Subscription - {'\u20B9'} {formatCurrency(data.subscriptionAmount)}</Text>
                    <Text style={[styles.quickActionPopularText, {marginTop: 10}]}>Instalment - {data.noOfInstallment} Months</Text>
                    <Text style={styles.quickActionPopularText}>
                      Start date -{' '}{dayjs(new Date(parseInt(data.startDate * 1000))).format('DD-MMM-YYYY')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigateToNewChitDetails(data)}
                      style={styles.quickActionSubscribeNowButtonContainer}
                    >
                      <Text style={styles.quickActionSubscribeNowText}>Subscribe now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container]}>
      {isLoading ? (
        <SkeletonLoader
          financialCard={true}
          quickAction={true}
          order={[
            { type: 'slider', height: 150 }, 
            'financialCard',
            'quickAction',
            { type: 'slider', height: 130 }, 
            { type: 'slider', height: 100 }
          ]} 
        />
    ) : (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}>
        {isBannerLoading ? (
        <ActivityIndicator
          size="large"
          color={CssColors.textColorSecondary}
        />
        ) : sliderData?.length > 0 ? (
          <View style={{marginHorizontal: 12, marginTop: 12}}>
            <ImageCarousel data={sliderData} />
          </View>
        ) : null}
        <FinancialSummaryCard
          numChits={financealData?.noOfActiveTickets ?? 0}
          totalSavings={formatCurrency(financealData?.totalSavings) ?? 0}
          totalInvested={formatCurrency(financealData?.totalInvested) ?? 0}
          dividendEarned={formatCurrency(financealData?.totalDividends) ?? 0}
        />
        <QuickActionsTwo />
        {isReferralLoading ? (
      <ActivityIndicator
        size="large"
        color={CssColors.textColorSecondary}
      />
    ) : referralBanner ? (
      <Refer />
    ) : null}

    {isKtrsLoading ? (
      <ActivityIndicator
        size="large"
        color={CssColors.textColorSecondary}
      />
    ) : ktrsData ? (
      <Explore />
    ) : null}
        <HomeQuickLinks navigation={navigation} />
        {showBottomSheet && (
            <BottomPopUp
              data={bottomSheetData}
              onClose={() => {
                setShowBottomSheet(false);
              }}
              onSubmit={() => {
                setShowBottomSheet(false);
                navigateAuctionToMyChitDetail(bottomSheetData);
              }}
            />
          )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mySavingsTopContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14
  },
  mySavingsTopTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: CssColors.primaryPlaceHolderColor,
    marginLeft: 5,
  },
  quickActionMandatoryStepText: {
    color: CssColors.errorTextColor,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: 'normal',
  },
  marginTop10: {
    marginTop: 10,
  },
  quickActionChitGroupNameTextTwo: {
    color: CssColors.primaryColor,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 'bold',
    marginTop: 6,
    width: '80%',
  },
  quickActionChitGroupNameTextThree: {
    color: CssColors.primaryColor,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 'bold',
    width: '80%',
    marginTop: 5,
    marginBottom: 5,
  },
  quickActionsTitle: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
  quickActionChitGroupNameText: {
    color: CssColors.primaryColor,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 10,
    width: '85%',
  },
  marginTop20: {
    marginTop: 20,
  },
  marginTop17: {
    marginTop: 17,
  },
  marginBotton9: {
    marginBottom: 9,
  },
  quickActionSubtitleText: {
    fontSize: 10,
    fontWeight: 'normal',
    lineHeight: 16,
    color: CssColors.primaryColor,
    paddingLeft: 10,
    paddingTop: 6,
  },
  quickActionTitleText: {
    paddingTop: 37,
    fontSize: 18,
    paddingLeft: 10,
    fontWeight: 'bold',
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
  },
  quickActionCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
    height: 132,
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: CssColors.white,
  },
  quickActionTicketLeftText: {
    fontSize: 8,
    color: CssColors.primaryPlaceHolderColor,
    lineHeight: 12,
    width: '74%',
  },
  quickActionRibbonText: {
    color: CssColors.errorTextColor,
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  quickActionLiveText: {
    color: CssColors.green,
    fontSize: 9,
    paddingRight: 3
  },
  quickActionTrendingTextTwo: {
    color: CssColors.primaryColor,
    fontSize: 6,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  quickActionChitValueText: {
    color: CssColors.primaryTitleColor,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
  quickActionSubscriptionAmountText: {
    color: CssColors.primaryColor,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: 'normal',
  },
  quickActionSubscriptionAmountTextTwo: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 6,
    lineHeight: 8,
    fontWeight: 'normal',
    marginTop: 8,
  },
  quickActionMandatoryStep: {
    color: CssColors.errorTextColor,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: 'normal',
  },
  quickActionNoOfInstallments: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: 'normal',
    marginTop: 4,
  },
  quickActionStartDateText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: 'normal',
  },
  quickActionPopularText: {
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 6,
    lineHeight: 8,
    fontWeight: 'normal',
  },
  quickActionSubscribeNowButtonContainer: {
    backgroundColor: CssColors.primaryColor,
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRadius: 12,
    position: 'absolute',
    bottom: 10,
    right: 10,
    left: 10,
  },
  quickActionSubscribeNowText: {
    color: CssColors.white,
    fontSize: 8,
    lineHeight: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quickActionbackgroundImage: {
    width: 168,
    height: 132,
    marginRight: 10,
    marginBottom: 8,
  },
  quickActionRibbon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 56, 48, 0.2)',
    borderColor: 'rgba(255, 74, 0, 0.2)',
    borderStyle: 'dotted',
    borderWidth: 1,
    flexDirection: 'row',
  },
  quickActionRibbonLive: {
    paddingLeft: 3,
    borderColor: CssColors.green,
    borderStyle: 'dotted',
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 200, 90, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: CssColors.appBackground,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  centeredView: {
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default Home;
