import * as React from "react";
import Svg, { Defs, ClipPath, Rect, G, Circle, Path } from "react-native-svg";
const AddNewIconSVG = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={48}
    height={48}
    viewBox="0 0 48 48"
    {...props}
  >
    <Defs>
      <ClipPath id="clip-Add_new_account">
        <Rect width={48} height={48} />
      </ClipPath>
    </Defs>
    <G
      id="Add_new_account"
      data-name="Add new account"
      clipPath="url(#clip-Add_new_account)"
    >
      <G
        id="Component_204_128"
        data-name="Component 204 \u2013 128"
        transform="translate(0 1)"
      >
        <Rect
          id="Rectangle_2224"
          data-name="Rectangle 2224"
          width={48}
          height={46}
          fill="#fff"
          opacity={0}
        />
        <G
          id="Component_205_2"
          data-name="Component 205 \u2013 2"
          transform="translate(14 13)"
        >
          <G
            id="Ellipse_160"
            data-name="Ellipse 160"
            fill="none"
            stroke="#072e77"
            strokeWidth={1}
          >
            <Circle cx={10} cy={10} r={10} stroke="none" />
            <Circle cx={10} cy={10} r={9.5} fill="none" />
          </G>
          <G
            id="Group_28"
            data-name="Group 28"
            transform="translate(5.387 5.529)"
          >
            <Path
              id="Path_193"
              data-name="Path 193"
              d="M326.368,451.47h-1.307c-.562,0-1.124.006-1.686,0a.855.855,0,1,1,0-1.71c.892-.007,1.785,0,2.677,0h.317v-.577c0-.785,0-1.57,0-2.356a.859.859,0,1,1,1.713.011c0,.946,0,1.891,0,2.837a.474.474,0,0,0,.024.083h.274c.874,0,1.749,0,2.623,0a.859.859,0,1,1,0,1.713c-.963,0-1.926,0-2.927,0v.3q0,1.3,0,2.6a.863.863,0,1,1-1.714-.013C326.367,453.4,326.368,452.458,326.368,451.47Z"
              transform="translate(-322.512 -445.9)"
              fill="#072e77"
            />
          </G>
        </G>
      </G>
    </G>
  </Svg>
);
export default AddNewIconSVG;
