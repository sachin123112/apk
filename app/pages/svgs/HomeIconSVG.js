import * as React from "react";
import Svg, { Path } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: style */
const HomeIconSVG = (props) => (
  <Svg
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 20 20"
    style={{
      enableBackground: "new 0 0 20 20",
    }}
    xmlSpace="preserve"
    {...props}
  >
    <Path
      className="st0"
      d="M19.5,7.6l-8.7-7.2l0,0c-0.1-0.2-0.3-0.3-0.6-0.3H9.9c-0.2,0-0.4,0.1-0.6,0.3l0,0L0.5,7.6 C0.3,7.7,0.3,8,0.3,8.2v10.7V19v0.1c0,0.4,0.3,0.7,0.7,0.7c0,0,0,0,0.1,0l0,0h6.1h0.1c0.4,0,0.7-0.3,0.8-0.7v-4.9H12v4.9 c0.1,0.4,0.4,0.7,0.8,0.7h0.1H19c0,0,0,0,0.1,0l0,0c0.4,0,0.7-0.3,0.7-0.7V19v-0.1V8.2C19.8,8,19.7,7.7,19.5,7.6z M18.2,18.3h-4.4 v-4.9c0-0.5-0.4-0.8-0.8-0.8h-0.4H7.3H7c-0.4,0-0.8,0.3-0.8,0.8v4.9H1.8V8.6L10,2.3l8.2,6.3V18.3z"
    />
  </Svg>
);
export default HomeIconSVG;
