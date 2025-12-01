import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Dimensions, BackHandler } from 'react-native';
import { SiteConstants } from '../SiteConstants';
import CommonService from '../services/CommonService';
import { CssColors } from '../css/css_colors';
import Pdf from 'react-native-pdf';

const PolicySettings = ({ navigation }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back action
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    setIsLoading(true);
    getTandC();
  }, [])

  const getTandC = async () => {
    const url = `${SiteConstants.API_URL}home/getTnC`;

    try {
      const response = await CommonService.commonGet(navigation, url);
      downloadPdf(response?.location)
    } catch (error) {
      console.error("Error fetching term and conditions:", error);
    }
  }

  const downloadPdf = async (location) => {
    setIsLoading(true);
    const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;
    return CommonService.commonBlobGet(navigation, url, location).then(
      async (pdfData) => {
        if (pdfData !== undefined) {
          let binary = "";
          const bytes = new Uint8Array(pdfData);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          setPdfUrl(binary);
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading && pdfUrl === ""  ? (
        <ActivityIndicator size="large" color={CssColors.textColorSecondary} />
      ) : 
        <Pdf
          trustAllCerts={false}
          source={{
            uri: pdfUrl,
            cache: true,
          }}
          onLoadComplete={(numberOfPages, filePath) => { }}
          onPageChanged={(page, numberOfPages) => { }}
          onError={(error) => { }}
          onPressLink={(uri) => { }}
          style={styles.pdf}
        />
    }

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: CssColors.appBackground,
  },
  container: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 25,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#072E77"
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: "#072E77"
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: "#072E77"
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: "#072E77"
  },
});

export default PolicySettings;
