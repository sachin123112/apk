import * as React from "react";
import Svg, { Defs, ClipPath, Rect, G, Path } from "react-native-svg";
const MailIconSVG = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  >
    <Defs>
      <ClipPath id="clip-Mail">
        <Rect width={24} height={24} />
      </ClipPath>
    </Defs>
    <G id="Mail" clipPath="url(#clip-Mail)">
      <G
        id="Group_2421"
        data-name="Group 2421"
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
          id="Component_157_1"
          data-name="Component 157 \u2013 1"
          transform="translate(234 4494.001)"
        >
          <G id="Group_2447" data-name="Group 2447">
            <Path
              id="Path_8725"
              data-name="Path 8725"
              d="M2820.75,1599c.03-.105.054-.212.089-.316a1.757,1.757,0,0,1,1.675-1.2c1.224-.005,2.447,0,3.671,0h12.71a1.75,1.75,0,0,1,1.79,1.3,2.071,2.071,0,0,1,.063.519q.005,5.188,0,10.375a1.753,1.753,0,0,1-1.834,1.823h-16.283a1.756,1.756,0,0,1-1.852-1.448.493.493,0,0,0-.029-.071Zm2.049-.34c.056.06.093.1.132.142l7.293,7.293a.683.683,0,0,0,1.06-.008l7.293-7.293c.038-.038.071-.082.116-.135Zm-.014,11.655h15.93l-5.027-4.968c-.038.036-.09.084-.14.133-.487.487-.972.976-1.462,1.461a1.852,1.852,0,0,1-2.673,0c-.3-.293-.588-.589-.882-.883l-.718-.715Zm-.854-.9,5-4.93-5-4.94Zm17.637-9.876-5.014,4.951,5.014,4.956Z"
              transform="translate(-2820.75 -1597.477)"
              fill="#072e77"
            />
          </G>
        </G>
      </G>
    </G>
  </Svg>
);
export default MailIconSVG;
