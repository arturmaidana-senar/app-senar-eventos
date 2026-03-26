import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
} from 'react-native';

import House from '../../assets/images/house.svg';
import Person from '../../assets/images/user.svg';
import Layers from '../../assets/images/layers.svg';

import { Dashboard2, ProfileIcon } from '../Icons/Icons';
const { width, height } = Dimensions.get('window');

const iconConfig = {
  Home: House,
  Event: Layers,
  Information: Person,
};

export default ({ state, navigation }) => {
  const { width } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const goTo = screenName => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, { width: isTablet ? '35%' : '65%' }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const IconComponent = iconConfig[route.name];
          const iconColor = isFocused ? '#00A859' : '#FFFFFF';

          return (
            <Pressable
              key={route.name}
              style={styles.tabItem}
              onPress={() => goTo(route.name)}
              android_ripple={{
                color: 'rgba(255,255,255,0.2)',
                borderless: true,
              }}
            >
              <View
                style={
                  isFocused
                    ? styles.activeIconContainer
                    : styles.inactiveIconContainer
                }
              >
                {IconComponent && <IconComponent size={32} color={iconColor} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: '#00A859',
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
