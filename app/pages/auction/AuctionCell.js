import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CssColors } from "../../css/css_colors";
import common_styles from "../../css/common_styles";

const AuctionCell = ({
  data,
  setShowBottomSheet,
  setBottomSheetData,
  setSelectedObj,
  performNavigation
}) => {
  const [auctionData, setAuctionData] = useState(data);
  const [timePassed, setTimePassed] = useState(false);
  let timer1 = (() => setTimePassed(true), 4000);

  const Ref = useRef(null);

  // The state for our timer
  const [timer, setTimer] = useState("--:--:--");

  const getTimeRemaining = (e) => {
    const total = e - new Date();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, days, hours, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      // update the timer
      // check if less than 10 then we need to
      // add '0' at the beginning of the variable
      setTimer(
        (days > 0 ? days : "0" + days) +
          "d:" +
          (hours > 9 ? hours : "0" + hours) +
          "h:" +
          (minutes > 9 ? minutes : "0" + minutes) +
          "m:" +
          (seconds > 9 ? seconds : "0" + seconds) +
          "s"
      );
    } else {
      if (Ref.current) clearInterval(Ref.current);
    }
  };

  const clearTimer = (e) => {
    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next
    setTimer("--:--:--");
    // If you try to remove this line the
    // updating of timer Variable will be
    // after 1000ms or 1sec
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date(auctionData.auctionEndDateTime * 1000);
    return deadline;
  };

  // We can use useEffect so that when the component
  // mount the timer will start as soon as possible

  useEffect(() => {
    clearTimer(getDeadTime());
    return () => {
      clearTimeout(timer1);
    };
  }, []);

  // Another way to call the clearTimer() to start
  // the countdown is via action event from the
  // button first we create function to be called
  // by the button
  const onClickReset = () => {
    clearTimer(getDeadTime());
  };

  return (
    <View style={{ marginTop: 10, marginHorizontal: 10 }}>
      <View style={styles.itemOuter}>
        <View style={styles.item}>
          <Text
            style={[common_styles.margin_left_10, common_styles.title_type_1]}
          >
            {auctionData.chitId}
          </Text>
          <Text style={[common_styles.margin_left_10, styles.auctionMaxBid]}>
            Aun. max bid {auctionData.maxBid}%
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.timer}>{timer}</Text>
        </View>
        <TouchableOpacity
          onPress={() => performNavigation(auctionData)}
          style={styles.itemTwo}>
          {auctionData.state == 'live' ? (
            <View style={styles.itemTwo}>
              <View style={common_styles.new_chits_primary_button_container}>
                <Text style={common_styles.new_chits_primary_button_text}>
                  Bid Now
                </Text>
              </View>
            </View>
          ) : (
            <></>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    justifyContent: "center",
    flexDirection: "column",
    height: 85,
  },
  itemTwo: {
    justifyContent: "center",
    flexDirection: "column",
    marginRight: 10
  },
  itemOuter: {
    backgroundColor: CssColors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 6,
    shadowColor: CssColors.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 2,
    backgroundColor: CssColors.white,
    borderColor: CssColors.homeDetailsBorder,
    borderWidth: 1,
  },
  timer: {
    textAlign: "center",
    color: CssColors.textColorSecondary,
    padding: 5,
    borderWidth: 1,
    borderColor: CssColors.textColorSecondary,
    borderRadius: 4,
    fontSize: 10,
  },
  auctionMaxBid: {
    color: CssColors.primaryPlaceHolderColor,
    padding: 4,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: "500",
    backgroundColor: CssColors.auctionMaxBidBg,
    paddingLeft: 8,
    marginTop: 4,
  },
});

export default AuctionCell;
