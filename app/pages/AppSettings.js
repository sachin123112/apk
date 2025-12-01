import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  BackHandler
} from "react-native";
import React, { useState, useEffect } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import LanguagesIconSVG from '../pages/svgs/LanguagesIconSVG';
import NotificationsIconSVG from '../pages/svgs/NotificationsIconSVG';
import AppSecurityIconSVG from '../pages/svgs/AppSecurityIconSVG';
import { CssColors } from "../css/css_colors";
import common_styles from "../css/common_styles";
import DeviceInfo from 'react-native-device-info';

const AppSettings = ({ navigation }) => {
  const [isNotifications, setIsNotifications] = useState(false);
  const [isAppSecurity, setIsAppSecurity] = useState(false);
  const notificationSwitch = () => setIsNotifications(previousState => !previousState);
  const appSecuritySwitch = () => setIsAppSecurity(previousState => !previousState);
  const readableVersion = DeviceInfo.getVersion();
  const appSettings = [
    {
      name: 'Languages',
      icon: 'language',
      desc: 'Chosen language: English',
      id: '1',
      url: 'ChangeLanguage',
      rightArrow: true,
      checkBox: false,
      disabled: false,
      isAppSecurity: false,
      isNotification: false
    },
    {
      name: 'Notification',
      desc: 'Enable or disable the notification',
      icon: 'notification',
      id: '2',
      url: 'Branches',
      rightArrow: false,
      checkBox: true,
      disabled: true,
      isAppSecurity: false,
      isNotification: true
    },
    {
      name: 'App security',
      desc: 'Biometric & screen lock',
      icon: 'fingerprint',
      id: '4',
      url: 'Branches',
      rightArrow: false,
      checkBox: true,
      disabled: true,
      isAppSecurity: true,
      isNotification: false
    }
  ];

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  const AppSettingsData = () => {
    return (
      <View style={common_styles.home_quick_links_container}>
        {appSettings.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate(item.url)}
            >
              <View style={styles.listContainer}>

                {/* Left side */}
                <View style={styles.listI_leftWrapper}>
                  {item.icon === 'language' &&
                    <LanguagesIconSVG width={24} height={24} />
                  }
                  {item.icon === 'notification' &&
                    <NotificationsIconSVG width={24} height={24} />
                  }
                  {item.icon === 'fingerprint' &&
                    <AppSecurityIconSVG width={24} height={24} />
                  }
                  <View style={common_styles.listI_titlesWrapper}>
                    <Text style={common_styles.listI_title}>{item.name}</Text>
                    <Text style={common_styles.listI_subtitle}>{item.desc}</Text>
                  </View>
                </View>

                {/* Right side */}
                <View style={common_styles.rightWrapper}>
                  {(item.rightArrow) &&
                    <Icon name="angle-right" size={24} color={CssColors.primaryColor} />
                  }
                  {(item.checkBox && item.isNotification) &&
                    <Switch
                      trackColor={{ false: '#767577', true: '#8F9BB3' }}
                      thumbColor={isNotifications ? '#072E77' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={notificationSwitch}
                      value={isNotifications}
                      disabled={item.disabled}
                    />
                  }
                  {(item.checkBox && item.isAppSecurity) &&
                    <Switch
                      trackColor={{ false: '#767577', true: '#8F9BB3' }}
                      thumbColor={isAppSecurity ? '#072E77' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={appSecuritySwitch}
                      value={isAppSecurity}
                      disabled={item.disabled}
                    />
                  }
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
      <View style={styles.content}>
        <AppSettingsData />
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Version {readableVersion}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: CssColors.appBackground,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: CssColors.homeDetailsBorder,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderWidth: 1,
  },
  listI_leftWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: '65%'
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 4,
  },
  versionText: {
    textAlign: 'center',
    color: '#9AA4B2',
    fontSize: 12,
    marginBottom: 12,
  },
});

export default AppSettings;
