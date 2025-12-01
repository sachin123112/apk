import { getStringData, storeStringData } from "../sharedComp/AsyncData";
import axios from "axios";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { CommonActions } from "@react-navigation/native";
import StorageService from '../sharedComp/StorageService';
import { CacheService } from '../sharedComp/CacheService';
import { SiteConstants } from '../SiteConstants';
import { Alert } from "react-native";
import UpdateGate from "../sharedComp/UpdateGate";
import DeviceInfo from "react-native-device-info";
const appVersion = DeviceInfo.getVersion();
const checkPlatform = Platform.OS.toUpperCase();

const logout = async (navigation) => {
  const auth = getAuth();
  try {
    await CacheService.clearAllCache();
    await StorageService.clear();
  } catch (e) {
    console.log('Cache/storage clear error during logout:', e);
  }
  await signOut(auth);
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
};

// Get a new token from Firebase and update it on the backend
const refreshAndUpdateToken = async () => {
  try {
    // Step 1: Get a new token from Firebase
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("No user is currently signed in");
      return null;
    }

    // Force refresh to get a new token from Firebase
    const newToken = await currentUser.getIdToken(true);

    if (!newToken) {
      console.log("Failed to obtain a fresh token from Firebase");
      return null;
    }

    console.log("New Firebase token obtained, updating backend...");

    // Step 2: Notify our backend about the new token
    const baseUrl = SiteConstants.API_URL;
    const updateUrl = `${baseUrl}user/v2/updateToken`;

    try {
      // Use the new token to call the updateToken endpoint
      const response = await fetch(updateUrl, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + newToken,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        // Step 3: Store the new token locally
        await storeStringData("token", newToken);
        console.log(newToken, "Token refreshed and backend updated successfully");
        return newToken;
      } else {
        console.error("Backend token update failed:", response.status);
        return null;
      }
    } catch (updateError) {
      console.error("Error updating token on backend:", updateError);
      return null;
    }
  } catch (error) {
    console.error("Error in refreshAndUpdateToken:", error);
    return null;
  }
};

let isLogoutAlertShown = false;

const CommonService = {
  commonGet: async (navigation, url) => {
    const token = await getStringData("token");
    console.log(token, 'MJP token in commonservice');

    if (!token) {
      await logout(navigation);
      return;
    }

    // First attempt with current token
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + token,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      });

      if (response.ok) {
        console.log(response, 'GET call MJP response');
        const json = await response.json();
        return json;
      } else {
        const status = response.status;
        if (status == 406 || status == 426) {
          UpdateGate.set(true);
          return;
        }

        // Handle 401 Unauthorized - Token expired
        if (status === 401) {
          console.log('Token expired, refreshing...');

          // Refresh token and try again
          const newToken = await refreshAndUpdateToken();

          if (newToken) {
            console.log('Retrying with new token');

            // Second attempt with new token
            const retryResponse = await fetch(url, {
              method: "GET",
              headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: "Bearer " + newToken,
                "X-App-Version": appVersion,
                "X-Platform": checkPlatform
              },
            });

            if (retryResponse.ok) {
              const json = await retryResponse.json();
              return json;
            } else {
              console.log('Request failed even with new token:', retryResponse.status);

              // If it's still a 401 or a 409, logout
              if (retryResponse.status === 401 || retryResponse.status === 409) {
                await logout(navigation);
              }

              let err = new Error("HTTP status code: " + retryResponse.status);
              err.response = retryResponse;
              throw err;
            }
          } else {
            console.log('Token refresh failed, logging out');
            await logout(navigation);
            return;
          }
        }
        // Handle 409 Conflict - Already logged in elsewhere
        else if (status === 409) {
          if (!isLogoutAlertShown) {
            isLogoutAlertShown = true;
            alert("You have logged in on a new device");
            setTimeout(() => {
              isLogoutAlertShown = false;
            }, 5000);
          }
          await logout(navigation);
          return;
        }
        // Handle 502 Bad Gateway
        else if (status === 502) {
          console.log('Server error 502, logging out');
          await logout(navigation);
          return;
        }
        // Handle other errors
        else {
          let err = new Error("HTTP status code: " + status);
          err.response = response;
          throw err;
        }
      }
    } catch (error) {
      console.log('Error in GET call:', error);

      // If the error has a response with status 401 or 409, handle it
      if (error.response && (error.response.status === 401 || error.response.status === 409)) {
        await logout(navigation);
        return;
      }

      // Propagate the error
      throw error;
    }
  },

  commonBlobGet: async (navigation, url, gsImage) => {
    const token = await getStringData("token");

    if (!token) {
      await logout(navigation);
      return;
    }

    // First attempt with current token
    try {
      const headers = {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + token,
        "X-App-Version": appVersion,
        "X-Platform": checkPlatform
      };

      const config = {
        headers: headers,
        responseType: "arraybuffer",
        params: {
          file: gsImage,
        }
      };

      const response = await axios.get(url, config);
      console.log(response.data, 'GET  response data');
      return response.data;
    } catch (error) {
      // Check if error is 401 Unauthorized - Token expired
      if (error.response && error.response.status === 401) {
        console.log('Token expired, refreshing...');

        // Refresh token and try again
        const newToken = await refreshAndUpdateToken();

        if (newToken) {
          console.log('Retrying with new token');

          // Second attempt with new token
          try {
            const headers = {
              Accept: "*/*",
              "Content-Type": "application/x-www-form-urlencoded",
              "Access-Control-Allow-Origin": "*",
              Authorization: "Bearer " + newToken,
              "X-App-Version": appVersion,
              "X-Platform": checkPlatform
            };

            const config = {
              headers: headers,
              responseType: "arraybuffer",
              params: {
                file: gsImage,
              }
            };

            const retryResponse = await axios.get(url, config);
            console.log(retryResponse.data, 'GET  response after token refresh');
            return retryResponse.data;
          } catch (retryError) {
            console.log('Request failed even with new token:', retryError.response?.status);

            // If it's still a 401 or a 409, logout
            if (retryError.response && (retryError.response.status === 401 || retryError.response.status === 409)) {
              await logout(navigation);
            }

            throw retryError;
          }
        } else {
          console.log('Token refresh failed, logging out');
          await logout(navigation);
          return { error };
        }
      }
      // Handle 409 Conflict - Already logged in elsewhere
      else if (error.response && error.response.status === 409) {
        if (!isLogoutAlertShown) {
          isLogoutAlertShown = true;
          alert("You have logged in on a new device");
          setTimeout(() => {
            isLogoutAlertShown = false;
          }, 5000);
        }
        await logout(navigation);
        return { error };
      }
      // Handle 502 Bad Gateway
      else if (error.response && error.response.status === 502) {
        console.log('Server error 502, logging out');
        await logout(navigation);
        return { error };
      }
      // Handle other errors
      else {
        console.log(`Error occurred while fetching data: ${error}`);
        return { error };
      }
    }
  },

  commonPost: async (navigation, url, bodydata) => {
    const token = await getStringData("token");

    if (!token) {
      await logout(navigation);
      return;
    }

    // First attempt with current token
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          // "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + token,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
        body: JSON.stringify(bodydata),
      });

      if (response.ok) {
        console.log(response, 'POST call MJP response');
        const json = await response.json();
        return json;
      } else {
        const status = response.status;

        // Handle 401 Unauthorized - Token expired
        if (status === 401) {
          console.log('Token expired, refreshing...');

          // Refresh token and try again
          const newToken = await refreshAndUpdateToken();

          if (newToken) {
            console.log('Retrying with new token');

            // Second attempt with new token
            const retryResponse = await fetch(url, {
              method: "POST",
              headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: "Bearer " + newToken,
                "X-App-Version": appVersion,
                "X-Platform": checkPlatform
              },
              body: JSON.stringify(bodydata),
            });

            const retryJson = await retryResponse.json();

            if (retryResponse.ok) {
              return retryJson;
            } else {
              console.log('Request failed even with new token:', retryResponse.status);

              // If it's still a 401 or a 409, logout
              if (retryResponse.status === 401 || retryResponse.status === 409) {
                await logout(navigation);
              }

              let err = new Error("HTTP status code: " + retryResponse.status);
              err.response = retryResponse;
              throw err;
            }
          } else {
            console.log('Token refresh failed, logging out');
            await logout(navigation);
            return;
          }
        }
        // Handle 409 Conflict - Already logged in elsewhere
        else if (status === 409) {
          if (!isLogoutAlertShown) {
            isLogoutAlertShown = true;
            alert("You have logged in on a new device");
            await logout(navigation);
            setTimeout(() => {
              isLogoutAlertShown = false;
            }, 5000);
          }
          await logout(navigation);
          return;
        }
        // Handle 502 Bad Gateway
        else if (status === 502) {
          console.log('Server error 502, logging out');
          await logout(navigation);
          return;
        }
        // Handle other errors
        else {
          let err = new Error("HTTP status code: " + status);
          err.response = response;
          throw err;
        }
      }
    } catch (error) {
      console.log('Error in POST call:', error);

      // If the error has a response with status 401 or 409, handle it
      if (error.response && (error.response.status === 401 || error.response.status === 409)) {
        await logout(navigation);
        return;
      }

      // Propagate the error
      throw error;
    }
  },

  // It's recommended to deprecate these old methods and migrate to the newer ones
  commonGetOld: async (navigation, url) => {
    const token = await getStringData("token");
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + token,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      });
      if (response.ok) {
        const json = await response.json();
        return json;
      } else {
        let err = new Error("HTTP status code: " + response.status);
        err.response = response;
        err.status = response.status;
        if (err.status === 409 || err.status === 401) {
          await logout(navigation);
        }
        throw err;
      }
    } catch (error) {
      if (response && (response.status === 401 || response.status === 409)) {
        await logout(navigation);
      }
      throw error;
    }
  },

  commonBlobGetOld: async (navigation, url, gsImage) => {
    const token = await getStringData("token");
    const headers = {
      Accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded",
      "Access-Control-Allow-Origin": "*",
      Authorization: "Bearer " + token,
      "X-App-Version": appVersion,
      "X-Platform": checkPlatform
    };
    let config = {
      headers: headers,
      responseType: "arraybuffer",
      params: {
        file: gsImage,
      },
    };
    try {
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 409)) {
        await logout(navigation);
      }
      console.log(`Error occurred while fetching data: ${error}`);
      return { error };
    }
  },

  commonPostOld: async (navigation, url, bodydata) => {
    const token = await getStringData("token");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + token,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
        body: JSON.stringify(bodydata),
      });

      if (response.ok) {
        const json = await response.json();
        return json;
      } else {
        let err = new Error("HTTP status code: " + response.status);
        err.response = response;
        err.status = response.status;
        if (err.status === 409 || err.status === 401) {
          await logout(navigation);
        }
        throw err;
      }
    } catch (error) {
      // Check if response exists and has status
      if (error.response && (error.response.status === 401 || error.response.status === 409)) {
        await logout(navigation);
      }
      throw error;
    }
  },
  commonGetOtp: async (url) => {
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      });

      if (response.ok) {
        const json = await response.json();
        return json;
      } else {
        let err = new Error("HTTP status code: " + response.status);
        console.log(err);
        return false;
      }
    } catch (error) {
      return false;
    }
  },
  commonGetAadhar: async (url) => {
    const token = await getStringData("token");

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      });
      const json = await response.json();
      console.log("Aadhaar Response:", json);

      return json;
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("An error occurred while validating Aadhaar. Please try again.");
    }
  },

  commonPostOtp: async (url) => {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-App-Version": appVersion,
          "X-Platform": checkPlatform
        },
      });
      if (response.ok) {
        const json = await response.json();
        return json;
      } else {
        let err = new Error("HTTP status code: " + response.status);
        const error = await response.json();
        return error;

      }
    } catch (error) {
      throw error;
    }
  },
};

export default CommonService;
