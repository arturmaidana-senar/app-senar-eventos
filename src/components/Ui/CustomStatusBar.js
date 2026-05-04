import React from 'react';
import { StatusBar } from 'react-native';

const CustomStatusBar = ({
    barStyle = "light-content" 
    }) => {
    return (
        <StatusBar 
            animated={true} 
            backgroundColor="transparent" 
            barStyle={barStyle} 
            translucent={true}
        />
    );
}

export default CustomStatusBar;
