import React from 'react';
import { Image } from 'react-native';

const ChitIconDisplay = ({ chitValue, imageStyle }) => {
  const chitImages = {
    '1L': require('../../assets/chitIcons/1L.png'),
    '1.5L': require('../../assets/chitIcons/1.5L.png'),
    '2L': require('../../assets/chitIcons/2L.png'),
    '3L': require('../../assets/chitIcons/3L.png'),
    '4L': require('../../assets/chitIcons/4L.png'),
    '5L': require('../../assets/chitIcons/5L.png'),
    '6L': require('../../assets/chitIcons/6L.png'),
    '8L': require('../../assets/chitIcons/8L.png'),
    '10L': require('../../assets/chitIcons/10L.png'),
    '12.5L': require('../../assets/chitIcons/12.5L.png'),
    '15L': require('../../assets/chitIcons/15L.png'),
    '25L': require('../../assets/chitIcons/25L.png'),
    '30L': require('../../assets/chitIcons/30L.png'),
    '50L': require('../../assets/chitIcons/50L.png'),
    '1Cr': require('../../assets/chitIcons/1Cr.png'),
  };

  // Get default image based on chitValue ranges
  const getDefaultImage = (value) => {
    if (value <= 500000) {
      return require('../../assets/chitIcons/lessthan_5.png');
    } else if (value < 1500000 && value >= 500001) {
      return require('../../assets/chitIcons/lessthan_15.png');
    } else {
      return require('../../assets/chitIcons/morethan_15.png');
    }
  };

  // Format chitValue to match the keys in chitImages
  const formattedKey = 
    chitValue >= 10000000 ? `${(chitValue / 10000000).toFixed(0)}Cr` :
    chitValue >= 100000 ? `${(chitValue / 100000).toFixed(0)}L` : 
    `${(chitValue / 1000).toFixed(0)}K`;

  // Determine the image source based on the formatted key
  const imageSource = chitImages[formattedKey] || getDefaultImage(chitValue);

  return (
    <Image
      source={imageSource}
      resizeMode="contain"
      style={imageStyle}
    />
  );
};

export default ChitIconDisplay;