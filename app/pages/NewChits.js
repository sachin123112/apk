import {
  View,
  Text,
  SafeAreaView,
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
import CommonService from "../services/CommonService";
import { certificateData, formatCurrency, useCustomBackHandler } from "../sharedComp/Utils";
import ChitIconDisplay from "../sharedComp/ChitIconDisplay";
import { useIsFocused } from "@react-navigation/native";
import PDFIconSVG from "../pages/svgs/PDFIconTwoSVG";
import dayjs from "dayjs";
import { getObjectData } from "../sharedComp/AsyncData";
import InfoText from "../sharedComp/InfoText";
import NameTitle from "../sharedComp/NameTitle";
import Icon from "react-native-vector-icons/Entypo";
import { CacheService, CACHE_CONFIG } from "../sharedComp/CacheService";
import SkeletonLoader from "../components/loaders/SkeletonLoader";
import DefaultBottomSheet from "../components/DefaultBottomSheet";
import useNavigationGuard from '../hooks/useNavigationGuard';

const filterData = [
  {
    heading: "Chit value",
    data: [
      { title: "01 - 03 Lakh", value: "1,3" },
      { title: "03 - 05 Lakh", value: "3,5" },
      { title: "05 - 10 Lakh", value: "5,10" },
      { title: "10 - 25 Lakh", value: "10,25" },
      { title: "25 - 50 Lakh", value: "25,50" },
      { title: "50 - Above", value: "50,Above" },
    ],
  },
  {
    heading: "Chit installment in Month",
    data: [
      { title: "20 M", value: "20" },
      { title: "25 M", value: "25" },
      { title: "30 M", value: "30" },
      { title: "40 M", value: "40" },
      { title: "50 M", value: "50" },
      { title: "60 M", value: "60" },
      { title: "70 M", value: "70" },
      { title: "80 M", value: "80" },
      { title: "90 M", value: "90" },
      { title: "100 M", value: "100" },
      { title: "120 M", value: "120" },
    ],
  },

];

const NewChits = ({ navigation }) => {
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("All");
  const [finalChitsData, setFinalChitsData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pageSize, setPageSize] = useState(0);
  const [recordsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedFilterItems, setSelectedFilterItems] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const isFocused = useIsFocused();
  const { navigateWithGuard } = useNavigationGuard(navigation);

  useCustomBackHandler(navigation, false);

  const filterDefault = {
    chitValue: [],
    chitInstallment: 0,
    runningInstallment: []
  };

  const formatSelectedFilters = (selectedFilters) => {
    let formattedFilters = {
      chitValue: [],
      chitInstallment: selectedFilters["Chit installment in Month"]
        ? extractNumber(selectedFilters["Chit installment in Month"])
        : 0,
      runningInstallment: [],
    };

    function extractNumber(value) {
      const number = value.match(/\d+/);
      return number ? Number(number[0]) : 0;
    }

    function processValue(value) {
      if (!value) return [];

      if (value.includes("Above")) {
        const numbers = value.match(/\d+/g);
        return numbers ? [Number(numbers[0]), "Above"] : [];
      }

      const values = value.match(/\d+/g);
      return values ? values.map((v) => Number(v)) : [];
    }

    if (selectedFilters["Chit value"]) {
      formattedFilters.chitValue = processValue(selectedFilters["Chit value"]);
    }

    if (selectedFilters["Running installments"]) {
      formattedFilters.runningInstallment = processValue(
        selectedFilters["Running installments"]
      );
    }

    return formattedFilters;
  };

  const handleSelectItem = (heading, title) => {
    setSelectedFilterItems((prevState) => {
      const updatedState = { ...prevState };

      if (prevState[heading] === title) {
        delete updatedState[heading];
      } else {
        updatedState[heading] = title;
      }

      return Object.keys(updatedState).length ? updatedState : {};
    });
  };

  const closeFilterSheet = useCallback(() => {
    if (!isFilterApplied) {
      setSelectedFilterItems({});
    }
    setIsFilterVisible(false);
  }, [isFilterApplied]);

  const handleClearAll = async () => {
    setSelectedFilterItems({});

    if (isFilterApplied) {
      setIsLoading(true);
      setFinalChitsData([]);
      setOriginalData([]);
      setHasMore(true);

      // Clear filtered cache when resetting filters
      await CacheService.clearCache(CACHE_CONFIG.newChitsFiltered.key);

      setCurrentPage(0);
      getNewChits(filterDefault, 0, activeTag);
      setIsFilterApplied(false);
    }

    closeFilterSheet();
  };

  const handleApplyFilters = async () => {
    if (Object.keys(selectedFilterItems).length === 0) {
      setIsFilterVisible(false);
      return;
    }

    setFinalChitsData([]);
    setOriginalData([]);
    const formattedFilters = formatSelectedFilters(selectedFilterItems);

    const cacheKey = CACHE_CONFIG.newChitsFiltered?.key || CACHE_CONFIG.newChits.key;
    await CacheService.clearCache(cacheKey);

    setIsLoading(true);
    setCurrentPage(0);
    setHasMore(true);
    setIsFetchingMore(false);

    getNewChits(formattedFilters, 0, activeTag);
    setIsFilterApplied(true);
    setIsFilterVisible(false);
  };

  const isAnyItemSelected = Object.keys(selectedFilterItems).length > 0;

  const initializeData = async () => {
    setIsLoading(true);
    try {
      // First fetch tags - these change less frequently, so we can consider caching them
      const tagsUrl = `${SiteConstants.API_URL}page/getConfiguration?pageName=CHITGROUP_TAG&serviceType=ADMIN`;
      const tagsKey = CACHE_CONFIG.chitGroupTags.key;

      // Check if we have cached tags
      let tagResponse = await CacheService.getCachedData(tagsKey);

      if (!tagResponse) {
        // If not in cache, fetch from API
        tagResponse = await CommonService.commonGet(navigation, tagsUrl);
        // Cache the tags if valid
        if (tagResponse?.dropDownMasterList?.chitgrouptags) {
          await CacheService.setCachedData(tagsKey, tagResponse);
        }
      } else {
      }

      const tagValues = tagResponse?.dropDownMasterList?.chitgrouptags?.map(tag => tag.value) || [];
      setTags(["All", ...tagValues]);

      await getNewChits(filterDefault, 0, "All");
    } catch (error) {
      console.error("Error initializing data:", error);
      setTags(["All"]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNewChits = async (filters, pageNumber, selectedTag) => {
  const baseUrl = `${SiteConstants.API_URL}chit-group/v2/getNewChits?status=NEW&recordsPerPage=${recordsPerPage}&pageNumber=${pageNumber}`;
  const url = selectedTag === "All" ? baseUrl : `${baseUrl}&tag=${selectedTag}`;

  try {

    const isDefaultFilter =
      (filters.chitValue.length === 0) &&
      (filters.chitInstallment === 0) &&
      (filters.runningInstallment.length === 0);


    const cacheKey = isDefaultFilter ? CACHE_CONFIG.newChits.key : CACHE_CONFIG.newChitsFiltered.key;
    const cacheAdditionalKey = `page_${pageNumber}_tag_${selectedTag}_${JSON.stringify(filters)}`;

    let chitsData = null;

    // Try to get cached data first (only if not refreshing)
    if (!isRefreshing) {
      chitsData = await CacheService.getCachedData(cacheKey, cacheAdditionalKey);
      if (chitsData) {
        
        const pageSize = chitsData?.tableProperties?.pagination?.pageSize || 0;
        setPageSize(pageSize);
        
        if (isFilterApplied || pageNumber === 0) {
          setFinalChitsData(chitsData.data || []);
          setOriginalData(chitsData.data || []);
        } else {
          setFinalChitsData((prevData) => {
            const existingIds = new Set(prevData.map(item => item.id));
            const uniqueNewData = (chitsData.data || []).filter(item => !existingIds.has(item.id));
            return [...prevData, ...uniqueNewData];
          });

          setOriginalData((prevData) => {
            const existingIds = new Set(prevData.map(item => item.id));
            const uniqueNewData = (chitsData.data || []).filter(item => !existingIds.has(item.id));
            return [...prevData, ...uniqueNewData];
          });
        }
        
        setHasMore((chitsData.data?.length || 0) >= recordsPerPage);
        setIsLoading(false);
        setIsFetchingMore(false);
        return;
      }
    }    
    // Sse POSTwith filters as rreequst bodsthe AtheAPI
    chitsData = await CommonService.commonPost(navigation, url, filters);
    // Cache the response if valid
    if (chitsData?.data && !isRefreshing) {
      await CacheService.setCachedData(cacheKey, chitsData, cacheAdditionalKey);
    }

    const pageSize = chitsData?.tableProperties?.pagination?.pageSize || 0;
    setPageSize(pageSize);

    if (chitsData?.data?.length > 0) {

      if (isFilterApplied || pageNumber === 0) {
        setFinalChitsData(chitsData.data);
        setOriginalData(chitsData.data);
      } else {
        setFinalChitsData((prevData) => {
          const existingIds = new Set(prevData.map(item => item.id));
          const uniqueNewData = chitsData.data.filter(item => !existingIds.has(item.id));
          return [...prevData, ...uniqueNewData];
        });

        setOriginalData((prevData) => {
          const existingIds = new Set(prevData.map(item => item.id));
          const uniqueNewData = chitsData.data.filter(item => !existingIds.has(item.id));
          return [...prevData, ...uniqueNewData];
        });
      }

      const hasMorePages = chitsData.data.length >= recordsPerPage;
      setHasMore(hasMorePages);
    } else {
      if (pageNumber === 0) {
        setFinalChitsData([]);
        setOriginalData([]);
      }
      setHasMore(false);
    }

    setIsLoading(false);
    setIsFetchingMore(false);
    setIsRefreshing(false);

  } catch (error) {

    setIsLoading(false);
    setIsFetchingMore(false);
    setIsRefreshing(false);
    setHasMore(false);

    if (pageNumber === 0) {
      setFinalChitsData([]);
      setOriginalData([]);
    }
  }
};

  const loadMoreData = () => {
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
      setActiveTag("All");

      initializeData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (currentPage > 0 && currentPage <= pageSize && hasMore) {
      const formattedFilters = isFilterApplied
        ? formatSelectedFilters(selectedFilterItems)
        : filterDefault;

      getNewChits(formattedFilters, currentPage, activeTag);
    }

    if (currentPage > pageSize && pageSize > 0) {
      setHasMore(false);
      setIsFetchingMore(false);
    }
  }, [currentPage]);

  const subscribeNow = useCallback((item) => {
    navigateWithGuard("NewChitDetails", {
      itemId: item.id,
    });
  }, [navigateWithGuard]);

  const certificateClicked = useCallback(async (id) => {
    try {
      let userData = await getObjectData("userData");
      if (userData && userData.data) {
        userData = userData.data;
      }
      const memberIds = userData?.id;
      const chitsData = finalChitsData.filter((item) => item.id === id);

      if (chitsData !== undefined && chitsData.length > 0) {
        navigateWithGuard("Certificates", {
          itemId: "009",
          certificateData: certificateData(
            chitsData[0]?.chitGroupCC,
            chitsData[0]?.chitGroupPSO,
            chitsData[0]?.fixedDepositDTO
          ),
          chitData: chitsData[0],
          chitId: chitsData[0].id,
          myChit: false,
          memberId: memberIds,
          isVacantChit: false
        });
      }
    } catch (error) {
      console.error('Certificate click error:', error);
    }
  }, [finalChitsData, navigateWithGuard]);

  const chitClicked = useCallback((id) => {
    navigateWithGuard("NewChitDetails", {
      itemId: id,
    });
  }, [navigateWithGuard]);

  const tagPress = (item) => {
    setActiveTag(item);
    setCurrentPage(0);
    setFinalChitsData([]);
    setOriginalData([]);
    setHasMore(true);
    setSelectedFilterItems({});
    setIsFilterApplied(false);
    setIsLoading(true);

    const cacheKey = CACHE_CONFIG.newChits.key;
    CacheService.clearCache(cacheKey);

    const formattedFilters = filterDefault;
    getNewChits(formattedFilters, 0, item);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    setFinalChitsData([]);
    setOriginalData([]);
    setCurrentPage(0);
    setHasMore(true);

    if (isFilterApplied) {
      const cacheKey = CACHE_CONFIG.newChitsFiltered?.key || CACHE_CONFIG.newChits.key;
      await CacheService.clearCache(cacheKey);
      const formattedFilters = formatSelectedFilters(selectedFilterItems);
      getNewChits(formattedFilters, 0, activeTag);
    } else {
      await CacheService.clearCache(CACHE_CONFIG.newChits.key);
      getNewChits(filterDefault, 0, activeTag);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && !isRefreshing ? (
        <SkeletonLoader cardTypeTwo={4} header={true} />
      ) : (
        <>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
              <View style={common_styles.newChits_tags}>
                {tags.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => tagPress(item)}
                    style={
                      activeTag !== item
                        ? common_styles.newChits_tags_container
                        : common_styles.newChits_tags_container_active
                    }
                  >
                    <Text
                      style={
                        activeTag !== item
                          ? common_styles.newChits_tags_text
                          : common_styles.newChits_tags_text_active
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={{ marginTop: 10, flex: 1 }}>
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
                    onPress={() => chitClicked(item.id)}
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
                              {item?.groupName ?? "-"}
                            </Text>
                            <Text style={common_styles.new_chits_sub_tags}>
                              Max bid {item.scheme.maximumBid}%
                            </Text>
                            <Text style={common_styles.new_chits_sub_tags}>
                              {item.scheme.auctionType}
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
                          <Text style={common_styles.new_chits_tag_text}>{item.tag}</Text>
                        </ImageBackground>
                        <Text
                          style={[
                            common_styles.new_chits_tickets_left,
                            { marginTop: 7, marginRight: 7 },
                          ]}
                        >
                          {item.remainingTickets ?? ""} ticket left
                        </Text>
                      </View>
                    </View>
                    <View style={common_styles.chit_container_row2}>
                      <View>
                        <NameTitle title='Instalment' fontSize={10} />
                        <InfoText
                          content={`${item?.scheme?.schemeDetails?.numberOfInstallment} Months` ?? "-"}
                          isBold={true}
                        />
                      </View>
                      <View style={common_styles.vertical_line}></View>
                      <View>
                        <NameTitle title='Start date' fontSize={10} />
                        <InfoText content={dayjs(new Date(parseInt(item.chitGroupCreatedDate * 1000))).format("DD-MMM-YYYY") ?? "-"} />
                      </View>
                      <View style={common_styles.vertical_line}></View>
                      <View
                        style={
                          common_styles.chit_container_row2_inner_container_last
                        }
                      >
                        <NameTitle title='Subscription' fontSize={10} />
                        <InfoText
                          content={`${formatCurrency(item?.scheme?.subscriptionAmount)}/M` ?? "-"}
                          isBold={true}
                          isCurrency={true}
                        />
                      </View>
                    </View>
                    <View style={(item?.chitGroupCC?.ccCertLocation !== null ||
                      item?.chitGroupPSO?.psoCertLocation !== null ||
                      item?.fixedDepositDTO?.fdDocPath !== null) ? styles.chit_container_row33 : styles.chit_container_row34}>
                      {(item?.chitGroupCC !== null ||
                        item?.chitGroupPSO !== null ||
                        item?.fixedDepositDTO !== null)
                        ? (
                          <TouchableOpacity
                            onPress={() => certificateClicked(item.id)}
                            style={common_styles.pdf_certificate_button_container}
                          >
                            <PDFIconSVG width={15} height={15} style={common_styles.new_chits_pdf_icon} />
                            <Text style={common_styles.pdf_certificate_button_text}>
                              Certificates
                            </Text>
                          </TouchableOpacity>
                        )
                        : <Text style={common_styles.pdf_certificate_button_text}></Text>
                      }
                      <TouchableOpacity
                        style={styles.new_chits_primary_button_container}
                        onPress={() => subscribeNow(item)}
                      >
                        <View style={styles.buttonContent}>
                          <Text style={styles.new_chits_primary_button_text}>Subscribe</Text>
                          <View style={styles.circleIcon}>
                            <Icon name="chevron-thin-right" size={10} color={CssColors.white} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {item.numberOfsubscriber ? (
                      <View
                        style={styles.chit_container_subscriber_count}
                      >
                        <Text style={styles.currentlyText}>
                          Currently there are {item.numberOfsubscriber}{" "}
                          subscribers.
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                )}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  isFetchingMore && hasMore ? (
                    <ActivityIndicator
                      size="large"
                      color={CssColors.textColorSecondary}
                    />
                  ) : !hasMore && finalChitsData.length > 0 && currentPage > 0 ? (
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
              onPress={() => setIsFilterVisible(true)}
              activeOpacity={0.7}
            >
              <Image
                style={{ tintColor: CssColors.white, height: 30, width: 30 }}
                source={require("../../assets/icons/filter.png")}
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
        visible={isFilterVisible}
        // onClose={() => {
        //   if (!isFilterApplied) {
        //     setSelectedFilterItems({});
        //   }
        //   setIsFilterVisible(false);
        // }}
        onClose={closeFilterSheet}
        height={"60%"}
      >
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity
    onPress={() => {
      if (!isFilterApplied) {
        setSelectedFilterItems({});
      }
      setIsFilterVisible(false);
    }}
    style={styles.filterCloseButton}
  >
  </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.filterScrollViewContent}
          >
            {filterData.map((item, index) => (
              <View key={index} style={styles.filterSection}>
                <Text style={styles.filterHeading}>{item.heading}</Text>
                <View style={styles.filterOptionsContainer}>
                  {item?.data?.map((filterItem, subIndex) => {
                    const isSelected = selectedFilterItems[item?.heading] === filterItem?.title;
                    return (
                      <TouchableOpacity
                        key={subIndex}
                        onPress={() => handleSelectItem(item.heading, filterItem.title)}
                        style={[
                          styles.filterOption,
                          isSelected && styles.filterOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            isSelected && styles.filterOptionTextSelected,
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
                !isAnyItemSelected && styles.disabledButton,
              ]}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DefaultBottomSheet>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground
  },
  chit_container_row33: {
    flexDirection: "row",
    paddingBottom: 10,
    paddingRight: 10,
    justifyContent: "space-between",
  },
  chit_container_row34: {
    flexDirection: "row",
    paddingBottom: 10,
    paddingRight: 10,
    justifyContent: "flex-end",
  },
  chit_container_subscriber_count: {
    marginLeft: -10,
    backgroundColor: CssColors.lightGreyFive,
    paddingLeft: 20,
    paddingBottom: 4,
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 8,
    lineHeight: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  scrollView: {
    backgroundColor: CssColors.new_chits_background,
  },
  currentlyText: {
    color: CssColors.primaryTitleColor,
    fontSize: 8
  },
  tagsContainer: {
    backgroundColor: 'white'
  },
  fontWeight600: { fontWeight: "600" },
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
  filterCloseButton: {
  padding: 5,
  justifyContent: 'center',
  alignItems: 'center',
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
});

export default NewChits;
