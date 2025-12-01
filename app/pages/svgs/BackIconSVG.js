import * as React from "react";
import Svg, { Defs, ClipPath, Path, Rect, G } from "react-native-svg";
const BackIconSVG = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={48}
    height={48}
    viewBox="0 0 48 48"
    {...props}
  >
    <Defs>
      <ClipPath id="clip-path">
        <Path
          id="_Icon_\u0421olor"
          data-name="\uD83C\uDFA8 Icon \u0421olor"
          d="M12.5,24A12.272,12.272,0,0,1,0,12,12.272,12.272,0,0,1,12.5,0,12.272,12.272,0,0,1,25,12,12.272,12.272,0,0,1,12.5,24Zm-5-13.2a1.2,1.2,0,1,0,0,2.4h6.982l-1.616,1.552a1.164,1.164,0,0,0,0,1.7,1.286,1.286,0,0,0,1.767,0l3.749-3.6a1.2,1.2,0,0,0,.271-.39,1.13,1.13,0,0,0,0-.913.727.727,0,0,0-.089-.139l-.041-.055c-.015-.022-.028-.044-.041-.067a.523.523,0,0,0-.08-.114l-3.578-3.6a1.288,1.288,0,0,0-1.767-.04,1.17,1.17,0,0,0-.042,1.7l1.562,1.57Z"
          transform="translate(-0.001 0.001)"
          fill="#222b45"
        />
      </ClipPath>
      <ClipPath id="clip-Top_Back_left">
        <Rect width={48} height={48} />
      </ClipPath>
    </Defs>
    <G id="Top_Back_left" clipPath="url(#clip-Top_Back_left)">
      <G id="Top_Back" transform="translate(0 1)">
        <Rect
          id="Rectangle_2224"
          data-name="Rectangle 2224"
          width={48}
          height={46}
          fill="#fff"
          opacity={0}
        />
        <G id="_22_Icon" data-name="22) Icon" transform="translate(16 16)">
          <G id="Group_30" data-name="Group 30">
            <Path
              id="_Icon_\u0421olor-2"
              data-name="\uD83C\uDFA8 Icon \u0421olor"
              d="M15,6H3.135L6.768,1.64A1,1,0,0,0,5.232.36l-5,6a.942.942,0,0,0-.088.154.947.947,0,0,0-.071.124A.985.985,0,0,0,0,7H0a.985.985,0,0,0,.072.358.947.947,0,0,0,.071.124.942.942,0,0,0,.088.154l5,6a1,1,0,0,0,1.536-1.28L3.135,8H15a1,1,0,0,0,0-2"
              fill="#072e77"
              stroke="rgba(0,0,0,0)"
              strokeWidth={1}
            />
          </G>
        </G>
      </G>
    </G>
  </Svg>
);
export default BackIconSVG;
