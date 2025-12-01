import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const useShimmerAnimation = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      animatedValue.setValue(0);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
    return () => animatedValue.stopAnimation();
  }, [animatedValue]);

  return animatedValue;
};

const SkeletonHeader = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerBar} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonHeaderTwo = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={styles.headerTwoContainer}>
      <View style={styles.headerTwoTopRow}>
        <View style={styles.headerTwoTopItem} />
        <View style={styles.headerTwoTopItem} />
        <View style={styles.headerTwoTopItem} />
      </View>
      <View style={styles.headerTwoBottomBar} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonSlider = ({ height = 200 }) => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={[styles.sliderContainer, { height }]}>
      <View style={styles.sliderContent} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonQuickAction = () => {
  const animatedValueLeft = useShimmerAnimation();
  const animatedValueRight = useShimmerAnimation();
  const translateXLeft = animatedValueLeft.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  const translateXRight = animatedValueRight.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.quickActionContainer}>
      <View style={styles.quickActionHeader} />
      <View style={styles.quickActionCardsContainer}>
        <View style={styles.quickActionLeftCard}>
          <View style={styles.quickActionTextLine} />
          <View style={styles.quickActionTextLine} />
          <View style={styles.quickActionTextLine} />
          <View style={styles.quickActionButton} />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.shimmerOverlay,
              { transform: [{ translateX: translateXLeft }] },
            ]}
          />
        </View>
        <View style={styles.quickActionRightCard}>
          <View style={styles.quickActionTextLine} />
          <View style={styles.quickActionTextLine} />
          <View style={styles.quickActionTextLine} />
          <View style={styles.quickActionButton} />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.shimmerOverlay,
              { transform: [{ translateX: translateXRight }] },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const SkeletonFinancialCard = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.financialCardContainer}>
      <View style={styles.financialCardHeader} />
      <View style={styles.financialCardGrid}>
        <View style={styles.financialCardRow}>
          <View style={styles.financialCardItem}>
            <View style={styles.financialCardAvatar} />
            <View style={styles.financialCardTextContainer}>
              <View style={styles.financialCardTextLarge} />
              <View style={styles.financialCardTextSmall} />
            </View>
          </View>
          <View style={styles.financialCardItem}>
            <View style={styles.financialCardAvatar} />
            <View style={styles.financialCardTextContainer}>
              <View style={styles.financialCardTextLarge} />
              <View style={styles.financialCardTextSmall} />
            </View>
          </View>
        </View>
        <View style={styles.financialCardRow}>
          <View style={styles.financialCardItem}>
            <View style={styles.financialCardAvatar} />
            <View style={styles.financialCardTextContainer}>
              <View style={styles.financialCardTextLarge} />
              <View style={styles.financialCardTextSmall} />
            </View>
          </View>
          <View style={styles.financialCardItem}>
            <View style={styles.financialCardAvatar} />
            <View style={styles.financialCardTextContainer}>
              <View style={styles.financialCardTextLarge} />
              <View style={styles.financialCardTextSmall} />
            </View>
          </View>
        </View>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.shimmerOverlay,
            { transform: [{ translateX }] },
          ]}
        />
      </View>
    </View>
  );
};

const SkeletonChat = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.chatContainer}>
      <View style={styles.chatMessageLeftContainer}>
        <View style={styles.chatMessageLeftBubble} />
      </View>
      
      <View style={styles.chatMessageRightContainer}>
        <View style={styles.chatMessageRightBubble} />
      </View>
      
      <View style={styles.chatMessageLeftContainer}>
        <View style={styles.chatMessageLeftBubble} />
      </View>
      
      <View style={styles.chatMessageRightContainer}>
        <View style={styles.chatMessageRightBubble} />
      </View>
      
      <View style={styles.chatMessageLeftContainer}>
        <View style={styles.chatMessageLeftBubble} />
      </View>
      
      <View style={styles.chatMessageRightContainer}>
        <View style={styles.chatMessageRightBubble} />
      </View>
      
      <View style={styles.chatMessageLeftContainer}>
        <View style={styles.chatMessageLeftBubble} />
      </View>
      
      <View style={styles.chatMessageRightContainer}>
        <View style={styles.chatMessageRightBubble} />
      </View>

      <View style={styles.chatMessageLeftContainer}>
        <View style={styles.chatMessageLeftBubble} />
      </View>
      
      <View style={styles.chatMessageRightContainer}>
        <View style={styles.chatMessageRightBubble} />
      </View>

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonCardDefault = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.cardDefaultContainer}>
      <View style={styles.cardDefaultTopRow}>
        <View style={styles.cardDefaultTopLeftBar} />
        <View style={styles.cardDefaultTopRightCircle} />
      </View>
      <View style={styles.cardDefaultMiddleRow}>
        <View style={styles.cardDefaultMiddleItem} />
        <View style={styles.cardDefaultMiddleItem} />
        <View style={styles.cardDefaultMiddleItem} />
      </View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonCardOne = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.cardOneContainer}>
      <View style={styles.cardOneTopRow}>
        <View style={styles.cardOneTopLeftBar} />
        <View style={styles.cardOneTopRightCircle} />
      </View>
      <View style={styles.cardOneGridRow}>
        <View style={styles.cardOneGridItem} />
        <View style={styles.cardOneGridItem} />
        <View style={styles.cardOneGridItem} />
      </View>
      <View style={styles.cardOneGridRow}>
        <View style={styles.cardOneGridItem} />
        <View style={styles.cardOneGridItem} />
        <View style={styles.cardOneGridItem} />
      </View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonCardTwo = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.cardTwoContainer}>
      <View style={styles.cardTwoTopSection}>
        <View style={styles.cardTwoAvatarPlaceholder} />
        <View style={styles.cardTwoTextLinesContainer}>
          <View style={styles.cardTwoTextLineLarge} />
          <View style={styles.cardTwoTextLineSmall} />
        </View>
        <View style={styles.cardTwoTextLineMedium} />
      </View>

      <View style={styles.cardTwoMiddleSection}>
        <View style={styles.cardTwoRectanglePlaceholder} />
        <View style={styles.cardTwoRectanglePlaceholder} />
        <View style={styles.cardTwoRectanglePlaceholder} />
        <View style={styles.cardTwoRectanglePlaceholder} />
      </View>

      <View style={styles.cardTwoBottomSection}>
        <View style={styles.cardTwoTextLineMedium} />
        <View style={styles.cardTwoButtonPlaceholder} />
      </View>

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonCardThree = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.cardThreeContainer}>
      <View style={styles.cardThreeTopSection}>
        <View style={styles.cardThreeAvatarPlaceholder} />
        <View style={styles.cardThreeTextLinesContainer}>
          <View style={styles.cardThreeTextLineLarge} />
          <View style={styles.cardThreeTextLineSmall} />
        </View>
      </View>

      <View style={styles.cardThreeGridSection}>
        <View style={styles.cardThreeGridRow}>
          <View style={styles.cardThreeGridItem} />
          <View style={styles.cardThreeGridItem} />
          <View style={styles.cardThreeGridItem} />
        </View>
        <View style={styles.cardThreeGridRow}>
          <View style={styles.cardThreeGridItem} />
          <View style={styles.cardThreeGridItem} />
          <View style={styles.cardThreeGridItem} />
        </View>
        <View style={styles.cardThreeGridRow}>
          <View style={styles.cardThreeGridItem} />
          <View style={styles.cardThreeGridItem} />
          <View style={styles.cardThreeGridItem} />
        </View>
      </View>

      <View style={styles.cardThreeBottomSection}>
        <View style={styles.cardThreeBottomBar} />
      </View>

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonCardFour = () => {
  const animatedValue = useShimmerAnimation();
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.cardFourContainer}>
      <View style={styles.cardFourContent}>
        <View style={styles.cardFourAvatar} />
        <View style={styles.cardFourTextContainer}>
          <View style={styles.cardFourTextLineLarge} />
          <View style={styles.cardFourTextLineSmall} />
        </View>
        <View style={styles.cardFourRightContainer}>
          <View style={styles.cardFourRectangleOne} />
          <View style={styles.cardFourRectangleTwo} />
        </View>
      </View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

const SkeletonLoader = ({
  numberOfCards = 0,
  header = false,
  headerTwo = false,
  chat = false,
  quickAction = false,
  financialCard = false,
  cardTypeOne = 0,
  cardTypeTwo = 0,
  cardTypeThree = 0,
  cardTypeFour = 0,
  order = ['header', 'headerTwo', 'chat', 'quickAction', 'financialCard', 'default', 'typeOne', 'typeTwo', 'typeThree', 'typeFour'],
}) => {
  const renderCards = () => {
    const cards = [];
    
    order.forEach((item, index) => {
      if (typeof item === 'object' && item.type === 'slider') {
        cards.push(<SkeletonSlider key={`slider-${index}`} height={item.height} />);
        return;
      }
      
      if (typeof item === 'string') {
        switch (item) {
          case 'header':
            if (header) {
              cards.push(<SkeletonHeader key="header" />);
            }
            break;
          case 'headerTwo':
            if (headerTwo) {
              cards.push(<SkeletonHeaderTwo key="headerTwo" />);
            }
            break;
          case 'chat':
            if (chat) {
              cards.push(<SkeletonChat key="chat" />);
            }
            break;
          case 'quickAction':
            if (quickAction) {
              cards.push(<SkeletonQuickAction key="quickAction" />);
            }
            break;
          case 'financialCard':
            if (financialCard) {
              cards.push(<SkeletonFinancialCard key="financialCard" />);
            }
            break;
          case 'default':
            for (let i = 0; i < numberOfCards; i++) {
              cards.push(<SkeletonCardDefault key={`default-${i}`} />);
            }
            break;
          case 'typeOne':
            for (let i = 0; i < cardTypeOne; i++) {
              cards.push(<SkeletonCardOne key={`typeOne-${i}`} />);
            }
            break;
          case 'typeTwo':
            for (let i = 0; i < cardTypeTwo; i++) {
              cards.push(<SkeletonCardTwo key={`typeTwo-${i}`} />);
            }
            break;
          case 'typeThree':
            for (let i = 0; i < cardTypeThree; i++) {
              cards.push(<SkeletonCardThree key={`typeThree-${i}`} />);
            }
            break;
          case 'typeFour':
            for (let i = 0; i < cardTypeFour; i++) {
              cards.push(<SkeletonCardFour key={`typeFour-${i}`} />);
            }
            break;
          default:
            break;
        }
      }
    });
    
    return cards;
  };

  return (
    <View style={styles.loaderContainer}>
      {renderCards()}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    padding: 0,
    backgroundColor: '#f0f0f0',
  },
  shimmerOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },

  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  headerBar: {
    width: '90%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    alignSelf: 'center',
  },

  headerTwoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 80,
  },
  headerTwoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerTwoTopItem: {
    width: '30%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  headerTwoBottomBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },

  sliderContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 0,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  sliderContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },

  quickActionContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 0,
    padding: 16,
    marginBottom: 5,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 200,
  },
  quickActionHeader: {
    width: '30%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  quickActionCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  quickActionLeftCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '46%',
    overflow: 'hidden',
    position: 'relative',
  },
  quickActionRightCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '46%',
    overflow: 'hidden',
    position: 'relative',
  },
  quickActionTextLine: {
    width: '100%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
  },
  quickActionButton: {
    width: '80%',
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    marginTop: 'auto',
    alignSelf: 'center',
  },

  financialCardContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 0,
    padding: 16,
    marginBottom: 5,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 200,
  },
  financialCardHeader: {
    width: '40%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  financialCardGrid: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
  },
  financialCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  financialCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  financialCardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  financialCardTextContainer: {
    flex: 1,
  },
  financialCardTextLarge: {
    width: '80%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  financialCardTextSmall: {
    width: '60%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },

  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 600,
  },
  chatMessageLeftContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chatMessageRightContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  chatMessageLeftBubble: {
    width: '45%',
    height: 72,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginLeft: 4,
  },
  chatMessageRightBubble: {
    width: '45%',
    height: 72,
    backgroundColor: '#d4d4d4',
    borderRadius: 4,
    marginRight: 4,
  },

  cardDefaultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 100,
  },
  cardDefaultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardDefaultTopLeftBar: {
    width: '50%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardDefaultTopRightCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
  },
  cardDefaultMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDefaultMiddleItem: {
    width: '30%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },

  cardOneContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 120,
  },
  cardOneTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardOneTopLeftBar: {
    width: '60%',
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardOneTopRightCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
  },
  cardOneGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardOneGridItem: {
    width: '30%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },

  cardTwoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 180,
  },
  cardTwoTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  cardTwoAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  cardTwoTextLinesContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTwoTextLineLarge: {
    width: '80%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardTwoTextLineSmall: {
    width: '60%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardTwoTextLineMedium: {
    width: 60,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardTwoMiddleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardTwoRectanglePlaceholder: {
    width: '23%',
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardTwoBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTwoButtonPlaceholder: {
    width: 90,
    height: 35,
    backgroundColor: '#e0e0e0',
    borderRadius: 18,
  },

  cardThreeContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 260,
  },
  cardThreeTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  cardThreeAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginRight: 15,
  },
  cardThreeTextLinesContainer: {
    flex: 1,
  },
  cardThreeTextLineLarge: {
    width: '85%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  cardThreeTextLineSmall: {
    width: '65%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardThreeGridSection: {
    marginBottom: 25,
  },
  cardThreeGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardThreeGridItem: {
    width: '30%',
    height: 22,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardThreeBottomSection: {
    marginTop: 'auto',
  },
  cardThreeBottomBar: {
    width: '100%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },

  cardFourContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 80,
  },
  cardFourContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  cardFourAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  cardFourTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardFourTextLineLarge: {
    width: '80%',
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardFourTextLineSmall: {
    width: '60%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  cardFourRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFourRectangleOne: {
    width: 60,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 8,
  },
  cardFourRectangleTwo: {
    width: 50,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default SkeletonLoader;