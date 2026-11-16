import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import House from '../../assets/images/house.svg';
import Person from '../../assets/images/user.svg';
import Layers from '../../assets/images/layers.svg';

const tabConfig = {
  Home: { Icon: House, label: 'Início' },
  Event: { Icon: Layers, label: 'Eventos' },
  Information: { Icon: Person, label: 'Perfil' },
};

export default ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  const goTo = screenName => {
    navigation.navigate(screenName);
  };

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = tabConfig[route.name] || {};
          const IconComponent = config.Icon;
          const label = config.label || route.name;
          const tintColor = isFocused ? '#2F5E38' : '#8D988E';

          return (
            <Pressable
              key={route.name}
              style={styles.tabItem}
              onPress={() => goTo(route.name)}
              android_ripple={{
                color: 'rgba(47, 94, 56, 0.08)',
                borderless: true,
              }}
            >
              <View
                style={[
                  styles.topIndicator,
                  isFocused && styles.topIndicatorActive,
                ]}
              />
              <View style={styles.iconWrap}>
                {IconComponent && <IconComponent size={22} color={tintColor} />}
              </View>
              <Text
                style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E7EBE2',
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  topIndicatorActive: {
    backgroundColor: '#2F5E38',
  },
  iconWrap: {
    marginBottom: 4,
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8D988E',
  },
  tabLabelActive: {
    color: '#2F5E38',
    fontWeight: '700',
  },
});
