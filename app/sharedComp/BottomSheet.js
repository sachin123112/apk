import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import common_styles from "../css/common_styles";
import { CssColors } from "../css/css_colors";
import IconInCircle from "./IconInCircle";
import WaitForApprovalSVG from "../pages/svgs/WaitForApprovalSVG";
import LogoutIconSVG from "../pages/svgs/LogoutIconSVG";
import CompleteChitEnrolmentSVG from "../pages/svgs/CompleteChitEnrolmentSVG";
import ProfileIconSVG from "../pages/svgs/ProfileIconSVG";
import NoAuctionsIconSVG from "../pages/svgs/NoAuctionsIconSVG";
import ClearDuesSVG from "../pages/svgs/ClearDuesSVG";
import PledgedChitSvg from "../pages/svgs/PledgedChitSvg";

// Custom BottomSheetView component
const BottomSheetView = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>;
};

const BottomPopUp = (props) => {
  const [isVisible, setIsVisible] = useState(true);
  const [slideAnimation] = useState(new Animated.Value(0));
  const screenHeight = Dimensions.get('window').height;
  const popupData = props.data;
  
  // Use consistent height calculation like DefaultBottomSheet.js
  const height = props.height || (popupData.showIconName === "logout" ? "32%" : "35%");
  const modalHeight = height === 'auto' ? undefined : 
    typeof height === 'number' ? height : 
    height.includes('%') ? screenHeight * (parseInt(height) / 100) : 300;

  useEffect(() => {
    // Animate the bottom sheet up when visible
    if (isVisible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 10,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate the bottom sheet down when hiding
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start(() => {
        // After animation completes, call the onClose callback
        props.onClose();
      });
    }
  }, [isVisible, slideAnimation]);

  // Calculate translateY based on the animation value
  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const closePopUp = useCallback((confirmed = false) => {
    setIsVisible(false);
  }, []);

  const onSubmitTap = () => {
    setIsVisible(false);
    props.onSubmit();
  };

  const renderButtons = () => {
    if (popupData.totalButtons === 1) {
      return (
        <TouchableOpacity style={styles.submit} onPress={onSubmitTap}>
          <Text style={styles.submitText}>{popupData.sendButtonTitle}</Text>
        </TouchableOpacity>
      );
    }

    if (popupData.totalButtons === 2) {
      return (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.multiButtons} onPress={() => closePopUp(false)}>
            <Text style={styles.multiButtonText}>{popupData.cancelButtonTitle}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.multiButtons,
              { borderColor: popupData.sendButtonBGColor },
            ]}
            onPress={onSubmitTap}
          >
            <Text
              style={[
                styles.multiButtonText,
                { color: popupData.sendButtonBGColor },
              ]}
            >
              {popupData.sendButtonTitle}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderIcon = () => {
    if (popupData.showIcon) {
      return (
        <View style={styles.iconBg}>
          <IconInCircle
            name={popupData.showIconName}
            size={60}
            color={CssColors.primaryColor}
            style={styles.thumbnail}
            borderWidth={1}
            circleSize={100}
            bgColor={CssColors.iconBackground}
            borderColor={CssColors.iconBackground}
            antDesign={true}
          />
        </View>
      );
    } else if (popupData.showSVG) {
      return (
        <View style={styles.iconBg}>
          {popupData.showIconName === "approval" && <WaitForApprovalSVG width={130} height={130} />}
          {popupData.showIconName === "logout" && <LogoutIconSVG width={130} height={130} />}
          {popupData.showIconName === "pledged" && (
            <View style={common_styles.pledged_chit_icon_container}>
              <PledgedChitSvg />
            </View>
          )}
          {popupData.showIconName === "enroll" && <CompleteChitEnrolmentSVG width={130} height={130} />}
          {popupData.showIconName === "clearDues" && <ClearDuesSVG width={130} height={130} />}
          {popupData.showIconName === "profile" && <ProfileIconSVG width={130} height={130} />}
          {popupData.showIconName === "cancelBid" && <NoAuctionsIconSVG width={130} height={130} />}
        </View>
      );
    } else {
      return (
        <View style={styles.imageBG}>
          <Image
            source={require("../../assets/icons/certificate_icon.png")}
            resizeMode="contain"
            style={styles.image}
          />
        </View>
      );
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={() => closePopUp(false)}
    >
      <View style={styles.container}>
        {/* Grey overlay */}
        <TouchableWithoutFeedback onPress={() => closePopUp(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Bottom sheet content */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            { transform: [{ translateY }] },
            modalHeight ? { height: modalHeight } : {}
          ]}
        >
          
          {/* Close button */}
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => closePopUp(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <BottomSheetView>
            <ScrollView>
              <View style={{ padding: 16 }}>
                {renderIcon()}
                <Text style={[styles.title, { color: popupData.titleColor }]}>{popupData.title}</Text>
                <Text style={styles.description}>{popupData.description}</Text>
                {renderButtons()}
              </View>
            </ScrollView>
          </BottomSheetView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: CssColors.appBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    // Shadow for Android
    elevation: 6,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: CssColors.primaryColor,
    fontWeight: '600',
  },
  imageBG: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: "#E5EDF4",
    alignSelf: "center",
  },
  iconBg: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 50,
    width: 50,
    top: 23,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "600",
    marginTop: 15,
  },
  description: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 15,
    color: CssColors.primaryPlaceHolderColor,
  },
  submit: {
    marginHorizontal: 40,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#072E77",
    backgroundColor: "#072E77",
    borderRadius: 30,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  multiButtons: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 10,
    paddingVertical: 10,
    borderColor: "#072E77",
    borderWidth: 1,
    marginBottom: 10,
  },
  multiButtonText: {
    color: "#072E77",
    textAlign: "center",
    fontSize: 16,
  },
});

export { BottomSheetView };
export default BottomPopUp;