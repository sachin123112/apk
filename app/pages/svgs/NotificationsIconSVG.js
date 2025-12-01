import * as React from "react";
import Svg, { Defs, ClipPath, Rect, G, Path } from "react-native-svg";
const NotificationsIconSVG = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  >
    <Defs>
      <ClipPath id="clip-Notification">
        <Rect width={24} height={24} />
      </ClipPath>
    </Defs>
    <G id="Notification" clipPath="url(#clip-Notification)">
      <G
        id="Group_4486"
        data-name="Group 4486"
        transform="translate(-232 -4489)"
      >
        <Rect
          id="Rectangle_2061"
          data-name="Rectangle 2061"
          width={24}
          height={24}
          transform="translate(232 4489)"
          fill="#fff"
          opacity={0}
        />
        <G
          id="Component_293_1"
          data-name="Component 293 \u2013 1"
          transform="translate(236 4492)"
        >
          <Path
            id="Path_16476"
            data-name="Path 16476"
            d="M2123.136,529.2c0-.294-.007-.582,0-.869a.848.848,0,1,1,1.7,0c.009.288,0,.576,0,.85a13.105,13.105,0,0,1,1.423.451,5.769,5.769,0,0,1,3.7,5.286c.077,1.559.025,3.125.017,4.688a.727.727,0,0,0,.249.586c.4.375.772.771,1.161,1.155a.857.857,0,0,1,.25.99.84.84,0,0,1-.866.534q-6.779,0-13.559,0a.861.861,0,0,1-.621-1.522c.366-.36.717-.737,1.094-1.085a.916.916,0,0,0,.32-.751c-.018-1.413.012-2.827-.012-4.24a5.988,5.988,0,0,1,4.853-5.982A2.855,2.855,0,0,0,2123.136,529.2ZM2119.3,541.15h9.384c-.482-.38-.406-.9-.4-1.4,0-.91.006-1.82,0-2.73-.006-.77.014-1.544-.05-2.31a4.278,4.278,0,0,0-8.531.558c-.007,1.553-.009,3.105,0,4.658A1.463,1.463,0,0,1,2119.3,541.15Z"
            transform="translate(-2116.27 -527.452)"
            fill="#060172"
            stroke="#fff"
            strokeWidth={0.1}
          />
          <Path
            id="Path_16477"
            data-name="Path 16477"
            d="M2213.327,781a1.7,1.7,0,1,1-3.4,0Z"
            transform="translate(-2203.914 -764.706)"
            fill="#060172"
            stroke="#fff"
            strokeWidth={0.1}
          />
        </G>
      </G>
    </G>
  </Svg>
);
export default NotificationsIconSVG;
