import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importe seu SVG como um componente
import BackgroundSvg from '../../assets/images/Background4.svg';
import Logo from '../../assets/images/LogoSenar3.png';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const userToken = await AsyncStorage.getItem('@eventToken');
        if (userToken) {
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        setIsChecking(false);
      }
    }
    checkLoginStatus();
  }, [navigation]);

  const Background = () => (
    <View style={styles.svgWrapper}>
      <BackgroundSvg
        width="100%"
        height="100%"
        // 'xMidYMid slice' centraliza e corta as sobras (igual ao 'cover')
        // Se estiver muito para cima, tente mudar para 'xMidYMax slice'
        // ou apenas garantir que o viewBox do arquivo esteja correto.
        preserveAspectRatio="xMidYMid slice"
      />
    </View>
  );

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <Background />
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={Logo}
            style={{ width: 180, height: 120 }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Conecte-se e{'\n'}Gerencie</Text>
          <Text style={styles.subtitle}>
            Sua Jornada de eventos{'\n'}simplificada e envolvente.
          </Text>
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Acessar minha conta</Text>
            <Icon name="arrow-right" size={20} color="#40914D" />
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Primeiro acesso? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  svgWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden', // Garante que nada saia dos limites da tela
    backgroundColor: '#40914D', // Cor de fundo caso o SVG demore a carregar
  },
  container: {
    flex: 1,
    backgroundColor: '#40914D', // Fallback
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#40914D',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    fontWeight: '400',
  },
  footerContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#40914D',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  registerLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
