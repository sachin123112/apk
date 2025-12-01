import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView
} from "react-native";
import React, { useEffect, useState } from "react";
import { CssColors } from "../css/css_colors";
import { SelectList } from "react-native-dropdown-select-list";
import common_styles from "../css/common_styles";
import { getObjectData } from "../sharedComp/AsyncData";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import RequestHistoryIconSVG from './svgs/RequestHistoryIconSVG';
  
const MyRequestSettings = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestHistory, setShowRequestHistory] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState("");
  const [memberID, setMemberID] = useState("");
  const [oldPhoneNumber, setOldPhoneNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [narration, setNarration] = useState("");
  const [transferChit, setTransferChit] = useState(false);
  const [transferChitData, setTransferChitData] = useState([]);
  const [chitPledgeData, setChitPledgeData] = useState([]);
  const [requestHistoryData, setRequestHistoryData] = useState([]);
  const [chitPledgeRelease, setChitPledgeRelease] = useState(false);
  const [phoneNumberChange, setPhoneNumberChange] = useState(false);

  const data = [
    { key: "TRANSFERCHIT", value: "Transfer chit" },
    { key: "CHITPLEDGERELEASE", value: "Chit Pledge release" },
    { key: "PHONENUMBERCHANGE", value: "Phone number change" },
  ];

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      getDropdownOptions('TRANSFERCHIT');
      getDropdownOptions('CHITPLEDGERELEASE');
      let userData = await getObjectData("userData");
      if (userData && userData.data) {
        userData = userData.data;
      }
      setOldPhoneNumber(userData?.phoneNumber);
      const memberIds = userData?.id;
      setMemberID(userData?.id);
      const urls = `${SiteConstants.API_URL}user/v2/serviceRequest/${memberIds}`;
      const historyData = await CommonService.commonGet(navigation, urls);
      if (historyData !== undefined) {
        setRequestHistoryData(historyData);
        setShowRequestHistory(historyData.length ? true : false);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  const getDropdownOptions = async (type) => {
    let userData = await getObjectData("userData");
    if (userData && userData.data) {
      userData = userData.data;
    }
    const memberIds = userData?.id;
    const url = `${SiteConstants.API_URL}user/v2/getMemberChitGroup/${memberIds}/${type}`;
    CommonService.commonGet(navigation, url)
      .then((trasnferChitData) => {
        if (trasnferChitData !== undefined) {
          dropdownData = [];
          trasnferChitData.map((data) => {
            const innerData = {
              key: data.groupName,
              value: data.groupName,
            };
            dropdownData.push(innerData);
          });
          console.log(dropdownData, 'final TRANSFERCHIT dropdown data');
          type === 'TRANSFERCHIT' ? setTransferChitData(dropdownData) : setChitPledgeData(dropdownData);
        } else {
          type === 'TRANSFERCHIT' ? setTransferChitData([]) : setChitPledgeData([]);
        }
      })
      .catch((error) => {
        console.log(error, "error data");
        type === 'TRANSFERCHIT' ? setTransferChitData([]) : setChitPledgeData([]);
      });
  };

  const setRequestType = async (data) => {
    console.log(data, 'setRequestType');
    if (data === "TRANSFERCHIT") {
      setNarration('');
      setPhoneNumber('');
      setSelectedGroupName('');
      setTransferChit(true);
      setPhoneNumberChange(false);
      setChitPledgeRelease(false);
    }
    if (data === "CHITPLEDGERELEASE") {
      setNarration('');
      setPhoneNumber('');
      setSelectedGroupName('');
      setChitPledgeRelease(true);
      setTransferChit(false);
      setPhoneNumberChange(false);
    }
    if (data === "PHONENUMBERCHANGE") {
      setNarration('');
      setPhoneNumber('');
      setSelectedGroupName('');
      setPhoneNumberChange(true);
      setTransferChit(false);
      setChitPledgeRelease(false);
    }
  };

  const onChitPledgeSubmit = () => {
    setIsLoading(true);
    if ((selectedGroupName === null || selectedGroupName === '') ||
      (narration === null || narration === '')) {
      alert('Pledge release chit number or narration can not be empty');
      setIsLoading(false);
      return;
    }
    setTransferChit(false);
    setPhoneNumberChange(false);
    setChitPledgeRelease(false);
    const payLoadData = {
        id: "",
        lastModifiedOn: "",
        lastModifiedBy: "",
        memberId: memberID,
        chitId: "",
        groupName: selectedGroupName,
        requestType: "ChitPledgeRelease",
        status: "",
        narration: narration,
        completedDateTime: "",
        requestedDateTime: "",
        changePhoneNo: "",
    };
    const url = `${SiteConstants.API_URL}user/v2/serviceRequest/save/${memberID}`;
    CommonService.commonPost(navigation, url, payLoadData)
    .then(async (data) => {
      console.log(data, )
      if (data !== undefined) {
        const url = `${SiteConstants.API_URL}user/v2/serviceRequest/${memberID}`;
        const getrequestHistoryData = await CommonService.commonGet(
          navigation,
          url
        );
        setRequestHistoryData(getrequestHistoryData);
        setTransferChit(false);
        setPhoneNumberChange(false);
        setChitPledgeRelease(false);
        setNarration('');
        setPhoneNumber('');
        setSelectedGroupName('');
        setShowRequestHistory(true);
        setIsLoading(false);
      }
    })
    .catch((error) => {
      console.log(error, "error data");
      setNarration('');
      setPhoneNumber('');
      setSelectedGroupName('');
      setIsLoading(false);
    });
  }

  const onPhoneNumberChange = () => {
    setIsLoading(true);
    if (phoneNumber === null || phoneNumber === '') {
      alert('New phone number can not be null');
      setIsLoading(false);
      return;
    }
    setTransferChit(false);
    setPhoneNumberChange(false);
    setChitPledgeRelease(false);
    setNarration('');
    const payLoadData = {
      id: "",
      lastModifiedOn: "",
      lastModifiedBy: "",
      memberId: memberID,
      chitId: "",
      groupName: "",
      requestType: "PhoneNumberChange",
      status: "",
      narration: narration,
      completedDateTime: "",
      requestedDateTime: "",
      changePhoneNo: phoneNumber,
    };
    const url = `${SiteConstants.API_URL}user/v2/serviceRequest/save/${memberID}`;
    CommonService.commonPost(navigation, url, payLoadData).then(async (data) => {
      // setIsLoading(false);
      if (data !== undefined) {
        const url = `${SiteConstants.API_URL}user/v2/serviceRequest/${memberID}`;
        const getrequestHistoryData = await CommonService.commonGet(
          navigation,
          url
        );
        setRequestHistoryData(getrequestHistoryData);
        setTransferChit(false);
        setPhoneNumberChange(false);
        setChitPledgeRelease(false);
        setNarration('');
        setPhoneNumber('');
        setSelectedGroupName('');
        setShowRequestHistory(true);
        setIsLoading(false);
      }
    })
    .catch((error) => {
      console.log(error, "error data");
      setTransferChit(false);
      setPhoneNumberChange(false);
      setChitPledgeRelease(false);
      setIsLoading(false);
    });
  }

  const onTransferChit = async () => {
    setIsLoading(true);
    if ((selectedGroupName === null || selectedGroupName === '') ||
      (narration === null || narration === '')) {
      alert('Transfer chit number or narration can not be empty');
      setIsLoading(false);
      return;
    }
    setTransferChit(false);
    setPhoneNumberChange(false);
    setChitPledgeRelease(false);
    const payLoadData = {
      id: "",
      lastModifiedOn: "",
      lastModifiedBy: "",
      memberId: memberID,
      chitId: "",
      groupName: selectedGroupName,
      requestType: "Transferchit",
      status: "",
      narration: narration,
      completedDateTime: "",
      requestedDateTime: "",
      changePhoneNo: "",
    };
    const url = `${SiteConstants.API_URL}user/v2/serviceRequest/save/${memberID}`;
    CommonService.commonPost(navigation, url, payLoadData)
      .then(async (data) => {
        // setIsLoading(false);
        if (data !== undefined) {
          const url = `${SiteConstants.API_URL}user/v2/serviceRequest/${memberID}`;
          const getrequestHistoryData = await CommonService.commonGet(
            navigation,
            url
          );
          setRequestHistoryData(getrequestHistoryData);
          setTransferChit(false);
          setPhoneNumberChange(false);
          setChitPledgeRelease(false);
          setNarration('');
          setPhoneNumber('');
          setSelectedGroupName('');
          setShowRequestHistory(true);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.log(error, "error data");
        setTransferChit(false);
        setPhoneNumberChange(false);
        setChitPledgeRelease(false);
        setIsLoading(false);
      });
  };

  const setChitDataDropdown = (data) => {
    setSelectedGroupName(data);
  }
  
  return (
    <SafeAreaView style={[!isLoading ? styles.container : common_styles.center_align]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={styles.container}>
              <View style={{ paddingTop: 25, paddingLeft: 20, paddingRight: 20 }}>
                <SelectList
                    boxStyles={common_styles.select_list_document}
                    inputStyles={{ color: "black" }}
                    setSelected={(data) => setSelectedDropdown(data)}
                    onSelect={() => setRequestType(selectedDropdown)} 
                    data={data}
                    placeholder="Select change request"
                    dropdownTextStyles={{ color: "black" }}
                />
              </View>
              {(transferChit) &&
                <View style={{ paddingTop: 15, paddingLeft: 20, paddingRight: 20 }}>
                  {transferChitData.length ? (
                    <>
                      <Text style={common_styles.fontsize12}>Transfer chit number</Text>
                      <SelectList
                          boxStyles={[common_styles.select_list_document]}
                          inputStyles={{ color: CssColors.black }}
                          dropdownTextStyles={{ color: CssColors.black }}
                          setSelected={(data) => setChitDataDropdown(data)}
                          data={transferChitData}
                      />
                    </>
                  ) : (
                    <ActivityIndicator
                      size="large"
                      color={CssColors.textColorSecondary}
                    />
                  )}
                      
                  <Text style={[common_styles.fontsize12, common_styles.marginTopTen, common_styles.margin_bottom_5]}>Add narration</Text>
                  <View style={styles.textAreaContainer}>
                      <TextInput
                          style={styles.textArea}
                          underlineColorAndroid="transparent"
                          placeholder="Type something"
                          placeholderTextColor="grey"
                          numberOfLines={10}
                          multiline={true}
                          value={narration}
                          onChangeText={(text) => setNarration(text)}
                      />
                  </View>
                  <TouchableOpacity
                      onPress={() => onTransferChit()}
                      style={[common_styles.primary_button]}
                      >
                      <Text style={common_styles.primary_button_text}>Submit</Text>
                  </TouchableOpacity>
                </View>
              }
              {(chitPledgeRelease) &&
                <View style={{ paddingTop: 15, paddingLeft: 20, paddingRight: 20 }}>
                  {chitPledgeData.length ? (
                    <>
                      <Text style={common_styles.fontsize12}>Pledge release chit number</Text>
                      <SelectList
                          boxStyles={[common_styles.select_list_document]}
                          inputStyles={{ color: CssColors.black }}
                          dropdownTextStyles={{ color: CssColors.black }}
                          setSelected={(data) => setChitDataDropdown(data)}
                          data={chitPledgeData}
                      />
                    </>
                  ) : (
                    <ActivityIndicator
                      size="large"
                      color={CssColors.textColorSecondary}
                    />
                  )}
                  <Text style={[common_styles.fontsize12, common_styles.marginTopTen, common_styles.margin_bottom_5]}>Add narration</Text>
                  <View style={styles.textAreaContainer} >
                      <TextInput
                          style={styles.textArea}
                          underlineColorAndroid="transparent"
                          placeholder="Type something"
                          placeholderTextColor="grey"
                          numberOfLines={10}
                          multiline={true}
                          value={narration}
                          onChangeText={(text) => setNarration(text)}
                      />
                  </View>
                  <TouchableOpacity
                      onPress={() => onChitPledgeSubmit()}
                      style={common_styles.primary_button}
                      >
                      <Text style={common_styles.primary_button_text}>Submit</Text>
                  </TouchableOpacity>
                </View>
              }
              {(phoneNumberChange) &&
                <View style={{ paddingTop: 15, paddingLeft: 20, paddingRight: 20 }}>
                  <Text style={common_styles.fontsize12}>Current phone number</Text>
                  <TextInput
                    style={[styles.phoneNumberInput, styles.disbledText]}
                    editable={false} selectTextOnFocus={false}
                    value={oldPhoneNumber}
                  />
                  <Text style={[common_styles.fontsize12, common_styles.marginTopTen, common_styles.marginBottomTen]}>Add new phone number</Text>
                  <TextInput
                    style={styles.phoneNumberInput}
                    onChangeText={setPhoneNumber}
                    value={phoneNumber}
                    placeholderTextColor={CssColors.primaryPlaceHolderColor}
                    keyboardType="numeric"
                    maxLength={10}
                    minLength={9}
                  />
                  <TouchableOpacity
                    onPress={() => onPhoneNumberChange()}
                    style={common_styles.primary_button}
                    >
                    <Text style={common_styles.primary_button_text}>Submit</Text>
                  </TouchableOpacity>
                </View>
              }
              {(showRequestHistory) &&
                <TouchableOpacity
                  onPress={() => navigation.navigate("RequestHistoryDetails", { requestHistoryData })}
                  style={styles.requestHistoryContainer}
                  >
                  <RequestHistoryIconSVG width={24} height={24} />
                  <Text style={styles.requestHistoryText}>Request history</Text>
                </TouchableOpacity>
              }
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.white,
  },
  scrollView: {
      backgroundColor: CssColors.white
    },
  textAreaContainer: {
      borderColor: CssColors.primaryBorder,
      borderWidth: 1,
      padding: 5,
      borderRadius: 4
    },
    columnone: {
      flex: 1,
      flexDirection: 'column',
    },
    textArea: {
      height: 150,
      justifyContent: "flex-start",
      color: CssColors.black
    },
    requestHistoryContainer: {
      padding: 10,
      margin: 10,
      display: 'flex',
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: CssColors.primaryBorder,
      borderRadius: 20
    },
    requestHistoryText: {
      color: CssColors.primaryPlaceHolderColor,
      paddingHorizontal: 10
    },
    requestHistoryHeader: {
      paddingTop: 15,
      paddingLeft: 10,
      paddingRight: 10,
      borderWidth: 1,
      borderBottomColor: CssColors.homeDetailsBorder,
      borderTopColor: CssColors.homeDetailsBorder,
      borderLeftColor: CssColors.homeDetailsBorder,
      borderRightColor: CssColors.homeDetailsBorder,
      marginHorizontal: 10,
      paddingBottom: 10,
      marginTop: 20
    },
    requestedDateText: {
      fontSize: 12,
      lineHeight: 26,
      color: CssColors.primaryPlaceHolderColor
    },
    requestHistoryTitleText: {
      fontSize: 12,
      lineHeight: 24,
      color: CssColors.primaryBorder
    },
    requestHistoryMainTitleText: {
      fontSize: 16,
      lineHeight: 24,
      color: CssColors.primaryPlaceHolderColor,
      fontWeight: '600'
    },
    requestHistoryMainTitleSubText: {
      fontSize: 12,
      lineHeight: 24,
      color: CssColors.primaryBorder
    },
    requestHistoryTitleTextData: {
      fontSize: 14,
      lineHeight: 24,
      color: CssColors.primaryPlaceHolderColor,
      fontWeight: '600'
    },
    phoneNumberInput: {
      color: CssColors.primaryPlaceHolderColor,
      fontSize: 14,
      lineHeight: 22,
      borderWidth: 1,
      borderBottomColor: CssColors.homeDetailsBorder,
      borderTopColor: "transparent",
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      paddingBottom: 10,
    },
    disbledText: {
      color: CssColors.primaryBorder
    }
});

export default MyRequestSettings;
  