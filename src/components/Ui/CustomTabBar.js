import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName = 'home-outline';
        if (route.name === 'Event') iconName = 'grid-outline';
        if (route.name === 'Information') iconName = 'person-outline';

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[styles.tabItem, isFocused && styles.tabItemFocused]}
            activeOpacity={0.8}
          >
            <Icon
              name={iconName}
              size={22}
              color={isFocused ? '#4A9954' : '#FFFFFF'}
            />
            {isFocused && <Text style={styles.tabLabel}>{label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#4A9954',
    borderRadius: 40,
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: width * 0.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  tabItemFocused: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    color: '#4A9954',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});
