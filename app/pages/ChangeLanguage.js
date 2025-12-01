import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import React, { useEffect, useState } from "react";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import Icon from 'react-native-vector-icons/Ionicons';

const ChangeLanguage = ({navigation}) => {
    const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
    })();
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);


  return (
    <SafeAreaView
    style={[!isLoading ? styles.container : common_styles.center_align]}
  >
    {isLoading ? (
      <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
    ) : (
      <View style={[styles.container]}>
        <View style={[styles.containerInner, common_styles.shadowProp]}>
          <View style={styles.defaultTextContainer}>
              <Text style={styles.defaultText}>English</Text>
              <Icon name="checkmark-circle" style={common_styles.listI_icon_left} size={20} color={CssColors.green} />
          </View>
          <View style={styles.defaultTextContainer}>
              <Text style={styles.defaultText}>Kannada</Text>
          </View>
        </View>
      </View>
    )}
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    textAlign: "center",
    color: "black",
  },
  container: {
    display: 'flex',
    backgroundColor: CssColors.appBackground,
    margin: 12
  },
  containerInner: {
    display: 'flex',
    backgroundColor: CssColors.white,
    padding: 15,
    borderRadius: 6,
  },
  defaultTextContainer: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: CssColors.primaryBorder,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderWidth: 1,
    paddingBottom: 10,
    marginVertical: 10
  },
  defaultText: {
    fontSize: 14,
    color: CssColors.primaryPlaceHolderColor
  }
});

export default ChangeLanguage;