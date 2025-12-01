import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  FlatList,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import CommonService from "../services/CommonService";
import { SiteConstants } from "../SiteConstants";
import { Slider } from "@miblanchard/react-native-slider";
import { convertISOStringToMonthDay } from "../sharedComp/Utils";
import ChitIconDisplay from "../sharedComp/ChitIconDisplay";
import { useIsFocused } from "@react-navigation/native";
 
const MyCompletedHistory = ({ route, navigation }) => {
  const [finalChitsData, setFinalChitsData] = useState([]);
  const [languageData, setLanguageData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [recordsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const isFocused = useIsFocused();
 
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);
 
  useEffect(() => {
    setCurrentPage(0);
    if (isFocused) {
      setHasMore(true);
      setFinalChitsData([]);
      setIsLoading(true);
      getMychits(true);
    }
  }, [isFocused]);
 
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setCurrentPage(0);
    setHasMore(true);
    setFinalChitsData([]);
    setIsLoading(true);
    setTimeout(() => {
      getMychits(true);
      setRefreshing(false);
    }, 500);
  }, []);
 
  const getMychits = async (reset = false) => {
    if (reset) {
      setFinalChitsData([]);
      setCurrentPage(0);
      setHasMore(true);
    }
 
    if (!hasMore && !reset) return;
 
    setIsFetchingMore(true);
    const url = `${SiteConstants.API_URL}chit-group/v2/fetchSubscribedChits?status=INACTIVE&recordsPerPage=${recordsPerPage}&pageNumber=${currentPage}`;
 
    try {
      const myChitData = await CommonService.commonGet(navigation, url);
      setIsFetchingMore(false);
 
      if (myChitData.data?.length) {
        const filteredData = myChitData?.data?.filter(
          (item) => !item.foremanTicket
        );
        setTotalPages(myChitData?.tableProperties?.pagination?.pageSize);
        setFinalChitsData((prevData) =>
          reset ? filteredData : [...prevData, ...myChitData?.data]
        );
 
        if (filteredData.length < recordsPerPage) {
          setHasMore(false);
        }
        setIsLoading(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching myclosedchits:", error);
      setIsLoading(false);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };
 
  useEffect(() => {
    if (currentPage > 0 && currentPage <= totalPages && hasMore) {
      getMychits();
    }
  }, [currentPage, hasMore]);
 
  const loadMoreData = () => {
    if (!isFetchingMore && hasMore && !isLoading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
 
  const CustomThumb = (currentValue, numberOfInstallment) => {
    const thumbStyle = {
      width: 18,
      height: 18,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 30,
      borderColor: CssColors.locationPin,
      backgroundColor: CssColors.white,
      borderWidth: 1,
      transform: [{ rotate: "45deg" }],
      justifyContent: "center",
      alignItems: "center",
      top: -12,
    };
 
    const textContainer = {
      transform: [{ rotate: "-45deg" }],
      justifyContent: "center",
      alignItems: "center",
    };
 
    const textStyle = {
      color: CssColors.locationPin,
      fontSize: 8,
      fontWeight: "600",
    };
 
    return (
      <View
        style={[
          thumbStyle,
          currentValue === 1 ? { marginLeft: -7 } : {},
          currentValue === numberOfInstallment ? { marginRight: -8 } : {},
        ]}
      >
        <View style={textContainer}>
          <Text style={textStyle}>{currentValue ?? "0"}</Text>
        </View>
      </View>
    );
  };
 
  const renderChitItem = ({ item }) => (
    <View
      key={item.groupName}
      style={[common_styles.chit_container, common_styles.shadowProp]}
    >
      <View style={[styles.chit_container_row1]}>
        <View
          style={
            item?.chitStatus === "TERMINATED"
              ? styles.leftSection
              : styles.fullSection
          }
        >
          <ChitIconDisplay
            chitValue={item.chitValue}
            imageStyle={common_styles.new_chits_logo_icon}
          />
          <View style={{ flexDirection: "column", width: "100%" }}>
            <Text
              style={styles.myChit_Title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.memberName}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={common_styles.new_chits_sub_tags}>
                {languageData?.chitId?.label}
                {item.groupName}
              </Text>
            </View>
          </View>
        </View>
 
        {item?.chitStatus === "TERMINATED" && item?.status === "PS" && (
          <View style={styles.sliderSection}>
            <Text style={common_styles.vacant_chit_text2}>01</Text>
            <View style={styles.sliderContainer}>
              <Slider
                value={item.runningInstall ?? 1}
                minimumValue={1}
                maximumValue={item.numberOfInstallment}
                step={1}
                minimumTrackTintColor={
                  item.runningInstall >= item.numberOfInstallment
                    ? "#FF4A00"
                    : "#FF4A00"
                }
                maximumTrackTintColor={
                  item.runningInstall >= item.numberOfInstallment
                    ? "#FF4A00"
                    : "#8F9BB3"
                }
                disabled
                renderThumbComponent={() =>
                  CustomThumb(item.runningInstall ?? 1, item.numberOfInstallment)
                }
              />
            </View>
            <Text style={common_styles.vacant_chit_text2}>
              {item.numberOfInstallment}
            </Text>
          </View>
        )}
      </View>
 
      <View style={common_styles.chit_container_row2}>
        <View>
          <Text style={common_styles.chit_container_row2_inner_header}>
            {languageData?.chitValue?.label ?? "Chit Value"}
          </Text>
          <Text style={common_styles.chit_container_row2_inner_header_info}>
            {"\u20B9"} {item.chitValue}
          </Text>
        </View>
 
        <View style={common_styles.vertical_line}></View>
 
        <View>
          <Text style={common_styles.chit_container_row2_inner_header}>
            {languageData?.earnDividend?.label ?? "Dividend earned"}
          </Text>
          <Text
            style={[
              common_styles.chit_container_row2_inner_header_info,
              styles.orangeText,
            ]}
          >
            {"\u20B9"} {item.earnDividend}
          </Text>
        </View>
 
        <View style={common_styles.vertical_line}></View>
 
        <View>
          <Text style={common_styles.chit_container_row2_inner_header}>
            {item?.status === "CANCELLED"
              ? "Canceled date"
              : item?.status === "PS"
              ? "Close date"
              : item?.status === "TRANSFERRED"
              ? "Transferred date"
              : ""}
          </Text>
          <Text style={common_styles.chit_container_row2_inner_header_info}>
            {convertISOStringToMonthDay(item?.inactiveDate ?? "")}
          </Text>
        </View>
      </View>
 
      <View style={common_styles.chit_container_row3_mychit}>
        <View style={common_styles.flex_row}>
          <Text style={common_styles.mychitStatusText}>
            {languageData?.status?.label ?? "Status"}
          </Text>
          <Text
            style={[common_styles.mychitStatusTextTwo, styles.paddingLeft_5]}
          >
            {item?.status === "PS" ? item?.chitStatus : item?.status}
          </Text>
        </View>
      </View>
 
      <View style={styles.chit_container_subscriber_count}>
        <Text
          style={{
            fontSize: 10,
            paddingLeft: 5,
            color:
              item?.status === "CANCELLED" || item?.status === "TRANSFERRED"
                ? CssColors.red
                : CssColors.green,
          }}
        >
          •{" "}
        </Text>
        <Text
          style={[
            common_styles.myChitEnrollmentText,
            {
              color:
                item?.status === "CANCELLED" || item?.status === "TRANSFERRED"
                  ? CssColors.red
                  : CssColors.green,
            },
          ]}
        >
          {item?.ticketDescription}
        </Text>
      </View>
    </View>
  );
 
  const renderFooter = () => {
    if (isFetchingMore)
      return (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      );
    if (!hasMore && currentPage > 0)
      return (
        <Text style={{ textAlign: "center", color: "black", marginVertical: 20 }}>
          No more data to load
        </Text>
      );
    return null;
  };
 
  return (
    <SafeAreaView
      style={!isLoading ? styles.container : common_styles.center_align}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <View style={{ marginTop: 15, flex: 1 }}>
          {finalChitsData.length ? (
            <FlatList
              data={finalChitsData}
              renderItem={renderChitItem}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: "center",
                    color: "black",
                    marginVertical: 20,
                  }}
                >
                  No Inactive chit available
                </Text>
              }
              ListFooterComponent={renderFooter}
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.1}
            />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: "black",
                marginVertical: 20,
              }}
            >
              No Inactive chit available
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  container: { flex: 1 },
  chit_container_subscriber_count: {
    marginLeft: -10,
    backgroundColor: CssColors.lightGreyFive,
    paddingLeft: 10,
    paddingHorizontal: 3,
    color: CssColors.primaryPlaceHolderColor,
    fontSize: 8,
    lineHeight: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    display: "flex",
    flexDirection: "row",
  },
  chit_container_row1: { width: "100%", flexDirection: "row" },
  leftSection: { flexDirection: "row", flex: 0.8, marginRight: 10 },
  fullSection: { flexDirection: "row", flex: 1, marginRight: 10 },
  sliderSection: {
    flex: 0.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 0,
    marginRight: 10,
  },
  sliderContainer: {
    width: 60,
    height: 25,
    marginHorizontal: 4,
    justifyContent: "center",
    top: 0,
  },
  myChit_Title: {
    color: CssColors.textColorSecondary,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "600",
    width: "90%",
  },
  paddingLeft_5: { paddingLeft: 5 },
  orangeText: { color: CssColors.textColorSecondary },
});
 
export default MyCompletedHistory;