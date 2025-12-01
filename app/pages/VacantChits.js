import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import { SiteConstants } from "../SiteConstants";
import { Slider } from "@miblanchard/react-native-slider";
import CommonService from "../services/CommonService";
import ChitIconDisplay from "../sharedComp/ChitIconDisplay";
import { useIsFocused } from "@react-navigation/native";
import { formatCurrency, useCustomBackHandler } from "../sharedComp/Utils";
import InfoText from "../sharedComp/InfoText";
import NameTitle from "../sharedComp/NameTitle";
import Icon from "react-native-vector-icons/Entypo";
import DefaultBottomSheet from "../components/DefaultBottomSheet";
import { CacheService, CACHE_CONFIG } from "../sharedComp/CacheService";
import SkeletonLoader from "../components/loaders/SkeletonLoader";
import useNavigationGuard from '../hooks/useNavigationGuard';

const filterData = [
  {
    "heading": "Chit value",
    "data": [
      { "title": "01 - 03 Lakh", "value": "1,3" },
      { "title": "03 - 05 Lakh", "value": "3,5" },
      { "title": "05 - 10 Lakh", "value": "5,10" },
      { "title": "10 - 25 Lakh", "value": "10,25" },
      { "title": "25 - 50 Lakh", "value": "25,50" },
      { "title": "50 - Above", "value": "50,Above" }
    ]
  },
  {
    "heading": "Chit installment in Month",
    "data": [
      { "title": "20 M", "value": "20" },
      { "title": "25 M", "value": "25" },
      { "title": "30 M", "value": "30" },
      { "title": "40 M", "value": "40" },
      { "title": "50 M", "value": "50" },
      { "title": "60 M", "value": "60" },
      { "title": "70 M", "value": "70" },
      { "title": "80 M", "value": "80" },
      { "title": "90 M", "value": "90" },
      { "title": "100 M", "value": "100" },
      { "title": "120 M", "value": "120" }
    ]
  },
  {
    "heading": "Running installments",
    "data": [
      { "title": "01 - 03 M", "value": "1,3" },
      { "title": "03 - 05 M", "value": "3,5" },
      { "title": "05 - 07 M", "value": "5,7" },
      { "title": "07 - 10 M", "value": "7,10" },
      { "title": "10 - 15 M", "value": "10,15" },
      { "title": "15 M - Above", "value": "15,Above" }
    ]
  }
];

const VacantChits = ({ navigation }) => {
  const [finalChitsData, setFinalChitsData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pageSize, setPageSize] = useState(0);
  const [recordsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const isFocused = useIsFocused();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFilterItems, setSelectedFilterItems] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { navigateWithGuard } = useNavigationGuard(navigation);

  const handleSelectItem = (heading, title) => {
    setSelectedFilterItems((prevState) => {
      const updatedState = { ...prevState };

      // Toggle selection: if already selected, remove it; otherwise, set it
      if (prevState[heading] === title) {
        delete updatedState[heading]; // Unselect item
      } else {
        updatedState[heading] = title;
      }

      return Object.keys(updatedState).length ? updatedState : {}; // Reset if empty
    });
  };
  useCustomBackHandler(navigation, false);
  const handleClearAll = async () => {
    setSelectedFilterItems({});

    if (isFilterApplied) {
      setIsLoading(true);
      setFinalChitsData([]);
      setOriginalData([]);
      setHasMore(true);

      // Clear filtered cache when resetting filters
      await CacheService.clearCache(CACHE_CONFIG.vacantChitsFiltered.key);

      // Reset to page 0 and fetch with default filters
      setCurrentPage(0);
      getVacantChits(filterDefault, 0);
      setIsFilterApplied(false);
    }
    // Close the bottom sheet
    setIsVisible(false);
  };

  const handleApplyFilters = async () => {
    // Only apply filters if there are selected items
    if (Object.keys(selectedFilterItems).length === 0) {
      setIsVisible(false);
      return;
    }

    // Clear previous data and reset pagination when applying filters
    setFinalChitsData([]);
    setOriginalData([]);
    const formattedFilters = formatSelectedFilters(selectedFilterItems);

    // Clear filtered cache when changing filters
    await CacheService.clearCache(CACHE_CONFIG.vacantChitsFiltered.key);

    setIsLoading(true);
    setCurrentPage(0);
    setHasMore(true);
    setIsFetchingMore(false);

    // Pass the formatted filters and set filter applied state
    getVacantChits(formattedFilters, 0);
    setIsFilterApplied(true);
    // Close the bottom sheet
    setIsVisible(false);
  };

  const isAnyItemSelected = Object.keys(selectedFilterItems).length > 0;

  function formatSelectedFilters(selectedFilters) {
    let formattedFilters = {
      chitValue: [],
      chitInstallment: selectedFilters["Chit installment in Month"]
        ? extractNumber(selectedFilters["Chit installment in Month"])
        : 0,
      runningInstallment: []
    };

    function extractNumber(value) {
      let number = value.match(/\d+/);
      return number ? Number(number[0]) : 0;
    }

    function processValue(value) {
      if (!value) return [];

      if (value.includes("Above")) {
        let numbers = value.match(/\d+/g);
        return numbers ? [Number(numbers[0]), "Above"] : [];
      }

      let values = value.match(/\d+/g);
      return values ? values.map(v => Number(v)) : [];
    }

    if (selectedFilters["Chit value"]) {
      formattedFilters.chitValue = processValue(selectedFilters["Chit value"]);
    }

    if (selectedFilters["Running installments"]) {
      formattedFilters.runningInstallment = processValue(selectedFilters["Running installments"]);
    }

    return formattedFilters;
  }

  const CustomThumb = (currentMonth) => (
    <View style={common_styles.customThumb}>
      <View style={common_styles.customThumbTextContainer}>
        <Text style={common_styles.customThumbText}>{currentMonth}</Text>
      </View>
    </View>
  );

  const sucscriberLeftCount = (total, remaining) => {
    const count = total - remaining;
    if (count >= 1) {
      return count;
    } else {
      return 0;
    }
  };

  const convertISOStringToMonthDay = (date) => {
    let tempDate = new Date(date);
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let formattedDate =
      tempDate.getDate() +
      "-" +
      month[tempDate.getMonth()] +
      "-" +
      tempDate.getFullYear();
    return formattedDate;
  };

  const editChitsData = async (chitsData) => {
    if (!chitsData || !Array.isArray(chitsData)) return [];

    const newData = chitsData.map((p) =>
      p.id !== null
        ? {
          ...p,
          c_id: p.id,
          c_amount: p.scheme?.schemeDetails?.chitValue,
          c_max_bid_percentage: `Max bid ${p.scheme?.maximumBid}%`,
          c_monthly_quaterly: p.scheme?.installType,
          c_tag: p.tag, // High Dividend,  Popular
          c_tickets_left: `${sucscriberLeftCount(
            p.scheme?.maxSubscribers,
            p.scheme?.noOfSubscribers
          )} ticket left`,
          c_chit_name: p.name,
          c_installments: p.scheme?.duration,
          c_start_date: convertISOStringToMonthDay(p.startDate),
          c_subscription_amount: p.scheme?.installment,
          c_currentInstallment: p.runningInstall,
          c_duration: p.scheme?.duration,
        }
        : p
    );
    return newData;
  };

  const filterDefault =
  {
    "chitValue": [],
    "chitInstallment": 0,
    "runningInstallment": []
  };

  const getVacantChits = async (filters, pageNumber) => {
    const url = `${SiteConstants.API_URL}chit-group/v2/getAllChitsVacant?status=VACANT&recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}`;

    try {
      console.log("▶️ getVacantChits called with:", { filters, pageNumber, url });

      // Determine if it's a default filter
      const isDefaultFilter =
        (filters.chitValue.length === 0) &&
        (filters.chitInstallment === 0) &&
        (filters.runningInstallment.length === 0);

      console.log("🔎 Filter check:", { isDefaultFilter, filters });

      const cacheKey = isDefaultFilter ? CACHE_CONFIG.vacantChits.key : CACHE_CONFIG.vacantChitsFiltered.key;
      const cacheAdditionalKey = `page_${pageNumber}_${JSON.stringify(filters)}`;
      console.log("🗝️ Cache keys:", { cacheKey, cacheAdditionalKey });

      // Try to get data from cache
      let chitsData = null;
      // if (!isRefreshing) {
      //   chitsData = await CacheService.getCachedData(cacheKey, cacheAdditionalKey);
      //   console.log(chitsData ? `✅ Cache hit (page ${pageNumber})` : `❌ Cache miss (page ${pageNumber})`);
      // }

      // If no cached data, fetch from API
      if (!chitsData) {
        console.log("🌐 Calling API for vacant chits...");
        chitsData = await CommonService.commonPost(navigation, url, filters);
        console.log("📥 API Response:", chitsData);

        if (chitsData?.data && !isRefreshing) {
          console.log("💾 Caching API response...");
          await CacheService.setCachedData(cacheKey, chitsData, cacheAdditionalKey);
        }
      }

      // Update pagination info
      const pageSize = chitsData?.tableProperties?.pagination?.pageSize || 0;
      setPageSize(pageSize);
      console.log("📊 Pagination:", { pageSize });

      if (chitsData?.data?.length > 0) {
        console.log(`📦 Received ${chitsData.data.length} records`);
        const manipulatedData = await editChitsData(chitsData.data);
        console.log("🛠️ Manipulated Data:", manipulatedData);

        if (isFilterApplied || pageNumber === 0) {
          console.log("🔄 Replacing data (filter applied or first page)");
          setFinalChitsData(manipulatedData);
          setOriginalData(manipulatedData);
        } else {
          console.log("➕ Appending unique data (subsequent page)");
          setFinalChitsData((prevData) => {
            const existingIds = new Set(prevData.map(item => item.id));
            const uniqueNewData = manipulatedData.filter(item => !existingIds.has(item.id));
            console.log("🧹 Deduplication:", { existingCount: prevData.length, newCount: manipulatedData.length, uniqueAdded: uniqueNewData.length });
            return [...prevData, ...uniqueNewData];
          });

          setOriginalData((prevData) => {
            const existingIds = new Set(prevData.map(item => item.id));
            const uniqueNewData = manipulatedData.filter(item => !existingIds.has(item.id));
            return [...prevData, ...uniqueNewData];
          });
        }

        const hasMorePages = manipulatedData.length >= recordsPerPage;
        setHasMore(hasMorePages);
        console.log("📍 Has more pages:", hasMorePages);
      } else {
        console.log("⚠️ No data found");
        if (pageNumber === 0) {
          setFinalChitsData([]);
          setOriginalData([]);
        }
        setHasMore(false);
      }

      // Reset loading states
      console.log("✅ Resetting loading states...");
      setIsLoading(false);
      setIsFetchingMore(false);
      setIsRefreshing(false);

    } catch (error) {
      console.error("❌ Error fetching vacant chits:", error);

      setIsLoading(false);
      setIsFetchingMore(false);
      setIsRefreshing(false);
      setHasMore(false);

      if (pageNumber === 0) {
        console.log("🧹 Clearing data due to error (first page)");
        setFinalChitsData([]);
        setOriginalData([]);
      }
    }
  };


  const loadMoreData = () => {
    // Only load more if we're not already loading, have more data, and not filtering
    if (!isFetchingMore && hasMore && !isLoading) {
      setIsFetchingMore(true);
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      setFinalChitsData([]);
      setOriginalData([]);
      setCurrentPage(0);
      setHasMore(true);
      setIsFilterApplied(false);
      setSelectedFilterItems({});

      getVacantChits(filterDefault, 0);
    }
  }, [isFocused]);

  useEffect(() => {
    if (currentPage >= 0 && currentPage <= pageSize) {
      const formattedFilters = isFilterApplied
        ? formatSelectedFilters(selectedFilterItems)
        : filterDefault;

      getVacantChits(formattedFilters, currentPage);
    }

    if (currentPage > pageSize) {
      setHasMore(false);
      setIsFetchingMore(false);
    }
  }, [currentPage]);

  const subscribeNow = useCallback((id) => {
    navigateWithGuard("VacantChitDetails", { id });
  }, [navigateWithGuard]);

  const chitClicked = useCallback((id) => {
    navigateWithGuard("VacantChitDetails", { id });
  }, [navigateWithGuard]);

  const refreshData = async () => {
    setIsRefreshing(true);
    setFinalChitsData([]);
    setOriginalData([]);
    setCurrentPage(0);
    setHasMore(true);

    // Clear caches on manual refresh
    if (isFilterApplied) {
      await CacheService.clearCache(CACHE_CONFIG.vacantChitsFiltered.key);
      const formattedFilters = formatSelectedFilters(selectedFilterItems);
      getVacantChits(formattedFilters, 0);
    } else {
      await CacheService.clearCache(CACHE_CONFIG.vacantChits.key);
      getVacantChits(filterDefault, 0);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && !isRefreshing ? (
        <SkeletonLoader cardTypeTwo={4} />
      ) : (
        <>
          <View style={{ marginTop: 15, flex: 1 }}>
            {finalChitsData.length ? (
              <FlatList
                data={finalChitsData}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={refreshData}
                    colors={[CssColors.textColorSecondary]}
                  />
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[common_styles.chit_container, common_styles.shadowProp]}
                    onPress={() => chitClicked(item?.id)}
                  >
                    <View style={common_styles.chit_container_row1}>
                      <View style={common_styles.chit_container_row1_left}>
                        <ChitIconDisplay
                          chitValue={item.scheme.schemeDetails.chitValue}
                          imageStyle={common_styles.new_chits_logo_icon}
                        />
                        <View style={{ flexDirection: "column", paddingTop: 5 }}>
                          <Text style={common_styles.new_chits_amount_text}>
                            {"\u20B9"} {formatCurrency(item?.scheme?.schemeDetails?.chitValue)}
                            <Text
                              style={common_styles.new_chits_amount_inner_text}
                            >
                              {" "}
                              Chit
                            </Text>
                          </Text>
                          <View style={{ flexDirection: "row", marginTop: 4 }}>
                            <Text style={common_styles.new_chits_sub_tags}>
                              {item?.groupName}
                            </Text>
                            <Text style={common_styles.new_chits_sub_tags}>
                              Max bid {item?.scheme?.maximumBid}%
                            </Text>
                            <Text style={common_styles.new_chits_sub_tags}>
                              {item?.scheme?.auctionType}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
                        <ImageBackground
                          source={require("../../assets/icons/tag_bg.png")}
                          resizeMode="contain"
                          style={common_styles.new_chits_tag_container}
                        >
                          <Text style={common_styles.new_chits_tag_text}>{item?.tag}</Text>
                        </ImageBackground>
                        <Text
                          style={[
                            common_styles.new_chits_tickets_left,
                            { marginTop: 7, marginRight: 7 },
                          ]}
                        >
                          {item?.remainingTickets ?? ""} ticket left
                        </Text>
                      </View>
                    </View>
                    <View style={common_styles.chit_container_row2}>
                      <View>
                        <NameTitle title='Subscription' />
                        <InfoText
                          content={formatCurrency(item?.scheme?.subscriptionAmount) ?? '--'}
                          isCurrency={true}
                          reducedFontText={`/M`}
                          reducedFontSizeStyle={{ fontSize: 8 }}
                        />
                      </View>
                      <View style={common_styles.vertical_line}></View>
                      <View>
                        <NameTitle title='Get Dividend' />
                        <InfoText
                          content={formatCurrency(item?.dividend) ?? '--'}
                          isCurrency={true}
                          colorStyle={styles.orangeText}
                        />
                      </View>
                      <View style={common_styles.vertical_line}></View>
                      <View style={common_styles.chit_container_row2_inner_container_last} >
                        <NameTitle title='You paying now' style={{ color: '#504F4F' }} />
                        {/* added seperate text component strike  */}
                        <Text style={[common_styles.infoText, { fontWeight: 'bold' }]}>
                          ₹ {formatCurrency(item?.netPayable)}{' '}
                          <View style={{ position: 'relative', display: 'inline', marginBottom: 6 }}>
                            <Text style={{ textDecorationLine: 'line-through', fontSize: 10, color: CssColors.lightGreyTwo, }} >
                              ₹ {formatCurrency(item?.totalPayable)}
                            </Text>
                            <View style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: 'red', }} />
                          </View>
                        </Text>
                      </View>
                    </View>
                    <View style={common_styles.chit_container_row3}>
                      <View style={common_styles.chit_container_row3_vacant}>
                        <Text style={styles.runningInstall}>
                          Running{"\n"}Instalment
                        </Text>
                        <View style={{ paddingTop: 3, flexDirection: "row", alignItems: 'center' }}>
                          <Text style={common_styles.vacant_chit_text2}>01</Text>
                          <View style={common_styles.sliderContainer}>
                            <Slider
                              minimumValue={1}
                              maximumValue={item?.scheme?.schemeDetails?.numberOfInstallment || 100}
                              step={1}
                              minimumTrackTintColor="#FF4A00"
                              maximumTrackTintColor="#8F9BB3"
                              disabled={true}
                              value={item?.runningInstallment || 1}
                              renderThumbComponent={() => CustomThumb(item?.runningInstallment || 1)}
                              trackClickable={false}
                            />
                          </View>
                          <Text style={common_styles.vacant_chit_text2}>
                            {item?.scheme?.schemeDetails?.numberOfInstallment || 100}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.new_chits_primary_button_container}
                        onPress={() => subscribeNow(item.id)}
                      >
                        <View style={styles.buttonContent}>
                          <Text style={styles.new_chits_primary_button_text}>Subscribe</Text>
                          <View style={styles.circleIcon}>
                            <Icon name="chevron-thin-right" size={10} color={CssColors.white} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {item?.numberOfsubscriber ? (
                      <View
                        style={styles.chit_container_subscriber_count}
                      >
                        <Text style={styles.currentlyText}>
                          Currently there are {item?.numberOfsubscriber}{" "}
                          subscribers.
                        </Text>
                      </View>
                    ) : (
                      <></>
                    )}
                  </TouchableOpacity>
                )}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  isFetchingMore && hasMore ? (
                    <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
                  ) : !hasMore && finalChitsData?.length > 0 ? (
                    <Text style={{ textAlign: "center", color: 'black', marginVertical: 20 }}>No more data to load</Text>
                  ) : null
                }
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ textAlign: "center", color: 'black' }}>
                  {isFilterApplied ? "No matching data found. Try different filters." : "No data available"}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.floatingWrapper}
              onPress={() => setIsVisible(true)}
              activeOpacity={0.7}
            >
              <Image
                style={{ tintColor: CssColors.white, height: 30, width: 30 }}
                source={require('../../assets/icons/filter.png')}
              />
              {isFilterApplied && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {Object.keys(selectedFilterItems).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <DefaultBottomSheet
        visible={isVisible}
        onClose={() => {
          if (!isFilterApplied) {
            setSelectedFilterItems({});
          }
          setIsVisible(false);
        }}
        height={'75%'} // or '50%' or 'auto'
      >
        {/* Your content here */}
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
          </View>

          <ScrollView
            style={styles.filterScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.filterScrollViewContent}
          >
            {filterData.map((item, index) => (
              <View key={index} style={styles.filterSection}>
                <Text style={styles.filterHeading}>
                  {item.heading}
                </Text>
                <View style={styles.filterOptionsContainer}>
                  {item?.data?.map((filterItem, subIndex) => {
                    const isSelected = selectedFilterItems[item?.heading] === filterItem?.title;
                    return (
                      <TouchableOpacity
                        key={subIndex}
                        onPress={() => handleSelectItem(item.heading, filterItem.title)}
                        style={[
                          styles.filterOption,
                          isSelected && styles.filterOptionSelected
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            isSelected && styles.filterOptionTextSelected
                          ]}
                        >
                          {filterItem?.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity
              onPress={handleClearAll}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApplyFilters}
              disabled={!isAnyItemSelected}
              style={[
                styles.actionButton,
                styles.applyButton,
                !isAnyItemSelected && styles.disabledButton
              ]}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DefaultBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
  },
  filterContainer: {
    flex: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: CssColors.homeDetailsBorder,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CssColors.primaryColor,
  },
  clearAllText: {
    color: CssColors.textColorSecondary,
    fontSize: 14,
  },
  filterScrollView: {
    flex: 1,
  },
  filterScrollViewContent: {
    paddingBottom: 10,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterHeading: {
    color: CssColors.primaryColor,
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: CssColors.primaryColor,
    borderColor: CssColors.primaryColor,
  },
  filterOptionText: {
    fontSize: 12,
    color: CssColors.primaryColor,
  },
  filterOptionTextSelected: {
    color: CssColors.white,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CssColors.homeDetailsBorder,
  },
  actionButton: {
    borderRadius: 5,
    paddingVertical: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: CssColors.primaryColor,
  },
  cancelButtonText: {
    color: CssColors.primaryColor,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: CssColors.primaryColor,
  },
  disabledButton: {
    backgroundColor: CssColors.lightGreyTwo,
  },
  applyButtonText: {
    color: CssColors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  floatingWrapper: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: CssColors.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: CssColors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: CssColors.primaryColor,
    fontSize: 12,
    fontWeight: 'bold',
  },
  new_chits_primary_button_container: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: CssColors.textColorSecondary,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: CssColors.white,
    padding: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  new_chits_primary_button_text: {
    color: CssColors.textColorSecondary,
    fontSize: 8,
    fontWeight: "600",
    paddingLeft: 10,
    paddingRight: 5
  },
  circleIcon: {
    backgroundColor: CssColors.textColorSecondary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    color: CssColors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  orangeText: {
    color: CssColors.textColorSecondary,
  },
  scrollView: {
    backgroundColor: CssColors.new_chits_background,
  },
  currentlyText: {
    color: CssColors.primaryTitleColor,
    fontSize: 8
  },
  primaryColorText: {
    color: CssColors.textColorSecondary,
  },
  tagsContainer: {
    backgroundColor: 'white'
  },
  fontsize_8: {
    fontSize: 8,
  },
  strikeoutText: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: CssColors.textColorSecondary,
  },
  greyText: {
    color: CssColors.primaryBorder,
  },
  runningInstall: { color: CssColors.lightGreyTwo, fontSize: 8, marginRight: 5 },
  chit_container_subscriber_count: {
    backgroundColor: CssColors.lightGreyFive,
    paddingLeft: 20,
    paddingBottom: 4,
    color: CssColors.primaryColor,
    fontSize: 8,
    lineHeight: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: -10,
  },
  fontWeight600: { fontWeight: "600" },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: 150
  },
  buttonClose: {
    backgroundColor: CssColors.primaryColor,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
});

export default VacantChits;