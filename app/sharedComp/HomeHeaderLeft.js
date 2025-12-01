import {View, Image} from 'react-native';
import React, { useEffect, useState } from "react";
import common_styles from '../css/common_styles';
import CommonService from '../services/CommonService';
import { useNavigation } from "@react-navigation/native";
import { SiteConstants } from "../SiteConstants";
import { storeStringData, storeObjectData } from "../sharedComp/AsyncData";

const HomeHeaderLeft = () => {
  const [userImage, setUserImage] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      let userData = await fetchUserData();
      if (userData && userData.data) {
        userData = userData.data;
      }
      const userPhoto = await getUserPhotoLocation(userData?.individualMemberAccount?.document);
      await getUserImage(userPhoto?.location || null);
    })();
    
    return () => {
      // this now gets called when the component unmounts
    };
  }, []);

  const fetchUserData = async () => {
    const url = `${SiteConstants.API_URL}user/v2/getUser`;
    try {
      const response = await CommonService.commonGet(navigation, url);
      await storeObjectData("userData", response);
      await storeStringData("memberID", response.id ?? "");
      return response;
    } catch (error) {
      console.log("catch ====>", error);
      return null;
    }
  };

  const getUserPhotoLocation = async (documents) => {
    const isPhotoData = documents && documents.length && documents.find(doc => doc.type === 'PHOTO');
    return isPhotoData || null;
  }

  const getUserImage = async (documents) => {
    const location = documents;
    const url = `${SiteConstants.API_URL}user/v2/downloadObjectAsSignedURL`;
    return CommonService.commonBlobGet(navigation, url, location).then(
      async (image) => {
        if (image !== undefined) {
          let binary = "";
          const bytes = new Uint8Array(image);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const finaldata = binary;
          setUserImage(finaldata);
        }
      }
    );
  };

  const UserImage = () => {
    return (
      <Image
        source={{ uri: userImage }}
        resizeMode="contain"
        style={[
          common_styles.home_avatar_icon,
          common_styles.margin_right_15,
          common_styles.margin_left_12,
          {borderRadius: 30 / 2}
        ]}
      />
    );
  };

  const AvatarImage = () => {
    return (
      <Image
        source={require('../../assets/icons/avatar.png')}
        resizeMode="contain"
        style={[
          common_styles.home_avatar_icon,
          common_styles.margin_right_15,
          common_styles.margin_left_12,
        ]}
      />
    )
  }

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      {userImage !== "" ? <UserImage /> : <AvatarImage />}
    </View>
  );
};

export default HomeHeaderLeft;
