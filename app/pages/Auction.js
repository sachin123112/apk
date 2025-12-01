import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import AuctionCell from "./auction/AuctionCell";
import BottomPopUp from "../sharedComp/BottomSheet";
import NoActiveData from "../sharedComp/NoActiveData";
import { useIsFocused } from "@react-navigation/native";
import SkeletonLoader from "../components/loaders/SkeletonLoader";
import { useCustomBackHandler } from "../sharedComp/Utils";

const Auction = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [auctionList, setAuctionList] = useState([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetData, setBottomSheetData] = useState({});
  const [selectedObj, setSelectedObj] = useState({});
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getAuctionList();
    }
  }, [isFocused]);
useCustomBackHandler(navigation,false);
  useEffect(() => {
    console.log("Reload page Auction list");
    const interval = setInterval(() => {
      console.log("Reload page");
      getAuctionList();
    }, 60 * 5000);
    return () => clearInterval(interval);
  }, []);

  const getAuctionList = () => {
    setIsLoading(true);
    (async () => {
      const auctionData = await CommonService.commonGet(
        navigation,
        `${SiteConstants.API_URL}auction/auction-list`
      );
      const filteredData = auctionData.filter(item => !item.foremanTicket);
      if (filteredData !== undefined) {
        console.log(auctionData, "auction list");
        setAuctionList(filteredData);
        setIsLoading(false);
      }
    })();
  };

  const performNavigation = (object) => {
    const minVal = (parseInt(object.chitValue) * 0.1) / 100;

    if (validateEnrolementStatus(object.enrollmentStatus) == true) {
      setBottomSheetData({
        title: "Enrollment is Pending",
        titleColor: "#072E77",
        description: "Enrollment is pending.\nPlease complete following steps.",
        sendButtonTitle: "Done",
        sendButtonBGColor: "#072E77",
        totalButtons: 1,
        showIcon: false,
        showIconName: "enroll",
        descTwoLines: true,
        showSVG: true,
      });
      setShowBottomSheet(true);
    } else if (validateAgreementStatus(object.agreementStatus) == true) {
      setBottomSheetData({
        title: "Complete Chit Agreement",
        titleColor: "#072E77",
        description:
          "Agreement is pending.\nPlease complete following few steps.",
        sendButtonTitle: "Continue",
        descTwoLines: true,
        sendButtonBGColor: "#072E77",
        totalButtons: 1,
        showIcon: false,
        showIconName: 'enroll',
        showSVG: true,
      });
      setShowBottomSheet(true);
    } else if (object.reasonNotToBid === 'PLEDGED') {
      setSelectedObj(object);
      setBottomSheetData({
        title: "Pledged chit",
        titleColor: "#072E77",
        description: "This chit is pledged. \nnot able to participate in auction.",
        sendButtonTitle: "Close",
        sendButtonBGColor: "#072E77",
        totalButtons: 1,
        showIcon: false,
        showIconName: "pledged",
        descTwoLines: true,
        showSVG: true,
      });
      setShowBottomSheet(true);
    } else if (object.state != "live") {
      alert("This chit is " + object.state);
    } else if (object.ticketStatus == "ACNPS") {
      setSelectedObj(object);
      setBottomSheetData({
        title: "Clear the Dues.",
        titleColor: "#ff4a00",
        description:
          "Clear your last three months dues otherwise your chat will be cancelled.",
        sendButtonTitle: `₹ ${object.totalDue} Pay now`,
        sendButtonBGColor: "#072E77",
        totalButtons: 1,
        tag: "navigate",
        showIcon: false,
        showIconName: 'clearDues',
        showSVG: true,
        navigateToMyChit: true,
        subscriptionId: object.subscriptionId
      });
      setShowBottomSheet(true);
    } else if (minVal < parseInt(object.totalDue)) {
      setSelectedObj(object);
      setBottomSheetData({
        title: "Clear the Dues.",
        titleColor: "#ff4a00",
        description: "Clear your dues and participate in auction",
        sendButtonTitle: `₹ ${object.totalDue} Pay now`,
        sendButtonBGColor: "#072E77",
        totalButtons: 1,
        tag: "navigate",
        showIcon: false,
        showIconName: 'clearDues',
        showSVG: true,
        navigateToMyChit: true,
        subscriptionId: object.subscriptionId
      });
      setShowBottomSheet(true);
    } else {
      // navigation.navigate("AuctionDetails", {
      //   data: object,
      //   isMyBidDetails: false,
      // });
    }
  };

  const validateAgreementStatus = (val) => {
    switch (val) {
      case ("COMPLETED", "APPROVED"):
        return false;
      default:
        return true;
    }
  };

  const validateEnrolementStatus = (val) => {
    switch (val) {
      case "APPROVED":
        return false;
      default:
        return true;
    }
  };

  const navigateToMyChitDetail = (item) => {
    console.log(item, 'item data');
    if (item.navigateToMyChit) {
      navigation.navigate('MyChitsNavigator', {
        screen: 'MyChitDetails',
        params: { subscriptionId: item.subscriptionId }
      });
    }
  };

  return (
    <View style={[styles.container]}>
      {isLoading ? (
        <SkeletonLoader cardTypeFour={5} />
      ) : auctionList.length ? (
        <View style={{ flex: 1 }}>
          <FlatList
            data={auctionList}
            keyExtractor={item => item.chitId}
            renderItem={({ item }) => (
              <Pressable onPress={() => performNavigation(item)}>
                <AuctionCell
                  data={item}
                  setShowBottomSheet={setShowBottomSheet} // Pass function to show BottomPopUp
                  setBottomSheetData={setBottomSheetData} // Pass function to set BottomPopUp data
                  setSelectedObj={setSelectedObj} // Pass function to set selected object
                  performNavigation={performNavigation}
                />
              </Pressable>
            )}
          />
          {showBottomSheet && (
            <BottomPopUp
              data={bottomSheetData}
              onClose={() => {
                setShowBottomSheet(false);
              }}
              onSubmit={() => {
                setShowBottomSheet(false);
                navigateToMyChitDetail(bottomSheetData);
              }}
            />
          )}
        </View>
      ) : (
        <NoActiveData
          contentTitle="No active auctions available"
          contetsubTitle="Select new chit"
          buttonTitle="Find new chits"
          iconName="auctionNoChit"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CssColors.appBackground,
    height: "100%",
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    borderRadius: 6,
    shadowColor: CssColors.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 2,
    backgroundColor: CssColors.white,
    borderColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
  },
});

export default Auction;
