import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Calendar, User, QrCode, Circle } from 'lucide-react-native';

const tabConfig = {
  Home: { Icon: Home, label: 'Início' },
  Event: { Icon: Calendar, label: 'Eventos' },
  Information: { Icon: User, label: 'Perfil' },
};

export default ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  const goTo = screenName => {
    navigation.navigate(screenName);
  };

  const handleQrPress = async () => {
    try {
      const savedId = await AsyncStorage.getItem('@activeEventId');
      if (savedId) {
        navigation.navigate('Service', {
          eventId: Number(savedId),
          initialTab: 'checkin',
          openScanner: true,
        });
        return;
      }
    } catch {}
    navigation.navigate('Home');
  };

  const renderTabButton = route => {
    const index = state.routes.findIndex(r => r.name === route.name);
    const isFocused = state.index === index;
    const config = tabConfig[route.name] || {};
    const TabIcon = config.Icon || Circle;
    const label = config.label || route.name;
    const tintColor = isFocused ? '#2F5E38' : '#8D988E';

    return (
      <Pressable
        key={route.name}
        style={[styles.tabItem, isFocused && styles.tabItemActive]}
        onPress={() => goTo(route.name)}
        android_ripple={{
          color: 'rgba(47, 94, 56, 0.08)',
          borderless: true,
        }}
      >
        <TabIcon size={19} color={tintColor} />
        <Text
          style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const homeRoute = state.routes.find(r => r.name === 'Home');
  const eventRoute = state.routes.find(r => r.name === 'Event');
  const infoRoute = state.routes.find(r => r.name === 'Information');

  const bottomOffset = Math.max(insets.bottom + 10, 18);

  return (
    <View
      style={[
        styles.wrapper,
        { bottom: bottomOffset },
      ]}
    >
      <View style={styles.tabBar}>
        {homeRoute && renderTabButton(homeRoute)}
        {eventRoute && renderTabButton(eventRoute)}

        <Pressable
          style={styles.tabItem}
          onPress={handleQrPress}
          android_ripple={{
            color: 'rgba(47, 94, 56, 0.08)',
            borderless: true,
          }}
        >
          <QrCode size={19} color="#8D988E" />
          <Text style={styles.tabLabel} numberOfLines={1}>
            QR Code
          </Text>
        </Pressable>

        {infoRoute && renderTabButton(infoRoute)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 14,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginHorizontal: 3,
  },
  tabItemActive: {
    backgroundColor: '#EDF4EE',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#8D988E',
  },
  tabLabelActive: {
    color: '#2F5E38',
    fontWeight: '700',
  },
});
