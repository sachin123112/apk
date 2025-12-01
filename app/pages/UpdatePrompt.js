import React, { memo, useRef, useEffect } from 'react';
import {
  Modal,
  Platform,
  Linking,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ForceUpdateBottomSheet({
  visible,
  title = 'A new update is here!',
  subtitle = 'Update now to explore the latest features and enjoy an even smoother experience.',
  headerSource = require('../../assets/UpdatePopup2.png'),
}) {
  const insets = useSafeAreaInsets();

  const pulseScale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.15)).current;
  const arrowTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let pulse;
    if (visible) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1.05,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shadowOpacity, {
              toValue: 0.35,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(arrowTranslateX, {
              toValue: 5,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shadowOpacity, {
              toValue: 0.1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(arrowTranslateX, {
              toValue: 0,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulse.start();
    } else {
      pulseScale.setValue(1);
      shadowOpacity.setValue(0.15);
      arrowTranslateX.setValue(0);
    }
    return () => pulse && pulse.stop();
  }, [visible]);

  const openStore = async () => {
    try {
      const androidStoreUrl = 'market://details?id=com.bharatchits.androidapp';
      const iosStoreUrl = 'itms-apps://itunes.apple.com/app/id6444745166';
      const fallback =
        Platform.OS === 'android'
          ? 'https://play.google.com/store/apps/details?id=com.bharatchits.androidapp'
          : 'https://apps.apple.com/in/app/example-app/id6444745166';

      const deepLink = Platform.OS === 'ios' ? iosStoreUrl : androidStoreUrl;
      const supported = await Linking.canOpenURL(deepLink);
      await Linking.openURL(supported ? deepLink : fallback);
    } catch (e) {
      console.warn('Store link failed, using fallback', e);
    }
  };

  return (
    <Modal visible={!!visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.backdrop} />

      <View
        style={[
          styles.sheetWrap,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {/* ⭐ HEADER IMAGE OUTSIDE THE SHEET ⭐ */}
        <Image source={headerSource} style={styles.headerImage} resizeMode="contain" />

        <LinearGradient
          colors={['#FFDFC7', '#FEF5EA', '#FEF5EA', 'rgba(254,245,234,0)']}
          locations={[0, 0.5, 0.4, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.sheet}
        >
          <ImageBackground
            source={require('../../assets/Background_Image.png')}
            resizeMode="cover"
            style={{ width: '100%' }}
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <Pressable
              onPress={openStore}
              android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: false }}
              style={{ width: '100%', alignItems: 'center', paddingBottom: 60 }}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shadowLayer,
                  {
                    opacity: shadowOpacity,
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.buttonWrap,
                  { transform: [{ scale: pulseScale }] },
                ]}
              >
                <LinearGradient
                  colors={['#FF4A00', '#FFB75E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Animated.View
                    style={[
                      styles.buttonInner,
                      Platform.OS === 'ios' ? { transform: [{ translateX: -16 }] } : null,
                    ]}
                  >
                    <Text style={styles.buttonText}>Update</Text>

                    <Animated.Text
                      style={[
                        styles.arrow,
                        { transform: [{ translateX: arrowTranslateX }] },
                      ]}
                    >
                      ›
                    </Animated.Text>
                  </Animated.View>
                </LinearGradient>

              </Animated.View>
            </Pressable>
          </ImageBackground>
        </LinearGradient>
      </View>
    </Modal>
  );
}

export default memo(ForceUpdateBottomSheet);

const { width: W } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS == 'ios' ? -32 : -25,
    alignItems: 'center',
  },

  sheet: {
    width: '100%',
    alignSelf: 'center',
    // borderTopLeftRadius: 22,
    // borderTopRightRadius: 22,
    paddingTop: 40,
    // paddingBottom: 20,
    paddingHorizontal: Platform.OS == 'ios' ? 0 : 20,
    backgroundColor: '#FEF5EA',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },

  headerImage: {
    position: 'absolute',
    top: -115,
    width: W,
    height: 230,
    alignSelf: 'center',
    zIndex: 100,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF4F00',
    textAlign: 'center',
    marginTop: Platform.OS == 'ios' ? 50 : 100,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 21,
    color: '#2E3135',
    textAlign: 'center',
    opacity: 0.9,
    marginHorizontal: 8,
    marginBottom: 16,
  },

  buttonWrap: { width: '100%' },

  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    marginBottom: Platform.OS == 'ios' ? 15 : 0,
    width: '100%',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', marginRight: 12 },

  arrow: { color: '#FFFFFF', fontSize: 60, fontWeight: '300', marginTop: Platform.OS == 'ios' ? -12 : -18 },

  shadowLayer: {
    position: 'absolute',
    width: Platform.OS == 'ios' ? '87%' : '100%',
    height: 58,
    borderRadius: 25,
    backgroundColor: '#0000007c',
    top: 4,
  },
});