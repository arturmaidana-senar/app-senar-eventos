import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  StatusBar,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from '../../contexts/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export default function SignIn() {
  const { signIn, loadingAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const logoImage = require('../../assets/images/LogoSenar1.png');
  const footerLogos = require('../../assets/images/Famato.png');

  async function handleLogin() {
    if (ValidarAcesso()) {
      return Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro de Validação',
        textBody: messageAlert,
        button: 'Fechar',
      });
    }

    try {
      const result = await signIn(emailField, passwordField);
      if (result?.error) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Falha no Login',
          textBody: `Mensagem: ${result.message}`,
          button: 'Fechar',
        });
      }
    } catch (err) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro de Conexão',
        textBody: 'Verifique se o servidor está online.',
        button: 'Fechar',
      });
    }
  }

  let messageAlert = '';
  const ValidarAcesso = () => {
    messageAlert = '';
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    let result = false;
    if (emailField === '') {
      result = true;
      messageAlert = 'O campo E-mail é obrigatório.';
    } else if (passwordField === '') {
      result = true;
      messageAlert = 'O campo Senha é obrigatório.';
    } else if (!reg.test(emailField.trim())) {
      result = true;
      messageAlert = 'E-mail inválido.';
    }
    return result;
  };

  const handleHelpPress = () => {
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Ajuda para Acessar',
      textBody:
        'Utilize o e-mail e senha cadastrados no portal de eventos do SENAR-MT. Caso tenha esquecido sua senha, toque em "Esqueceu a senha?".',
      button: 'Entendi',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar hidden={true} barStyle="light-content" backgroundColor="#132A1E" />

      <LinearGradient
        colors={['#132A1E', '#1B3E2B', '#234F37']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollViewContent,
            Platform.OS === 'android' &&
              keyboardHeight > 0 && { paddingBottom: 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Decorative background circles */}
          <View style={styles.heroDecorCircleTop} />
          <View style={styles.heroDecorCircleBottom} />

          <Animatable.View
            animation="fadeInDown"
            duration={800}
            useNativeDriver
            style={styles.headerContainer}
          >
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Image
                  source={logoImage}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.brandName}>SENAR</Text>
                <Text style={styles.brandRegion}>Mato Grosso</Text>
              </View>
            </View>

            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>CULTIVANDO CONEXÕES</Text>
            </View>

            <Text style={styles.heroHeadline}>
              O próximo passo do agro{'\n'}começa{' '}
              <Text style={styles.heroHeadlineAccent}>com você.</Text>
            </Text>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            useNativeDriver
            style={styles.card}
          >
            <Text style={styles.cardEyebrow}>BEM-VINDO AO SENAR EVENTOS</Text>
            <Text style={styles.title}>Bom ter você por aqui.</Text>
            <Text style={styles.subtitle}>
              Entre para descobrir novas experiências e acompanhar seus eventos.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="mail"
                  size={18}
                  color="#8C9991"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="seu@email.com.br"
                  placeholderTextColor="#9BA6A0"
                  style={styles.input}
                  value={emailField}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  onChangeText={t => setEmailField(t.toLowerCase())}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="lock"
                  size={18}
                  color="#8C9991"
                  style={styles.icon}
                />
                <TextInput
                  ref={passwordInputRef}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#9BA6A0"
                  style={styles.input}
                  value={passwordField}
                  secureTextEntry={passwordHide}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onChangeText={t => setPasswordField(t)}
                />
                <TouchableOpacity
                  onPress={() => setPasswordHide(!passwordHide)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={passwordHide ? 'eye' : 'eye-off'}
                    size={18}
                    color="#7B8881"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <View style={styles.securityBadge}>
                <Feather name="shield" size={14} color="#8A9690" />
                <Text style={styles.securityText}>Seus dados protegidos</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('ResetPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loadingAuth && styles.submitButtonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loadingAuth}
            >
              {loadingAuth ? (
                <ActivityIndicator size={22} color="#FFF" />
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitText}>Entrar</Text>
                  <Feather name="arrow-right" size={19} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={handleHelpPress}
              activeOpacity={0.7}
              style={styles.helpRow}
            >
              <Feather name="play" size={10} color="#2F7D4B" />
              <Text style={styles.helpText}>Precisa de ajuda para acessar?</Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Image
                source={footerLogos}
                style={styles.footerImage}
                resizeMode="contain"
              />
              <Text style={styles.footerSlogan}>
                Conectando pessoas. Fortalecendo o agro.
              </Text>
              <Text style={styles.footerCopyright}>
                © {new Date().getFullYear()} SENAR Mato Grosso
              </Text>
            </View>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#132A1E',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  heroDecorCircleTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(126, 217, 154, 0.08)',
  },
  heroDecorCircleBottom: {
    position: 'absolute',
    top: 90,
    left: -50,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 28,
    justifyContent: 'flex-end',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(126, 217, 154, 0.55)',
    backgroundColor: 'rgba(126, 217, 154, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoImage: {
    width: 24,
    height: 24,
    tintColor: '#7ED99A',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandRegion: {
    fontSize: 11,
    color: '#B5D6C0',
    marginTop: -2,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7ED99A',
    marginRight: 8,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBE7D4',
    letterSpacing: 1.5,
  },
  heroHeadline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  heroHeadlineAccent: {
    color: '#7ED99A',
  },
  card: {
    backgroundColor: '#F8FAF9',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F7D4B',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#141D18',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#67746D',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#1E2923',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8E4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#141D18',
    height: '100%',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 22,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#8A9690',
    marginLeft: 6,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#2F7D4B',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#2F7D4B',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#2F7D4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6ECE8',
    marginTop: 24,
    marginBottom: 16,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E2923',
    marginLeft: 6,
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerImage: {
    width: 190,
    height: 44,
    marginBottom: 6,
  },
  footerSlogan: {
    fontSize: 11,
    color: '#7B8881',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 10,
    color: '#9BA6A0',
  },
});
