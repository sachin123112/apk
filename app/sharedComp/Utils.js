import { Platform, Linking } from "react-native";
import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export const convertISOStringToDateMonthYear = (milliseconds) => {
  const date = new Date(milliseconds * 1000);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const convertISOStringToDateMonth = (milliseconds) => {
  const date = new Date(milliseconds * 1000);
  const day = date.getDate();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthNames[date.getMonth()];
  return `${day} ${month}`;
};

export const formatIndianNumber=(num)=>{
  if (!num) return '';
  //remove all non-digit characters
  let x=num.toString().replace(/\D/g,'');
  let lastThree=x.substring(x.length - 3);
  let otherNumbers=x.substring(0,x.length - 3);
  if(otherNumbers !==''){
   lastThree=','+lastThree;
  }
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g,',')+lastThree;
}

export const formatCurrency = (value) => {
  // Handle null, undefined, or empty values
  if (!value && value !== 0) return "0";
  
  try {
    // Convert to number if it's a string
    const number = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(number)) return "-";
    
    // Convert to string
    const numStr = number.toString();
    
    // Handle numbers less than 1000
    if (numStr.length <= 3) return numStr;
    
    // Split the number into parts before and after decimal
    const [integerPart, decimalPart] = numStr.split('.');
    
    // Format integer part with Indian grouping
    const lastThree = integerPart.slice(-3);
    const otherNumbers = integerPart.slice(0, -3);
    const formatted = otherNumbers ?
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree :
      lastThree;
    
    // Add back decimal part if it exists
    return decimalPart ? `${formatted}.${decimalPart}` : formatted;
  } catch (error) {
    console.error('Error formatting number:', error);
    return "-";
  }
};

// hooks/useCustomBackHandler.js

export const useCustomBackHandler = (navigation, isHome = false) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    const backAction = () => {
      if (isHome) {
        //  Exit the app if already on the Home tab
        BackHandler.exitApp();
      } else {
        // Switch to Home tab inside Tab.Navigator
        navigation.navigate("Home"); // <-- only this
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isFocused, navigation, isHome]);
};




export const convertISOStringToMonthDay = (milliseconds) => {
  if (
    milliseconds == "" ||
    milliseconds == undefined ||
    milliseconds <= 1 ||
    milliseconds == null
  ) {
    return "--";
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const date = new Date(milliseconds * 1000);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
};

export const convertISOStringToDateMonthTime = (milliseconds) => {
  if (
    milliseconds == "" ||
    milliseconds == "--" ||
    milliseconds == undefined ||
    milliseconds <= 1 ||
    milliseconds == null
  ) {
    return "--";
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const date = new Date(milliseconds * 1000);
    const dayOfWeek = days[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = months[date.getMonth()];
    const hour = date.getHours();
    const minute = ("0" + date.getMinutes()).slice(-2);

    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? "AM" : "PM";

    return `${dayOfMonth}${month}, ${formattedHour}.${minute}${period}`;
  }
};

export const convertMillisecondsToDate = (milliseconds) => {
  if (
    milliseconds == "" ||
    milliseconds == "--" ||
    milliseconds == undefined ||
    milliseconds <= 1 ||
    milliseconds == null
  ) {
    return "--";
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const date = new Date(milliseconds * 1000);
  const dayOfMonth = date.getDate();
  const month = months[date.getMonth()];

  return `${dayOfMonth}-${month}`;
};

export const convertMillisecondsToTime = (milliseconds) => {
  if (
    milliseconds == "" ||
    milliseconds == "--" ||
    milliseconds == undefined ||
    milliseconds <= 1 ||
    milliseconds == null
  ) {
    return "--";
  }

  const date = new Date(milliseconds * 1000);
  const hour = date.getHours();
  const minute = ("0" + date.getMinutes()).slice(-2);

  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 ? "AM" : "PM";

  return `${formattedHour}:${minute}${period}`;
};

export const convertISOStringToDate = (date) => {
  let tempDate = new Date(date);
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let formattedDate =
    tempDate.getDate() +
    "-" +
    month[tempDate.getMonth()] +
    "-" +
    tempDate.getFullYear();
  return formattedDate;
};

export const convertISOStringToMonthDayTwo = (date) => {
  let tempDate = new Date(date);
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let formattedDate = tempDate.getDate() + " " + month[tempDate.getMonth()];
  return formattedDate;
};

export const requestedDateTime = (date) => {
  let tempDate = new Date(date * 1000);
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let formattedDate =
    tempDate.getDate() +
    " " +
    month[tempDate.getMonth()] +
    " " +
    tempDate.getFullYear() +
    ", " +
    dateTime(tempDate);
  return formattedDate;
};

export const formatDateToToday = (date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const ConvertToTime = (date) => {
  const tempDate = new Date(date * 1000);
  const formattedDate = dateTime(tempDate);
  return formattedDate;
};

export const completionDate = (date) => {
  let tempDate = new Date(date * 1000);
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let formattedDate =
    tempDate.getDate() +
    " " +
    month[tempDate.getMonth()] +
    " " +
    tempDate.getFullYear();
  return formattedDate;
};

export const convertDateToString = (date) => {
  let formattedDate = date.toISOString();
  return formattedDate;
};

export const dateTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ap = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes.toString().padStart(2, "0");
  let mergeTime = hours + ":" + minutes + " " + ap;
  return mergeTime;
};

export const dateTimeSeconds = (date) => {
  // 2023-08-01 15:30:00
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  minutes = minutes.toString().padStart(2, "0");
  let mergeTime =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return mergeTime;
};

export const openContact = (telNumber) => {
  let phoneNumber = telNumber;

  if (Platform.OS === "android") {
    phoneNumber = `tel:${phoneNumber}`;
  } else {
    phoneNumber = `telprompt:${phoneNumber}`;
  }
  Linking.openURL(phoneNumber);
};

export const states = [
  { key: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
  { key: "Andhra Pradesh", label: "Andhra Pradesh" },
  { key: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { key: "Assam", label: "Assam" },
  { key: "Bihar", label: "Bihar" },
  { key: "Chandigarh", label: "Chandigarh" },
  { key: "Chhattisgarh", label: "Chhattisgarh" },
  { key: "Dadra and Nagar Haveli", label: "Dadra and Nagar Haveli" },
  { key: "Daman and Diu", label: "Daman and Diu" },
  { key: "Delhi", label: "Delhi" },
  { key: "Goa", label: "Goa" },
  { key: "Gujarat", label: "Gujarat" },
  { key: "Haryana", label: "Haryana" },
  { key: "Himachal Pradesh", label: "Himachal Pradesh" },
  { key: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  { key: "Jharkhand", label: "Jharkhand" },
  { key: "Karnataka", label: "Karnataka" },
  { key: "Kerala", label: "Kerala" },
  { key: "Lakshadweep", label: "Lakshadweep" },
  { key: "Madhya Pradesh", label: "Madhya Pradesh" },
  { key: "Maharashtra", label: "Maharashtra" },
  { key: "Manipur", label: "Manipur" },
  { key: "Meghalaya", label: "Meghalaya" },
  { key: "Mizoram", label: "Mizoram" },
  { key: "Nagaland", label: "Nagaland" },
  { key: "Odisha", label: "Odisha" },
  { key: "Orissa", label: "Orissa" },
  { key: "Puducherry", label: "Puducherry" },
  { key: "Punjab", label: "Punjab" },
  { key: "Rajasthan", label: "Rajasthan" },
  { key: "Sikkim", label: "Sikkim" },
  { key: "Tamil Nadu", label: "Tamil Nadu" },
  { key: "Telangana", label: "Telangana" },
  { key: "Tripura", label: "Tripura" },
  { key: "Uttarakhand", label: "Uttarakhand" },
  { key: "Uttar Pradesh", label: "Uttar Pradesh" },
  { key: "West Bengal", label: "West Bengal" },
];

export function isValidCertificatePath(path) {
  if (!path || typeof path !== 'string') return false;

  const dotIndex = path.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const extension = path.slice(dotIndex);
  if (extension !== extension.toLowerCase()) return false;

  const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];

  return validExtensions.includes(extension);
}

export const normalizeExtension = (path) => {
  if (!path) return path;
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex === -1) return path;
  const name = path.slice(0, dotIndex);
  const ext = path.slice(dotIndex).toLowerCase();
  return name + ext;
};

export const certificateData = (cc, pso, fd, agreementPath) => {
  let data = [];
  if (agreementPath !== undefined && agreementPath !== null) {
    data = [
      ...data,
      {
        id: "004",
        name: "Agreement",
        fullName: "Certificate 4",
        location: agreementPath.ccCertLocation,
      },
    ];
  }
  if (fd !== undefined && fd !== null && fd?.fdDocPath !== null) {
    data = [
      ...data,
      {
        id: "001",
        name: "FD",
        fullName: "Certificate 1",
        location: fd.fdDocPath,
      },
    ];
  }
  if (pso !== undefined && pso !== null && pso?.psoCertLocation !== null) {
    data = [
      ...data,
      {
        id: "002",
        name: "PSO",
        fullName: "Certificate 2",
        location: pso.psoCertLocation,
      },
    ];
  }
  if (cc !== undefined && cc !== null && cc?.ccCertLocation !== null) {
    data = [
      ...data,
      {
        id: "003",
        name: "CC",
        fullName: "Certificate 3",
        location: cc.ccCertLocation,
      },
    ];
  }

  return data
    .filter(item => isValidCertificatePath(item.location))
    .map(item => {
      const ext = item.location
        ? item.location.slice(item.location.lastIndexOf('.')).toLowerCase()
        : '';
      return {
        ...item,
        isPdf: ext === '.pdf'
      };
    });
};

export const isInvalidPhoneNumber = (phone) => {
  const cleaned = String(phone).trim();
  const regex = /^[6-9][0-9]{9}$/;
  return regex.test(cleaned);
};