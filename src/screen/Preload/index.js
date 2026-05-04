import React, { useEffect, useContext, useRef } from 'react';
import {
  Animated,
  Image,
  StatusBar,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { AuthContext } from '../../contexts/auth';
import { useNavigation } from '@react-navigation/native';

export default function Preload() {
  const navigation = useNavigation();
  const { loadStorage } = useContext(AuthContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      const checkToken = async () => {
        loadStorage();
      };
      checkToken();
    }, 6000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />

      <Animated.View style={[styles.centerContainer, { opacity: fadeAnim }]}>
        <Image
          style={styles.imageSplash}
          source={require('../../assets/images/LogoSenar1.png')}
          resizeMode="contain"
        />
        <Text style={styles.textMain}>Senar Eventos</Text>
        <Text style={styles.textSubtitle}>Controle de Eventos</Text>

        <View style={styles.dotsContainer}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Image
          style={styles.imageFooter}
          source={require('../../assets/images/FamatoBranca.png')}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D814E',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSplash: {
    width: 120,
    height: 120,
    flexShrink: 0,
    marginBottom: 20,
  },
  textMain: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Ubuntu',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageFooter: {
    width: 250,
    height: 45,
  },
});
