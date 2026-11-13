import React, { useEffect, useContext, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/auth';

export default function Preload() {
  const { loadStorage } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const logoScale = useRef(new Animated.Value(0.88)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      loadStorage();
    }, 2500);

    return () => clearTimeout(timer);
  }, [contentOpacity, loadStorage, logoScale, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15%', '100%'],
  });

  return (
    <LinearGradient
      colors={['#1E4B31', '#2E6241', '#3E7751']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        hidden={true}
        backgroundColor="#1E4B31"
        barStyle="light-content"
      />

      {/* Decorative organic circles */}
      <View style={styles.decorCircleTop} />
      <View style={styles.decorCircleBottom} />

      <Animated.View
        style={[
          styles.centerContainer,
          {
            opacity: contentOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.badgePill}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>SENAR MATO GROSSO</Text>
        </View>

        <View style={styles.logoCard}>
          <Image
            style={styles.imageSplash}
            source={require('../../assets/images/LogoSenar1.png')}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.textMain}>SENAR Eventos</Text>
        <Text style={styles.textSubtitle}>
          Gestão e Credenciamento de Eventos
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </Animated.View>

      <View
        style={[
          styles.footer,
          { bottom: Math.max(insets.bottom, 20) + 12 },
        ]}
      >
        <Image
          style={styles.imageFooter}
          source={require('../../assets/images/FamatoBranca.png')}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorCircleTop: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorCircleBottom: {
    position: 'absolute',
    bottom: -90,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 7,
    marginBottom: 24,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#A9DFB9',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  logoCard: {
    width: 108,
    height: 108,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  imageSplash: {
    width: 72,
    height: 72,
  },
  textMain: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  textSubtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 28,
  },
  progressTrack: {
    width: 150,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#A9DFB9',
  },
  footer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFooter: {
    width: 150,
    height: 44,
    opacity: 0.9,
  },
});
