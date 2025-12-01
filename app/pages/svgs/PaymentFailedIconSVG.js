import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
const PaymentFailedIconSVG = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={72}
    height={72}
    viewBox="0 0 72 72"
    {...props}
  >
    <G
      id="Payment_failed"
      data-name="Payment failed"
      transform="translate(-5068.318 18364.621)"
    >
      <Path
        id="Oval"
        d="M36,0A36,36,0,1,1,0,36,36,36,0,0,1,36,0Z"
        transform="translate(5068.318 -18364.621)"
        fill="#ff3830"
        opacity={0.1}
      />
      <G id="interface" transform="translate(5077.261 -18355.322)">
        <Path
          id="Path"
          d="M26.868,0A26.856,26.856,0,0,0,0,26.659,27.036,27.036,0,0,0,26.868,53.527,26.764,26.764,0,0,0,26.868,0Z"
          transform="translate(0)"
          fill="#ff3830"
        />
        <G
          id="Group_2824"
          data-name="Group 2824"
          transform="translate(1.179 0.412)"
        >
          <Path
            id="background_basic_100"
            data-name="background/ basic 100"
            d="M27.127,10.788,16.966,20.211l-1.118,1.064a3.339,3.339,0,0,1-4.538,0L.935,11.576a2.925,2.925,0,0,1,0-4.287,3.43,3.43,0,0,1,4.506,0l8.138,7.51,3.387-3.223L22.621,6.5a3.43,3.43,0,0,1,4.506,0A2.925,2.925,0,0,1,27.127,10.788Z"
            transform="translate(12.587 6.633)"
            fill="#fff"
          />
          <Path
            id="background_basic_100-2"
            data-name="background/ basic 100"
            d="M27.128,5.131,16.966,14.555,15.848,15.62a3.339,3.339,0,0,1-4.538,0L.935,5.921a2.925,2.925,0,0,1,0-4.287,3.43,3.43,0,0,1,4.506,0l8.138,7.51L16.967,5.92,22.622.844a3.43,3.43,0,0,1,4.506,0A2.925,2.925,0,0,1,27.128,5.131Z"
            transform="translate(39.942 39.406) rotate(180)"
            fill="#fff"
          />
        </G>
      </G>
    </G>
  </Svg>
);
export default PaymentFailedIconSVG;
