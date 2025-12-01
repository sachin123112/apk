import React, { Component, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";

import { SiteConstants } from "../../SiteConstants";
import CommonService from "../../services/CommonService";
import { getStringData } from "../../sharedComp/AsyncData";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import WheelOfFortune from "react-native-wheel-of-fortune-dp/src";

let participants = [];
let winnerId = -1;
class SpinWheel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winnerValue: null,
      winnerIndex: null,
      started: false,
      data: this.props.data,
      historyData: this.props.historyData,
      winnerNo: this.props.winner,
    };
    console.log("Before winner id", winnerId, this.state.historyData);
    for (let i = 0; i < this.state.historyData.length; i++) {
      if (this.state.historyData[i].ticketNumber != "00") {
        participants.push(this.state.historyData[i].ticketNumber);
        if (this.state.historyData[i].ticketNumber == this.state.winnerNo) {
          winnerId = i;
        }
      }
      console.log(
        "The data is ",
        participants, // array
        winnerId, // send to wheel
        this.state.winnerNo, // constructor parm
        i // for loop int
      );
    }
    this.child = null;
  }

  componentDidMount() {
    this.setState({
      data: this.props.data,
    });
    this.fetchUsers();
  }

  async fetchUsers() {
    // const token = await getStringData('token');
    // print(token)
    // const users = await CommonService.commonGet(
    //   navigation,
    //   `${SiteConstants.API_URL}enrollment/v2/fetchSubscribers/${this.state.data.chitId}`
    // );
    // if(users !== undefined) {
    //   console.log(users);
    // } else {
    //   console.log("No data found");
    // }
    this.buttonPress();
  }

  buttonPress = () => {
    this.setState({
      started: true,
    });
    this.child._onPress();
  };

  clickClose = (value) => {
    var result = this.state.historyData.filter((obj) => {
      return obj.ticketNumber === value;
    });
    participants = [];
    this.props.onClose(result[0]);
  };
  render() {
    const wheelOptions = {
      rewards: participants,
      knobSize: 50,
      borderWidth: 5,
      borderColor: "#fff",
      innerRadius: 50,
      duration: 15000,
      backgroundColor: "transparent",
      textAngle: "horizontal",
      textFontSize: 55,
      knobSource: require("../../../assets/images/knob.png"),
      onRef: (ref) => (this.child = ref),
      winner: winnerId,
    };

    return (
      <View style={styles.container}>
        <WheelOfFortune
          options={wheelOptions}
          getWinner={(value, index) => {
            this.setState({ winnerValue: value, winnerIndex: index });
            // console.log(value, index);
            this.clickClose(value);
          }}
        />
        {/* {!this.state.started && (
          <TouchableOpacity
            onPress={() => this.buttonPress()}
            style={styles.startButton}
          ></TouchableOpacity>
        )} */}
        {/* {this.state.winnerIndex != null && (
          <View style={styles.winnerView}>
            <Text style={styles.winnerText}>
              You win {participants[this.state.winnerIndex]}
            </Text>
            <TouchableOpacity
              onPress={() => {
                this.setState({ winnerIndex: null });
                this.child._tryAgain();
              }}
              style={styles.tryAgainButton}
            ></TouchableOpacity>
          </View>
        )} */}
        <View style={styles.timerInfo}>
          <View>
            <CountdownCircleTimer
              isPlaying={true}
              duration={15}
              colors="#FF4A00"
              size={60}
              strokeWidth={4}
              onComplete={() => {}}
            >
              {({ remainingTime }) => (
                <Text style={{ color: "#072E77", fontSize: 18 }}>
                  00.{remainingTime}
                </Text>
              )}
            </CountdownCircleTimer>
          </View>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.textInfo1}>It will take few seconds</Text>
            <Text style={styles.textInfo2}>
              Time for announcing the auction winner
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 150,
  },
  startButton: {
    marginTop: 250,
    backgroundColor: "white",
    padding: 10,
  },
  startButtonText: {
    color: "blue",
    fontSize: 25,
    fontWeight: "bold",
  },
  winnerView: {
    justifyContent: "center",
    alignItems: "center",
  },
  tryAgainButton: {
    padding: 10,
  },
  winnerText: {
    fontSize: 30,
    paddingBottom: 30,
  },
  tryAgainButton: {
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  tryAgainText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  timerInfo: {
    flexDirection: "row",
    marginTop: 20,
    paddingBottom: 50,
    alignItems: "stretch",
  },
  textInfo1: {
    paddingTop: 10,
    paddingLeft: 16,
    alignContent: "center",
    color: "#072E77",
    fontSize: 14,
  },
  textInfo2: {
    paddingTop: 10,
    paddingLeft: 16,
    alignContent: "center",
    color: "#34C85A",
    fontSize: 12,
  },
});

export default SpinWheel;
