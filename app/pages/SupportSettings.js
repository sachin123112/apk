import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import { openContact } from "../sharedComp/Utils";
import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";
import BranchesIconSVG from "./svgs/BranchesIconSVG";
import ChatIconSVG from "./svgs/ChatIconSVG";
import FAQIconSVG from "./svgs/FAQIconSVG";
import ContactUsIconSVG from "./svgs/ContactUsIconSVG";
import MailIconSVG from "./svgs/MailIconSVG";

const SupportSettings = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [languageData, setLanguageData] = useState({});

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    getLanguageData();
  }, []);

  const getLanguageData = async () => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}page/getResourceBundle?pageName=SUPPORT_DETAILS&language=en&serviceType=MOBILE`;
    const myLanguageData = await CommonService.commonGet(navigation, url);
    if (myLanguageData && myLanguageData !== 'null' && myLanguageData !== 'undefined') {
      if (myLanguageData && myLanguageData?.resourceBundle !== undefined) {
        setLanguageData(myLanguageData.resourceBundle);
      }
    }
    setIsLoading(false);
  };

  const list = [
    {
      name: languageData?.nearBranches?.label || "Near branches",
      desc: languageData?.nearBranchesDesc?.label || "Find address & agent contact",
      icon: "one",
      id: "1",
      url: "About"
    },
    {
      name: languageData?.liveChatSupport?.label || "Live chat support",
      desc: languageData?.liveChatSupportDesc?.label || "Type your query",
      icon: "two",
      id: "2",
      url: "Branches"
    },
    {
      name: languageData?.faq?.label || "Faq",
      desc: languageData?.faqDesc?.label || "Frequently asked questions",
      icon: "three",
      id: "3",
      url: "About"
    },
    {
      name: languageData?.mail?.label || "Mail",
      desc: languageData?.email?.label || "Email",
      icon: "four",
      id: "4",
      url: "About",
    },
    {
      name: "1800-103-0794",
      desc: languageData?.callDesc?.label || "Have a question? Connect with a specialist for answers.",
      icon: "five",
      id: "5",
      url: "About"
    },
  ];

  const onClickOpen = (item) => {
    if (item.id === "5") {
      openContact(18001030794);
    } else if (item.id === "3") {
      navigation.navigate("FAQs", {
        uri: 'https://mykcpl.com/faq',
      });
    } else if (item.id === "1") {
      navigation.navigate("NearByBranches", {
        uri: 'https://mykcpl.com/contact',
      });
    } else if (item.id === "4") {
      const email = "info@mykcpl.com";
      const subject = "App Support Email";
      const message = "Message Body";
      Linking.openURL(`mailto:${email}?subject=${subject}&body=${message}`);
    } else if (item.id === "2") {
      navigation.navigate("ContactUs", {
        uri: 'https://api.whatsapp.com/send?phone=919108002398&text=Hi',
      });
    } else {
      navigation.navigate(item.url);
    }
  };

  const ListItems = () => {
    return (
      <View style={common_styles.home_quick_links_container}>
        {list.map((item) => {
          return (
            <TouchableOpacity key={item.id} onPress={() => onClickOpen(item)}>
              <View style={common_styles.listI_itemWrapper}>
                {/* Left side */}
                <View style={common_styles.listI_leftWrapper}>
                  {item.icon=== 'one' && (
                    <BranchesIconSVG width={24} height={24} />
                  )}
                  {item.icon=== 'two' && (
                    <ChatIconSVG width={24} height={24} />
                  )}
                  {item.icon=== 'three' && (
                    <FAQIconSVG width={24} height={24} />
                  )}
                  {item.icon=== 'four' && (
                    <MailIconSVG width={24} height={24} />
                  )}
                  {item.icon=== 'five' && (
                    <ContactUsIconSVG width={24} height={24} />
                  )}
                  <View style={common_styles.listI_titlesWrapper}>
                    <Text style={common_styles.listI_title}>{item.name}</Text>
                    <Text style={common_styles.listI_subtitle}>
                      {item.desc}
                    </Text>
                  </View>
                </View>

                {/* Right side */}
                <View style={common_styles.rightWrapper}>
                  <Icon
                    name="angle-right"
                    size={24}
                    color={CssColors.primaryColor}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    {/* Content part */}
    <View>
        <ListItems />
    </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: CssColors.appBackground,
  },
});

export default SupportSettings;
