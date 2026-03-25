import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { StatusBar } from 'react-native';

const CustomStatusBar = ({
    backgroundColor,
    barStyle = "light-content" 
    }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={{ height: insets.top, backgroundColor }} >
            <StatusBar animated={true} backgroundColor={backgroundColor} barStyle={barStyle} />
        </View>
    )
}

export default CustomStatusBar;
