import React from 'react';
import { View, ScrollView, Text, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import common_styles from '../css/common_styles';
import { CssColors } from '../css/css_colors';
import dayjs from 'dayjs';

const QuickActionsCard = ({
  ribbonText,
  ribbonStyle,
  title,
  titleStyle,
  subtitle,
  description,
  onPress,
  additionalInfo = {},
  buttonText = 'Continue',
  showHeader = false,
  headerText,
  cardType,
  backgroundImage = require('../../assets/images/quick_actions_bg.png'),
}) => (
  <ImageBackground
    source={backgroundImage}
    style={[styles.quickActionbackgroundImage, common_styles.shadowProp]}
    resizeMode="cover"
  >
    <View style={styles.quickActionCardContainer}>
      {/* Header and Ribbon */}
      {showHeader ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={styles.quickActionTicketLeftText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {headerText}
          </Text>
          {ribbonText && (
            <View style={[styles.quickActionRibbon, ribbonStyle]}>
              <Text style={styles.quickActionTrendingText}>{ribbonText}</Text>
            </View>
          )}
        </View>
      ) : ribbonText && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View style={[styles.quickActionRibbon, ribbonStyle]}>
            <Text style={styles.quickActionTrendingText}>{ribbonText}</Text>
          </View>
        </View>
      )}

      {/* Card Content Based on Type */}
      {cardType === 'enrollment' && (
        <>
          <Text style={styles.quickActionMandatoryStepText}>Mandatory step</Text>
          <Text
            style={styles.quickActionChitGroupNameTextTwo}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {description && (
            <Text
              style={[
                styles.quickActionSubscriptionAmountText,
                styles.marginTop10,
                styles.marginBottom9,
              ]}
            >
              {description}
            </Text>
          )}
        </>
      )}

      {cardType === 'agreement' && (
        <>
          <Text
            style={[
              styles.quickActionSubscriptionAmountText,
              styles.marginTop10,
              styles.marginBottom9,
            ]}
          >
            {description}
          </Text>
          <Text
            style={styles.quickActionChitGroupNameTextThree}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          <Text style={styles.quickActionSubscriptionAmountText}>
            {subtitle}
          </Text>
        </>
      )}

      {!cardType && (
        <>
          <Text
            style={[
              titleStyle || styles.quickActionChitValueText,
              styles.marginTop6,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.quickActionSubscriptionAmountText,
                cardType === 'popular' && styles.marginTop10,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          )}
          {description && (
            <Text
              style={[
                styles.quickActionSubscriptionAmountText,
                styles.marginTop10,
                styles.marginBottom9,
              ]}
            >
              {description}
            </Text>
          )}
        </>
      )}

      {/* Additional Info */}
      {Object.entries(additionalInfo).map(([key, value], index) => (
        <Text
          key={key}
          style={[
            styles.quickActionStartDateText,
            index === 0 && (!cardType ? styles.marginTop15 : styles.marginTop10),
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {`${key}: ${value}`}
        </Text>
      ))}

      {/* Action Button */}
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.quickActionSubscribeNowButtonContainer,
          { marginTop: description ? 12 : 17 },
        ]}
      >
        <Text style={styles.quickActionSubscribeNowText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
);

const QuickActions = ({
  kycStatusQuickAction,
  overDueQuickAction = [],
  dueQuickAction = [],
  enrollmentStatusQuickAction = [],
  agreementStatusQuickAction = [],
  newChitQuickAction = [],
  navigation,
}) => {
  const hasQuickActions =
    kycStatusQuickAction ||
    overDueQuickAction.length > 0 ||
    dueQuickAction.length > 0 ||
    enrollmentStatusQuickAction.length > 0 ||
    agreementStatusQuickAction.length > 0 ||
    newChitQuickAction.length > 0;

  if (!hasQuickActions) {return null;}

  const navigateToNewChitDetails = (data) => {
    navigation.navigate('NewChitDetails', { itemId: data.id });
  };

  const navigateToMyChitDetails = (data) => {
    navigation.navigate('MyChitsNavigator', {
      screen: 'MyChitDetails',
      params: { subscriptionId: data.subscriberId }
    });
  };

  return (
    <View style={styles.quickActionTopContainer}>
      <ScrollView horizontal style={{ marginBottom: 10 }}>
        <View style={{ width: 130 }}>
          <Text style={styles.quickActionTitleText}>{'Quick\nActions'}</Text>
          <Text style={styles.quickActionSubtitleText}>Find all your pending things to do</Text>
        </View>
        <Image
          style={common_styles.money_grow}
          source={require('../../assets/icons/money_grow.png')}
        />

        {/* KYC Status Quick Action */}
        {kycStatusQuickAction?.status === 'INCOMPLETE' && (
          <QuickActionsCard
            ribbonText="Pending"
            ribbonStyle={styles.quickActionRibbonOne}
            title="Complete KYC"
            subtitle="Mandatory step"
            description={'Personal information\nGov. approved document only'}
            onPress={() => navigation.navigate('Document')}
            buttonText="Upload"
          />
        )}

        {/* Overdue Quick Actions */}
        {overDueQuickAction.map((data, index) => (
          <QuickActionsCard
            key={index}
            showHeader={true}
            headerText={data.subscriberName}
            ribbonText="Overdue"
            title={`${data.chitGroupName}-${data.ticketNumber}`}
            titleStyle={styles.quickActionChitValueText}
            additionalInfo={{
              'Due date': dayjs(new Date(parseInt(data.dueDate * 1000))).format('DD-MMM-YYYY'),
              'Due amount': `\u20B9 ${data.dueAmount}`,
            }}
            onPress={() => navigateToMyChitDetails(data)}
            buttonText="Pay now"
          />
        ))}

        {/* Due Quick Actions */}
        {dueQuickAction.map((data, index) => (
          <QuickActionsCard
            key={index}
            showHeader={true}
            headerText={data.subscriberName}
            ribbonText="Due"
            title={`${data.chitGroupName}-${data.ticketNumber}`}
            titleStyle={styles.quickActionChitValueText}
            additionalInfo={{
              'Due date': dayjs(new Date(parseInt(data.dueDate * 1000))).format('DD-MMM-YYYY'),
              'Due amount': `\u20B9 ${data.dueAmount}`,
            }}
            onPress={() => navigateToMyChitDetails(data)}
            buttonText="Pay now"
          />
        ))}

        {/* Enrollment Quick Actions */}
        {enrollmentStatusQuickAction.map((data, index) => (
          <QuickActionsCard
            key={index}
            ribbonText="Enrollment pending"
            ribbonStyle={styles.quickActionRibbonTwo}
            title={`${data.chitGroupName}-${data.ticketNumber}`}
            description={'Personal information\nGov. approved document only'}
            onPress={() => navigateToMyChitDetails(data)}
            cardType="enrollment"
          />
        ))}

        {/* Agreement Quick Actions */}
        {agreementStatusQuickAction.map((data, index) => (
          <QuickActionsCard
            key={index}
            ribbonText="Agreement pending"
            ribbonStyle={styles.quickActionRibbonTwo}
            title={`${data.chitGroupName}-${data.ticketNumber}`}
            description={'Personal information\nGov. approved\ndocuments only'}
            subtitle="Enrollment request approved"
            onPress={() => navigateToMyChitDetails(data)}
            cardType="agreement"
          />
        ))}

        {/* New Chit Quick Actions */}
        {newChitQuickAction.map((data, index) => (
          <QuickActionsCard
            key={index}
            showHeader={true}
            headerText={`${data.noOfTicketLeft} tickets left`}
            ribbonText={data.tag || 'Popular'}
            title={`\u20B9 ${data.chitValue} Chit`}
            subtitle={`Subscription - \u20B9 ${data.subscriptionAmount}`}
            additionalInfo={{
              'Instalment': `${data.noOfInstallment} Months`,
              'Start date': dayjs(new Date(parseInt(data.startDate * 1000))).format('DD-MMM-YYYY'),
            }}
            onPress={() => navigateToNewChitDetails(data)}
            buttonText="Subscribe now"
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionTopContainer: {
    backgroundColor: CssColors.appBackground,
  },
  quickActionTitleText: {
    paddingTop: 37,
    fontSize: 18,
    paddingLeft: 10,
    fontWeight: 'bold',
    lineHeight: 24,
    color: CssColors.primaryPlaceHolderColor,
  },
  quickActionSubtitleText: {
    fontSize: 10,
    fontWeight: 'normal',
    lineHeight: 16,
    color: CssColors.primaryColor,
    paddingLeft: 10,
    paddingTop: 6,
  },
  quickActionbackgroundImage: {
    width: 166,
    height: 146,
    resizeMode: 'cover',
    marginRight: 10,
  },
  quickActionCardContainer: {
    borderRadius: 4,
    overflow: 'hidden',
    padding: 10,
  },
  quickActionTicketLeftText: {
    fontSize: 10,
    color: CssColors.white,
    lineHeight: 20,
    width: '70%',
  },
  quickActionTrendingText: {
    color: CssColors.primaryColor,
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  quickActionRibbon: {
    position: 'absolute',
    top: 10,
    right: -30,
    transform: [{ rotate: '45deg' }],
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CssColors.appBackground,
  },
  quickActionRibbonOne: {
    position: 'absolute',
    top: 10,
    right: -30,
    transform: [{ rotate: '45deg' }],
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CssColors.appBackground,
    top: 20,
    right: -20,
  },
  quickActionRibbonTwo: {
    position: 'absolute',
    top: 10,
    right: -30,
    transform: [{ rotate: '45deg' }],
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CssColors.appBackground,
    top: 14,
    right: -29,
  },
  quickActionMandatoryStepText: {
    color: CssColors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 'normal',
    marginTop: 10,
  },
  quickActionChitGroupNameTextTwo: {
    color: CssColors.white,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: 'bold',
    marginTop: 6,
    width: '88%',
  },
  quickActionChitGroupNameTextThree: {
    color: CssColors.white,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: 'bold',
    width: '90%',
  },
  quickActionChitGroupNameText: {
    color: CssColors.white,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 15,
    width: '90%',
  },
  quickActionSubscriptionAmountText: {
    color: CssColors.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 'normal',
  },
  quickActionStartDateText: {
    color: CssColors.white,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: 'normal',
  },
  quickActionSubscribeNowButtonContainer: {
    backgroundColor: CssColors.primaryColor,
    paddingVertical: 4,
    paddingHorizontal: 5,
    marginTop: 10,
    borderRadius: 12,
  },
  quickActionSubscribeNowText: {
    color: CssColors.white,
    fontSize: 12,
    lineHeight: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  marginTop6: {
    marginTop: 6,
  },
  marginTop10: {
    marginTop: 10,
  },
  marginTop15: {
    marginTop: 15,
  },
  marginBottom9: {
    marginBottom: 9,
  },
  quickActionRibbon: {
    position: 'absolute',
    top: 10,
    right: -30,
    transform: [{ rotate: '45deg' }],
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CssColors.appBackground,
  },
  quickActionChitValueText: {
    color: CssColors.white,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
});

export default QuickActions;
