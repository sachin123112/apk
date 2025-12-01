import {
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    View
  } from "react-native";
  import React from "react";
  import { CssColors } from "../css/css_colors";
  import common_styles from "../css/common_styles";
  import CommonService from "../services/CommonService";
  import { SiteConstants } from "../SiteConstants";
  
  const CompletedChits = ({ route, navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [finalChitsData, setFinalChitsData] = useState([]);

    useEffect(() => {
        getMychits();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
          getMychits();
          setRefreshing(false);
        }, 500);
      }, []);

      const getMychits = async () => {
        let userData = await getObjectData("userData");
        if (userData && userData.data) {
          userData = userData.data;
        }
        const memberIds = userData?.id;
        setIsLoading(true);
        const url = `${SiteConstants.API_URL}chit-group/v2/chitReference-list/INACTIVE/${memberIds}`;
        try {
          const myChitData = await CommonService.commonGet(navigation, url);
          setIsLoading(false);
          if (myChitData !== undefined) {
            console.log(myChitData, 'ICACTIVE and COMPLETED chit data');
            setFinalChitsData(myChitData);
          }
        } catch (error) {
          setIsLoading(false);
        }
      };
  
    return (
        <SafeAreaView
          style={!isLoading ? styles.container : common_styles.center_align}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
          ) : (
            <>
              <ScrollView
              contentContainerStyle={styles.scrollView}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={styles.scrollView}>
                <View style={{ marginTop: 15 }}>
                  {finalChitsData.length ? (
                    finalChitsData.map((item) => (
                        <TouchableOpacity>{item.name}</TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{textAlign: "center", color: 'black', marginTop: 40}}>No data available</Text>
                  )}
                </View>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "flex-start",
      backgroundColor: CssColors.appBackground,
    },
    scrollView: {
        backgroundColor: CssColors.new_chits_background,
      },
  });
  
  export default CompletedChits;