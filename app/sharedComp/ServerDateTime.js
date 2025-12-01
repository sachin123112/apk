import { SiteConstants } from "../SiteConstants";
import CommonService from "../services/CommonService";

const useServerDateTimeFnc = async (navigation) => {
  var url = `${SiteConstants.API_URL}page/getServerTimeZone`;
  console.log("Url ", url);
  const data = await CommonService.commonGet(navigation, url);
  if (data != undefined) {
    console.log("c- time data ", data.now);
    //   return data;
    return Promise.resolve(data.now);
  } else {
    return Promise.resolve("");
  }
};

export { useServerDateTimeFnc };
