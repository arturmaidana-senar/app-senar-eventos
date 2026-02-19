import React from 'react';
import Svg, {Path, G, Rect, Circle} from 'react-native-svg';

export const ArrowLeft = ({size = 24, color = '#333'}) => {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        fill={color}
        d="M14.71 15.88L10.83 12l3.88-3.88a.996.996 0 1 0-1.41-1.41L8.71 11.3a.996.996 0 0 0 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0c.38-.39.39-1.03 0-1.42"></Path>
    </Svg>
  );
};

export const ArrowLeft2 = ({size = 24, color = '#333'}) => {
  return (
    <Svg viewBox="0 0 512 512" width={size} height={size}>
      <Path
        fill={color}
        d="M497.333 239.999H80.092l95.995-95.995l-22.627-22.627L18.837 256L153.46 390.623l22.627-22.627l-95.997-95.997h417.243z"></Path>
    </Svg>
  );
};
