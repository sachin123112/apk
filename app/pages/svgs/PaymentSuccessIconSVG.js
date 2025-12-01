import * as React from "react";
import Svg, { Path, G } from "react-native-svg";
const PaymentSuccessIconSVG = (props) => (
  <Svg
    id="Payment_successful"
    data-name="Payment successful"
    xmlns="http://www.w3.org/2000/svg"
    width={72}
    height={72}
    viewBox="0 0 72 72"
    {...props}
  >
    <Path
      id="Oval"
      d="M36,0A36,36,0,1,1,0,36,36,36,0,0,1,36,0Z"
      fill="#34c85a"
      opacity={0.1}
    />
    <G id="interface" transform="translate(8.943 9.299)">
      <Path
        id="Path"
        d="M26.868,0A26.856,26.856,0,0,0,0,26.659,27.036,27.036,0,0,0,26.868,53.527,26.764,26.764,0,0,0,26.868,0Z"
        transform="translate(0)"
        fill="#34c85a"
      />
      <Path
        id="background_basic_100"
        data-name="background/ basic 100"
        d="M32.784,5.131,16.966,20.211l-1.118,1.064a3.339,3.339,0,0,1-4.538,0L.935,11.576a2.925,2.925,0,0,1,0-4.287,3.43,3.43,0,0,1,4.506,0l8.138,7.51,3.387-3.223L28.278.844a3.43,3.43,0,0,1,4.506,0A2.925,2.925,0,0,1,32.784,5.131Z"
        transform="translate(9.904 14.764)"
        fill="#fff"
      />
    </G>
  </Svg>
);
export default PaymentSuccessIconSVG;
