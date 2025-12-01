import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { CssColors } from "../css/css_colors";
import NameTitle from './NameTitle';
import InfoText from './InfoText';
import common_styles from "../css/common_styles";
import TotalSavingsSVG from "../pages/svgs/TotalSavingsSVG";
import TotalChitsSVG from "../pages/svgs/TotalChitsSVG";
import DividendEarnedSVG from "../pages/svgs/DividendEarnedSVG";
import TotalInvestedSVG from "../pages/svgs/TotalInvestedSVG";
import RupeeSymbolSVG from "../pages/svgs/RupeeSymbolSVG";
import { useNavigation } from '@react-navigation/native';

// Reusable component for each box content
const FinancialBox = ({
  IconComponent,
  iconWidth = 16,
  iconHeight = 16,
  title,
  content,
  isCurrency = false,
  isHighlighted = false,
  onPress
}) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#8F9BB3' }}   
      style={({ pressed }) => [
        styles.box,               
        pressed && { opacity: 0.6 }          
      ]}
    >
      <View style={styles.boxContent}>
        <View style={styles.iconContainer}>
          <IconComponent width={iconWidth} height={iconHeight} />
        </View>
        <View style={styles.textContainer}>
          <NameTitle title={title} fontSize={12} />
          <InfoText
            content={content}
            isBold={true}
            isCurrency={isCurrency}
            customStyle={[
              styles.contentText,
              isHighlighted && styles.highlightText
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
};

const FinancialSummaryCard = ({
  numChits = '10',
  totalSavings = '12,20,000',
  totalInvested = '20,000',
  dividendEarned = '20,000',
}) => {

  const navigation = useNavigation();

  const goToMyChits = () => {
    navigation.navigate("MyChitsNavigator", {
      screen: "MyChits"
    });
  };

  return (
    <>
      <View style={styles.mySavingsTopContainer}>
        <TotalInvestedSVG width={16} height={16} style={{ marginTop: 2 }} />
        <Text style={styles.mySavingsTopTitle}>My savings</Text>
      </View>

      <View style={[styles.container, common_styles.shadowProp]}>
        {/* Main Grid Container */}
        <View style={styles.gridContainer}>

          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Top Left Box */}
            <FinancialBox
              IconComponent={TotalChitsSVG}
              iconWidth={20}
              iconHeight={20}
              title="Number of chits"
              content={numChits}
              onPress={goToMyChits}
            />

            {/* Horizontal Divider in Left Column */}
            <View style={styles.horizontalDivider} />

            {/* Bottom Left Box */}
            <FinancialBox
              IconComponent={RupeeSymbolSVG}
              iconWidth={20}
              iconHeight={20}
              title="Total invested"
              content={totalInvested}
              isCurrency={true}
              onPress={goToMyChits}
            />
          </View>

          {/* Vertical Divider - Full Height */}
          <View style={styles.verticalDivider} />

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Top Right Box */}
            <FinancialBox
              IconComponent={TotalSavingsSVG}
              iconWidth={22}
              iconHeight={22}
              title="Total savings"
              content={totalSavings}
              isCurrency={true}
              isHighlighted={true}
              onPress={goToMyChits}
            />

            {/* Horizontal Divider in Right Column */}
            <View style={styles.horizontalDivider} />

            {/* Bottom Right Box */}
            <FinancialBox
              IconComponent={DividendEarnedSVG}
              iconWidth={22}
              iconHeight={22}
              title="Dividend earned"
              content={dividendEarned}
              isCurrency={true}
              onPress={goToMyChits}
            />
          </View>
        </View>
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
    paddingLeft: 14
  },
  mySavingsTopTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: CssColors.primaryPlaceHolderColor,
    marginLeft: 5,
  },
  container: {
    borderRadius: 12,
    margin: 12,
    backgroundColor: CssColors.white,
    overflow: 'hidden', // Ensures border radius is respected
  },
  gridContainer: {
    flexDirection: 'row',
    minHeight: 120, // Ensures consistent height
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  verticalDivider: {
    width: 2,
    backgroundColor: '#EEEEEE',
    // This will stretch from top to bottom automatically
  },
  horizontalDivider: {
    height: 2,
    backgroundColor: '#EEEEEE',
  },
  box: {
    flex: 1,
    padding: 15, // Equal padding for all boxes
    justifyContent: 'center',
    minHeight: 77, // Ensures consistent height for all boxes
  },
  boxContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  highlightText: {
    color: CssColors.textColorSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinancialSummaryCard;

