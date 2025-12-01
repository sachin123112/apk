import * as React from "react";
import Svg, { Defs, ClipPath, Rect, G, Circle, Path } from "react-native-svg";
const PaymentCycleIconSVG = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  >
    <Defs>
      <ClipPath id="clip-path">
        <Rect
          id="Rectangle_2388"
          data-name="Rectangle 2388"
          width={12.205}
          height={11.27}
          fill="#8f9bb3"
        />
      </ClipPath>
      <ClipPath id="clip-Change_payment_cycle">
        <Rect width={24} height={24} />
      </ClipPath>
    </Defs>
    <G
      id="Change_payment_cycle"
      data-name="Change payment cycle"
      clipPath="url(#clip-Change_payment_cycle)"
    >
      <G
        id="Group_5158"
        data-name="Group 5158"
        transform="translate(-2.5 -2.5)"
      >
        <Circle
          id="Ellipse_824"
          data-name="Ellipse 824"
          cx={11.5}
          cy={11.5}
          r={11.5}
          transform="translate(3 3)"
          fill="#f7f9fc"
        />
        <G
          id="Group_3807"
          data-name="Group 3807"
          transform="translate(8.397 8.865)"
        >
          <G id="Group_3806" data-name="Group 3806" clipPath="url(#clip-path)">
            <Path
              id="Path_12560"
              data-name="Path 12560"
              d="M11.2,1.471A1.758,1.758,0,0,0,9.913.084,1.762,1.762,0,0,0,8.085.56c-.364.358-4.5,4.517-6.178,6.2a.857.857,0,0,0-.16.218C1.181,8.108.616,9.243.062,10.383a.694.694,0,0,0-.052.4.586.586,0,0,0,.838.427C2,10.651,3.139,10.081,4.282,9.51a1,1,0,0,0,.245-.195C6.175,7.67,10.408,3.456,10.8,3.03a1.679,1.679,0,0,0,.4-1.56"
              transform="translate(0 -0.001)"
              fill="#8f9bb3"
            />
            <Path
              id="Path_12561"
              data-name="Path 12561"
              d="M146.883,264.288c-.907,0-1.815,0-2.722,0a.6.6,0,0,1-.592-.824.569.569,0,0,1,.534-.389c.224-.01.449,0,.673,0q2.385,0,4.77,0a1,1,0,0,1,.269.026.606.606,0,0,1-.168,1.188c-.922,0-1.843,0-2.765,0Z"
              transform="translate(-138.044 -253.022)"
              fill="#8f9bb3"
            />
          </G>
        </G>
      </G>
    </G>
  </Svg>
);
export default PaymentCycleIconSVG;
