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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/auth';
import { ALERT_TYPE, Dialog } from '../../components/Modals/CustomAlertModal';

export default function SignIn() {
  const { signIn, loadingAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const logoImage = require('../../assets/images/LogoSenar1.png');
  const footerLogos = require('../../assets/images/Famato.png');

  let messageAlert = '';
  const ValidarAcesso = () => {
    messageAlert = '';
    let reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w\w+)+$/;
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        hidden={true}
        barStyle="dark-content"
        backgroundColor="#F6F7F2"
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom:
              keyboardHeight > 0
                ? keyboardHeight + 16
                : Math.max(insets.bottom, 20) + 16,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrowText}>SENAR MATO GROSSO</Text>
            <Text style={styles.pageTitle}>Acessar conta</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleHelpPress}
            activeOpacity={0.75}
          >
            <Feather name="help-circle" size={19} color="#18221B" />
          </TouchableOpacity>
        </View>

        {/* Hero Welcome Card */}
        <LinearGradient
          colors={['#1E4B31', '#2E6241', '#3E7751']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCircleDecor} />

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>PORTAL DO ORGANIZADOR</Text>
          </View>

          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Image
                source={logoImage}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandTitle}>SENAR Eventos</Text>
              <Text style={styles.brandSubtitle}>
                Gerencie eventos e realize check-ins em tempo real.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formEyebrow}>CREDENCIAIS</Text>
          <Text style={styles.formTitle}>Bom ter você por aqui.</Text>
          <Text style={styles.formSubtitle}>
            Entre com seus dados para acompanhar seus eventos.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="mail"
                size={18}
                color="#7A847B"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="seu@email.com.br"
                placeholderTextColor="#9AA39B"
                style={styles.input}
                value={emailField}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onFocus={() =>
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 145, animated: true });
                  }, 100)
                }
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
                color="#7A847B"
                style={styles.inputIcon}
              />
              <TextInput
                ref={passwordInputRef}
                placeholder="Digite sua senha"
                placeholderTextColor="#9AA39B"
                style={styles.input}
                value={passwordField}
                secureTextEntry={passwordHide}
                returnKeyType="done"
                onFocus={() =>
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 215, animated: true });
                  }, 100)
                }
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
                  color="#6E786F"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <View style={styles.securityBadge}>
              <Feather name="shield" size={14} color="#7A847B" />
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
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loadingAuth}
          >
            <LinearGradient
              colors={['#437A56', '#2F5E3E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.submitButton,
                loadingAuth && styles.submitButtonDisabled,
              ]}
            >
              {loadingAuth ? (
                <ActivityIndicator size={22} color="#FFF" />
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitText}>Entrar</Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleHelpPress}
            activeOpacity={0.7}
            style={styles.helpRow}
          >
            <Feather name="help-circle" size={14} color="#2F5E38" />
            <Text style={styles.helpText}>Precisa de ajuda para acessar?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Image
            source={footerLogos}
            style={styles.footerImage}
            resizeMode="contain"
          />
          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} SENAR Mato Grosso
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#18221B',
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroCircleDecor: {
    position: 'absolute',
    top: -36,
    right: -36,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    gap: 6,
    marginBottom: 16,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3E8E58',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#18221B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  brandTextWrap: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  brandSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.84)',
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    padding: 20,
    marginBottom: 20,
  },
  formEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13.5,
    color: '#6E786F',
    lineHeight: 19,
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#465248',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#18221B',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 18,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: '#7A847B',
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2F5E38',
  },
  submitButton: {
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F5E38',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 4,
    gap: 6,
  },
  footerImage: {
    width: 140,
    height: 36,
    opacity: 0.85,
  },
  footerCopyright: {
    fontSize: 11.5,
    color: '#8D988E',
  },
});
