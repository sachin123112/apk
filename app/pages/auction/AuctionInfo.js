import React, { Component, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import common_styles from "../../css/common_styles";
import { CssColors } from "../../css/css_colors";
import CloseIconSVG from "../svgs/CloseIconSVG";

const AuctionInfo = ({ route, navigation }) => {
  const { data } = route.params;

  useEffect(() => {
    // console.log(data);
  }, []);

  return (
    <View>
      {/* <View style={{ height: 80 }}></View> */}
      <View style={{ margin: 8, backgroundColor: "white" }}>
        <View style={{ margin: 16, backgroundColor: "white" }}>
          <TouchableOpacity
            style={common_styles.close_icon_container}
            onPress={() => {
              navigation.pop();
            }}
          >
            <CloseIconSVG width={48} height={48} />
          </TouchableOpacity>
          <View style={styles.title}>
            <Text style={styles.titleInfo}>Bid information</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Auction no</Text>
            <Text style={styles.infoDetails}>{data.auctionSequenceNo}</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Future liability</Text>
            <Text style={styles.infoDetails}>{data.futureLiability}</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Chit value</Text>
            <Text style={styles.infoDetails}>{data.chitValue}</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Current bid amount</Text>
            <Text style={styles.infoDetails}>{data.bidAmount}</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Prized amount</Text>
            <Text style={styles.infoDetails}>{data.priceAmount}</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Net prize amount</Text>
            <Text style={styles.infoDetails}>{data.netPriceAmount}</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Rate of interest</Text>
            <Text style={styles.infoDetails}> {data.roi}%/M</Text>
          </View>
          <View style={styles.description}>
            <Text style={styles.infoTitle}>Last month bid</Text>
            <Text style={styles.infoDetails}>
              {data.lastMonthBid.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AuctionInfo;

const styles = StyleSheet.create({
  title: {
    flexDirection: "row",
  },
  titleInfo: {
    color: "#072E77",
    fontSize: 25,
    fontWeight: "bold",
  },
  description: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoDetails: {
    alignSelf: "flex-end",
    color: CssColors.primaryPlaceHolderColor,
  },
  infoTitle: {
    color: CssColors.primaryPlaceHolderColor,
  },
});
