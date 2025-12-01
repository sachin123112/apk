// SwiperComponent.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Swiper from 'react-native-swiper';
import FastImage from '@d11/react-native-fast-image';

const sliderHeight = 150; // Fixed height for the slider

const ImageCarousel = ({ data }) => {
  const handleBannerPress = async (href) => {
    try {
      const supported = await Linking.canOpenURL(href);
      if (supported) {
        await Linking.openURL(href);
      } else {
        console.log(`Don't know how to open this URL: ${href}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Swiper
        style={styles.wrapper}
        loop={true}
        autoplay={true}
        dot={<View style={styles.dot} />}
        activeDot={<View style={[styles.dot, styles.activeDot]} />}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.slide}
            onPress={() => handleBannerPress(item.href)}
            activeOpacity={0.9}
          >
            <FastImage
              source={{ uri: item.uri, priority: FastImage.priority.high }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: sliderHeight,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 13,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 13,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc', // Inactive dot color
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007aff', // Active dot color
  },
});

export default ImageCarousel;
