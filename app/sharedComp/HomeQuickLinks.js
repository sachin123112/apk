import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CssColors } from '../css/css_colors';
import { openContact } from '../sharedComp/Utils';
import AboutIconSVG from '../pages/svgs/AboutIconSVG';
import BranchesIconSVG from '../pages/svgs/BranchesIconSVG';
import ChatIconSVG from '../pages/svgs/ChatIconSVG';
import FAQIconSVG from '../pages/svgs/FAQIconSVG';
import ContactUsIconSVG from '../pages/svgs/ContactUsIconSVG';
import IconThree from "react-native-vector-icons/Entypo";
import common_styles from '../css/common_styles';

const HomeQuickLinks = ({ navigation }) => {
  const list = [
    {
      name: 'About Kodachadri Chits Pvt. Ltd.',
      icon: 'info',
      desc: 'Know about us',
      id: '1',
      url: 'About',
    },
    {
      name: 'Near branches',
      desc: 'Find address & agent contact',
      icon: 'map-marker',
      id: '2',
      url: 'Branches',
    },
    {
      name: 'Live chat support',
      desc: 'Type your query',
      icon: 'user-o',
      id: '3',
      url: 'About',
    },
    {
      name: 'Faq',
      desc: 'Frequently asked questions',
      icon: 'question-circle-o',
      id: '4',
      url: 'About',
    },
    {
      name: 'Contact us',
      desc: 'Have a question? Connect with a specialist for answers.',
      icon: 'phone',
      id: '5',
      url: 'About',
    },
  ];

  const onClickOpen = (item) => {
    if (item.id === '5') {
      openContact(18001030794);
    } else if (item.id === '3') {
      navigation.navigate('ContactUs', {
        uri: 'https://api.whatsapp.com/send?phone=919108002398&text=Hi',
      });
    } else if (item.id === '4') {
      navigation.navigate('FAQs', {
        uri: 'https://mykcpl.com/faq',
      });
    } else if (item.id === '1') {
      navigation.navigate('AboutUs', {
        uri: 'https://mykcpl.com/about',
      });
    } else if (item.id === '2') {
      navigation.navigate('NearByBranches', {
        uri: 'https://mykcpl.com/contact',
      });
    } else {
      navigation.navigate(item.url);
    }
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'info':
        return <AboutIconSVG width={24} height={24} />;
      case 'map-marker':
        return <BranchesIconSVG width={24} height={24} />;
      case 'user-o':
        return <ChatIconSVG width={24} height={24} />;
      case 'question-circle-o':
        return <FAQIconSVG width={24} height={24} />;
      case 'phone':
        return <ContactUsIconSVG width={24} height={24} />;
      default:
        return null;
    }
  };

  return (
		<>
		<View style={styles.mySavingsTopContainer}>
			<IconThree name="link" width={16} height={16} size={16} color={CssColors.black} />
      <Text style={styles.mySavingsTopTitle}>Quick Links</Text>
    </View>
		<View style={[styles.home_quick_links_container]}>
      {list.map((item, index) => {
        return (
          <TouchableOpacity 
            key={index} 
            onPress={() => onClickOpen(item)}
            style={[styles.listI_itemWrapper, common_styles.shadowProp]}
          >
            {/* Left side */}
            <View style={styles.listI_leftWrapper}>
              {renderIcon(item.icon)}
              <View style={styles.listI_titlesWrapper}>
                <Text style={styles.listI_title}>{item.name}</Text>
                <Text style={styles.listI_subtitle}>
                  {item.desc}
                </Text>
              </View>
            </View>

            {/* Right side */}
            <View style={styles.rightWrapper}>
              <Icon
                name="angle-right"
                size={24}
                color={CssColors.primaryColor}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
		</>

  );
};

const styles = StyleSheet.create({
	mySavingsTopContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingLeft: 12,
		marginBottom: 5
  },
  mySavingsTopTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: CssColors.primaryPlaceHolderColor,
    marginLeft: 5,
  },
	home_quick_links_container: {
		marginHorizontal: 13,
		marginTop: 10,
	},
	listI_itemWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: CssColors.white,
    marginBottom: 10,
    borderRadius: 6,
  },
	rightWrapper: {
    alignItems: "flex-end",
  },
	listI_leftWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
	listI_titlesWrapper: {
    marginLeft: 12,
    maxWidth: "90%",
  },
	listI_title: {
    fontSize: 12,
    color: CssColors.primaryColor,
  },
	listI_subtitle: {
    marginTop: 4,
    fontSize: 10,
    color: CssColors.primaryBorder,
  },
})

export default HomeQuickLinks;