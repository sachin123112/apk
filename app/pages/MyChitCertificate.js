import {
    View,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    Pressable
  } from 'react-native';
  import React, {useEffect, useState} from 'react';
  import common_styles from '../css/common_styles';
  import {CssColors} from '../css/css_colors';
  import Pdf from 'react-native-pdf';
  import CommonService from '../services/CommonService';
  import {SiteConstants} from '../SiteConstants';
  import Icon from 'react-native-vector-icons/AntDesign';
  import ReactNativeBlobUtil from 'react-native-blob-util';
  
  const MyChitCertificate = ({route, navigation}) => {
    const {itemId, certificateData, chitId} = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [tagsData, setTagsData] = useState(JSON.parse(certificateData));
    const [pdfUrl, setPdfUrl] = useState();
    const [activeTag, setActiveTag] = useState(itemId);
    const [timePassed, setTimePassed] = useState(false);
    const [isAgreement, setIsAgreement] = useState(false);
    let timer1 = setTimeout(() => setTimePassed(true), 4000);
  
    useEffect(() => {
      setIsLoading(false);
      setTagsData(JSON.parse(certificateData));
      tagsData.map(item => {
        if (item.shortName === itemId) {
          downloadPdf(item.location);
        }
        if (item.shortName === itemId && item.status === 'STAMPED') {
          setIsAgreement(true);
        }
      });
      return () => {
        clearTimeout(timer1);
      };
    }, []);

    const downloadPdf = async location => {
      setIsLoading(true);
      const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;
      return CommonService.commonBlobGet(navigation, url, location).then(
        async pdfData => {
          if (pdfData !== undefined) {
            let binary = '';
            const bytes = new Uint8Array( pdfData );
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode( bytes[ i ] );
            }
            setPdfUrl(binary);
            setIsLoading(false);
          }
        },
      );
    };
  
    const tagPress = async clickedId => {
      setIsAgreement(false);
      setIsLoading(true);
      tagsData.map(async item => {
        if (item.shortName === clickedId && item.status === 'STAMPED') {
          setIsAgreement(true);
        }
        if (item.shortName === clickedId) {
          setActiveTag(clickedId);
          downloadPdf(item.location);
        }
      });
    };

    const downloadFileToSystem = async (id) => {
      tagsData.map(async item => {
        if (item.shortName === clickedId) {
          setActiveTag(clickedId);
          downloadOffline(item.location);
        }
      });
    }

    const downloadOffline = () => {
      setIsLoading(true);
      const { dirs } = ReactNativeBlobUtil.fs;
      const fileUrl = pdfUrl;
      const fileExt = '.pdf';
      const filePath = `${dirs.DownloadDir}/agreement${fileExt}`;
      
      const config = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'Downloading file...',
        },
      };
      ReactNativeBlobUtil.config(config)
      .fetch('GET', fileUrl)
      .then((res) => {
        navigation.navigate("TabNavigation", {
          screen: "Home",
        });
      })
      .catch((err) => {
        setIsLoading(false);
      });
    };
  
    return (
      <View style={[!isLoading ? styles.container : common_styles.center_align]}>
        {isLoading && pdfUrl ? (
          <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
        ) : (
          <>
            <View>
              <ScrollView
                style={{width: '100%', backgroundColor: CssColors.white}}
                horizontal
                showsHorizontalScrollIndicator={false}>
                <View style={common_styles.newChits_tags}>
                  {tagsData.map(item => (
                    <TouchableOpacity
                      key={item.shortName}
                      onPress={() => tagPress(item.shortName)}
                      style={
                        activeTag !== item.shortName
                          ? common_styles.newChits_tags_container
                          : common_styles.newChits_tags_container_active
                      }>
                      <Text
                        style={
                          activeTag !== item.shortName
                            ? common_styles.newChits_tags_text
                            : common_styles.newChits_tags_text_active
                        }>
                        {item.shortName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            {timePassed ? (
              <View
                style={{
                  flex: 1,
                  position: 'relative',
                  backgroundColor: CssColors.appBackground,
                }}>
                <Pdf
                  trustAllCerts={false}
                  source={{
                    uri: pdfUrl,
                    cache: true,
                  }}
                  onLoadComplete={(numberOfPages, filePath) => {
                  }}
                  onPageChanged={(page, numberOfPages) => {
                  }}
                  onError={error => {
                  }}
                  onPressLink={uri => {
                  }}
                  style={styles.pdf}
                />
              </View>
            ) : (
              <ActivityIndicator
                size="large"
                style={{flex: 1}}
                color={CssColors.textColorSecondary}
              />
            )}
            {isAgreement &&
            <View style={[common_styles.fixed_footer_one_container, styles.spaceBetween]}>
              <Text style={styles.warningText}>Download the agreement & activate your chit</Text>
              <Pressable style={styles.downloadButtonWrapper} onPress={() => downloadOffline()}>
                <Text style={styles.defaultText}>Download</Text>
                <Icon name="download" size={12} style={styles.downloadIcon} />
              </Pressable>
            </View>
            }
          </>
        )}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: CssColors.appBackground,
      height: '100%',
    },
    scrollView: {
      backgroundColor: CssColors.new_chits_background,
    },
    pdf: {
      flex: 1,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      backgroundColor: CssColors.appBackground,
    },
    container_pdf: {
      justifyContent: 'center',
      flex: 1,
      backgroundColor: CssColors.appBackground,
    },
    genericModalClass: {
      backgroundColor: CssColors.appBackground,
      borderRadius: 20,
      alignItems: 'center',
      shadowColor: CssColors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '100%',
      height: '100%',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    notificationbar: {
      backgroundColor: CssColors.errorTextColor,
      marginHorizontal: 10,
      marginTop: 10,
      padding: 10,
      borderRadius: 4,
      flexDirection: 'row'
    },
    whitetextWithUnderline: {
      fontSize: 12,
      color: CssColors.white,
      textDecorationColor: CssColors.white,
      textDecorationLine: 'underline',
      fontWeight: '600'
    },
    downloadIcon: {
      color: CssColors.primaryColor,
      paddingLeft: 4
    },
    defaultText: {
      color: CssColors.primaryColor,
      fontSize: 12
    },
    downloadButtonWrapper: {
      flexDirection: 'row',
      borderColor: CssColors.primaryColor,
      borderWidth: 1,
      borderRadius: 25,
      paddingHorizontal: 10,
      paddingVertical: 5
    },
    spaceBetween: {
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    warningText: {
      fontSize: 10,
      color: CssColors.errorTextColor
    }
  });
  
  export default MyChitCertificate;
  