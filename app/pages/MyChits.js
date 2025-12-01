import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  BackHandler
} from "react-native";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import CommonService from "../services/CommonService";
import { SiteConstants } from "../SiteConstants";
import { convertISOStringToMonthDay, formatCurrency, useCustomBackHandler } from "../sharedComp/Utils";
import NoActiveData from "../sharedComp/NoActiveData";
import { useIsFocused } from "@react-navigation/native";
import MyChitTopIconAndSlider from "../sharedComp/MyChitTopIconAndSlider";
import InfoText from "../sharedComp/InfoText";
import NameTitle from "../sharedComp/NameTitle";
import SkeletonLoader from "../components/loaders/SkeletonLoader";
import useNavigationGuard from '../hooks/useNavigationGuard';
import {CacheService, CACHE_CONFIG} from '../sharedComp/CacheService';

const MyChits = ({route, navigation}) => {
  const {isFromPayment} = route?.params;

  // State management
  const [finalChitsData, setFinalChitsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [recordsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  const isFocused = useIsFocused();
  const {navigateWithGuard} = useNavigationGuard(navigation);

  // Refs for performance and preventing infinite loops
  const abortControllerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const hasFetchedOnFocusRef = useRef(false);

  useCustomBackHandler(navigation, false);

  // Static language labels
  const languageLabels = useMemo(
    () => ({
      earnDividend: {label: 'Dividend earned'},
      auctionEndDate: {label: 'Auction end date'},
      totalDue: {label: 'Total due'},
      status: {label: 'Status'},
      payDueButton: {label: 'Pay due'},
    }),
    [],
  );

  // Stable data fetching function - removed all problematic dependencies
  const getMychits = useCallback(
    async (reset = false, pageOverride = null) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Use current state values or overrides
      const pageToFetch =
        pageOverride !== null ? pageOverride : reset ? 0 : currentPage;

      if (reset) {
        setFinalChitsData([]);
        setCurrentPage(0);
        setHasMore(true);
        setError(null);
      }

      // Prevent duplicate fetches
      if (!reset && (!hasMore || isFetchingMore)) {
        return;
      }

      const cacheKey = CACHE_CONFIG.subscribedChits.key;
      const additionalKey = `status=ACTIVE|rpp=${recordsPerPage}|page=${pageToFetch}`;
      await CacheService.clearAllCache();

      setIsFetchingMore(true);
      setError(null);

      try {
        // Try cache first (for page 0 only)
        if (pageToFetch === 0) {
          try {
            const cached = await CacheService.getCachedData(
              cacheKey,
              additionalKey,
            );
            if (cached?.length) {
              setFinalChitsData(cached);
              console.log(`🚀 ~ MyChits ~ cached:`, cached);
              if (isInitialLoadRef.current) {
                setIsLoading(false);
              }
            }
          } catch (cacheError) {
            console.warn(
              'Cache read failed, continuing with API call:',
              cacheError,
            );
          }
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const url = `${SiteConstants.API_URL}chit-group/v2/fetchSubscribedChits?status=ACTIVE&recordsPerPage=${recordsPerPage}&pageNumber=${pageToFetch}`;
        console.log(`🚀 ~ MyChits ~ recordsPerPage:`, recordsPerPage);
        console.log('🔗 Final API URL:', url);
        const chitDataWithForeman = await CommonService.commonGet(
          navigation,
          url,
        );
        console.log(`🚀 ~ MyChits ~ chitDataWithForeman:`, chitDataWithForeman);

        // Validate API response
        if (!chitDataWithForeman || !Array.isArray(chitDataWithForeman.data)) {
          throw new Error('Invalid API response structure');
        }
        

        const myChitData =
          chitDataWithForeman.data.filter(item => !item.foremanTicket) || [];
        console.log(`🚀 ~ MyChits ~ myChitData:`, myChitData);

        // Cache the fresh data
        if (pageToFetch === 0 && myChitData.length > 0) {
          CacheService.setCachedData(cacheKey, myChitData, additionalKey).catch(
            err => {
              console.warn('Cache write failed:', err);
            },
          );
        }

        // Update state efficiently
        setFinalChitsData(prevData => {
          if (reset || pageToFetch === 0) {
            return myChitData;
          }

          // Prevent duplicates when loading more
          const existingIds = new Set(
            prevData.map(item => item.subscriptionId),
          );
          const newItems = myChitData.filter(
            item => !existingIds.has(item.subscriptionId),
          );
          return [...prevData, ...newItems];
        });

        console.log(`🚀 ~ MyChits ~ myChitData:`, myChitData);
        // Update pagination state
        setHasMore(myChitData.length >= recordsPerPage);
        const totalPagesFromApi =
          chitDataWithForeman?.tableProperties?.pagination?.pageSize || 0;
        console.log(`🚀 ~ MyChits ~ totalPagesFromApi:`, totalPagesFromApi);
        setTotalPages(totalPagesFromApi);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching mychits:', error);
          setError(error.message || 'Failed to load data');
          setHasMore(false);

          // If it's the initial load and we have no data, ensure loading stops
          if (isInitialLoadRef.current) {
            setIsLoading(false);
          }
        }
      } finally {
        setIsFetchingMore(false);
        setIsLoading(false);
        abortControllerRef.current = null;
        isInitialLoadRef.current = false;
      }
    },
    [navigation, recordsPerPage],
  ); // Only navigation and recordsPerPage as dependencies

  // Handle focus changes - simplified to prevent infinite loops
  useEffect(() => {
    if (isFocused && !hasFetchedOnFocusRef.current) {
      hasFetchedOnFocusRef.current = true;
      isInitialLoadRef.current = true;
      setIsLoading(true);
      setError(null);
      setCurrentPage(0);
      getMychits(true, 0);
    }

    if (!isFocused) {
      hasFetchedOnFocusRef.current = false;
      // Cancel any pending requests when losing focus
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [isFocused, getMychits]);

  // Handle payment redirect - simplified
  useEffect(() => {
    if (isFromPayment !== undefined && isFromPayment && isFocused) {
      getMychits(true, 0);
    }
  }, [isFromPayment, isFocused, getMychits]);

  // Handle pagination - only trigger when currentPage changes and it's not initial load
  useEffect(() => {
    if (
      currentPage > 0 &&
      !isInitialLoadRef.current &&
      hasMore &&
      !isFetchingMore
    ) {
      getMychits(false, currentPage);
    }
  }, [currentPage, getMychits]); // Added getMychits back to ensure proper function reference

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    setFinalChitsData([]);
    setIsLoading(true);

    setTimeout(() => {
      getMychits(true, 0).finally(() => {
        setRefreshing(false);
      });
    }, 300);
  }, [getMychits]);

  // Load more data handler - fixed to directly call getMychits
  const loadMoreData = useCallback(() => {
    if (
      !isFetchingMore &&
      hasMore &&
      !isLoading &&
      finalChitsData.length > 0 &&
      !isInitialLoadRef.current
    ) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      // ✅ This is the crucial fix: Direct API call instead of waiting for useEffect
      getMychits(false, nextPage);
    }
  }, [
    isFetchingMore,
    hasMore,
    isLoading,
    finalChitsData.length,
    currentPage,
    getMychits,
  ]);
  console.log(`🚀 ~ MyChits ~ finalChitsData:`, finalChitsData);

  // Navigation handler
  const chitClicked = useCallback(
    item => {
      if (!item || !item.subscriptionId || item.status === 'CANCELLED') return;

      navigateWithGuard('MyChitsNavigator', {
        screen: 'MyChitDetails',
        params: {subscriptionId: item.subscriptionId},
      });
    },
    [navigateWithGuard],
  );

  // Memoized render item
  const renderChitItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={[
          common_styles.chit_container,
          common_styles.shadowProp,
          styles.paddingLeft_0,
          item?.status === 'CANCELLED' && styles.disabledRow,
        ]}
        onPress={() => chitClicked(item)}
        disabled={item?.status === 'CANCELLED'}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Chit ${item.groupName || 'Unknown'}, Amount ${
          formatCurrency(item?.chitValue) || 'Unknown'
        }, Status ${item.status || 'Unknown'}`}
        accessibilityHint={
          item?.status !== 'CANCELLED'
            ? 'Tap to view chit details'
            : 'This chit is cancelled'
        }>
        <View style={styles.paddingLeft_0}>
          <MyChitTopIconAndSlider
            chitAmount={item.chitValue ?? '--'}
            chitName={item.groupName ?? '--'}
            chitGroupName={item.memberName ?? '--'}
            runningInstall={item.runningInstall ?? '--'}
            numberOfInstallment={item.numberOfInstallment ?? '--'}
          />
        </View>

        {/* Row 2 */}
        <View
          style={[common_styles.chit_container_row2, styles.paddingLeft_10]}>
          <View>
            <NameTitle title="Chit value" />
            <InfoText
              content={formatCurrency(item?.chitValue) ?? '-'}
              isCurrency={true}
              isBold={true}
            />
          </View>
          <View style={common_styles.vertical_line} />
          <View>
            <NameTitle title={languageLabels.earnDividend.label} />
            <InfoText
              content={formatCurrency(item?.earnDividend) ?? '-'}
              isCurrency={true}
              colorStyle={styles.greenText}
            />
          </View>
          <View style={common_styles.vertical_line} />
          <View>
            <NameTitle title={languageLabels.auctionEndDate.label} />
            <InfoText
              content={convertISOStringToMonthDay(
                item.auctionEndDateTime ?? '--',
              )}
            />
          </View>
          <View style={common_styles.vertical_line} />
          <View style={common_styles.chit_container_row2_inner_container_last}>
            <NameTitle title={languageLabels.totalDue.label} />
            <InfoText
              content={formatCurrency(item?.totalDue) ?? '-'}
              isCurrency={true}
              isBold={true}
              colorStyle={styles.orangeText}
            />
          </View>
        </View>

        {/* Row 3 */}
        <View
          style={[
            common_styles.chit_container_row3_mychit,
            styles.paddingLeft_10,
          ]}>
          <View style={common_styles.flex_row}>
            <Text style={common_styles.mychitStatusText}>
              {languageLabels.status.label}
            </Text>
            <Text
              style={[common_styles.mychitStatusTextTwo, styles.paddingLeft_5]}>
              {item.status}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              common_styles.payDueButton,
              item?.status === 'CANCELLED' && styles.disabledButton,
            ]}
            onPress={() => chitClicked(item)}
            disabled={item?.status === 'CANCELLED'}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${languageLabels.payDueButton.label} for ${
              item.groupName || 'this chit'
            }`}>
            <Text style={common_styles.payDueButtonText}>
              {languageLabels.payDueButton.label}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enrollment status */}
        {item.enrollmentAgreementStatus &&
          item.enrollmentAgreementStatus.trim() !== '' &&
          item.enrollmentAgreementStatus !== ' ' && (
            <View
              style={[
                common_styles.chit_container_subscriber_count,
                styles.paddingLeft_10,
              ]}>
              <Text style={common_styles.myChitEnrollmentText}>
                {item.enrollmentAgreementStatus}
              </Text>
            </View>
          )}
      </TouchableOpacity>
    ),
    [chitClicked, languageLabels],
  );

  // Footer component with better loading state handling
  const renderFooter = useCallback(() => {
    if (isFetchingMore && finalChitsData.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator
            size="large"
            color={CssColors.textColorSecondary}
            accessible={true}
            accessibilityLabel="Loading more chits"
          />
          <Text style={styles.loadingText}>Loading more chits...</Text>
        </View>
      );
    }

    if (!hasMore && finalChitsData.length > 0) {
      return (
        <Text
          style={styles.noMoreDataText}
          accessible={true}
          accessibilityRole="text">
          No more chits to load
        </Text>
      );
    }

    return <View style={{height: 20}} />; // Add some bottom spacing
  }, [isFetchingMore, hasMore, finalChitsData.length]);

  // Error state
  if (error && finalChitsData.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load chits</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              getMychits(true, 0);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Retry loading chits">
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && finalChitsData.length === 0 ? (
        <SkeletonLoader cardTypeTwo={4} />
      ) : (
        <View style={styles.contentContainer}>
          {finalChitsData.length > 0 ? (
            <FlatList
              data={finalChitsData}
              renderItem={renderChitItem}
              keyExtractor={(item, index) =>
                item.subscriptionId || index.toString()
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[CssColors.primaryColor]}
                />
              }
              ListEmptyComponent={
                <NoActiveData
                  contentTitle="No active chit available"
                  contetsubTitle="Select new chit"
                />
              }
              ListFooterComponent={renderFooter}
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.2}
              maxToRenderPerBatch={8}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={true}
              windowSize={10}
              initialNumToRender={5}
              accessible={true}
              accessibilityLabel="List of your active chits"
              // Debug pagination
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
            />
          ) : (
            <NoActiveData
              contentTitle="No active chit available"
              contetsubTitle="Select new chit"
              buttonTitle="Find new chits"
              iconName="findNewChit"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    marginTop: 15,
    flex: 1,
  },
  paddingLeft_10: {
    paddingLeft: 10,
  },
  paddingLeft_5: {
    paddingLeft: 5,
  },
  paddingLeft_0: {
    paddingLeft: 0,
  },
  greenText: {
    color: CssColors.green,
  },
  orangeText: {
    color: CssColors.textColorSecondary,
  },
  disabledRow: {
    opacity: 0.3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: CssColors.textColorSecondary || '#666',
  },
  noMoreDataText: {
    textAlign: 'center',
    color: 'black',
    marginVertical: 20,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: CssColors.textColorSecondary || '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubText: {
    fontSize: 14,
    color: CssColors.textColorSecondary || '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: CssColors.primaryColor || '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyChits;
