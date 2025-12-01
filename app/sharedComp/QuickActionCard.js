import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

const QuickActionCard = () => {
  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/images/quickActionsBg.png')} style={styles.backgroundImage} imageStyle={styles.imageStyle}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Dhanana...</Text>
          <Text style={styles.subtitle}>A20 001312202</Text>
          <Text style={styles.description}>You have won 7th auction</Text>
          <Text style={styles.date}>Auction Date: 20-Feb-2022</Text>
          <Text style={styles.amount}>Receivable Amount: ₹ 90,000</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add Surety</Text>
        </TouchableOpacity>
        <View style={styles.ribbonContainer}>
          <Text style={styles.ribbonText}>Surety pending</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 153, // 40% of screen width
    height: 153, // keeping it square
    margin: 10,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden', // This will ensure the borderRadius is applied to the image
  },
  imageStyle: {
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 12,
    color: '#fff',
    marginVertical: 5,
  },
  date: {
    fontSize: 10,
    color: '#fff',
  },
  amount: {
    fontSize: 10,
    color: '#fff',
  },
  button: {
    backgroundColor: '#004AAD',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 4,
    transform: [{ rotate: '45deg' }],
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  ribbonText: {
    fontSize: 8,
    color: '#FF0000',
    fontWeight: 'bold',
  },
});

export default QuickActionCard;
