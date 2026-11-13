import React from 'react';
import { StatusBar } from 'react-native';

const CustomStatusBar = () => {
  return (
    <StatusBar
      hidden={true}
      translucent={true}
      backgroundColor="transparent"
      animated={true}
    />
  );
};

export default CustomStatusBar;
