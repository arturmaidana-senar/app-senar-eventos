import React, { useState, useContext } from 'react';
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
  ImageBackground,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../contexts/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export default function SignIn() {
  const { signIn, loadingAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);

  const backgroundImage = require('../../assets/images/Background4.png');
  const logoImage = require('../../assets/images/LogoSenar3.png');

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#51A85A" />

      <ImageBackground
        source={backgroundImage}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.eventosLogoContainer}>
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>
            Entre com suas credenciais para continuar
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#999" style={styles.icon} />
              <TextInput
                placeholder="seu@senarmt.org.br"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
                value={emailField}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={t => setEmailField(t.toLowerCase())}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#999" style={styles.icon} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
                value={passwordField}
                secureTextEntry={passwordHide}
                onChangeText={t => setPasswordField(t)}
              />
              <TouchableOpacity
                onPress={() => setPasswordHide(!passwordHide)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={passwordHide ? 'eye' : 'eye-off'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ResetPassword')}
            activeOpacity={0.7}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loadingAuth}
          >
            {loadingAuth ? (
              <ActivityIndicator size={20} color="#FFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitText}>Entrar</Text>
                <Feather
                  name="arrow-right"
                  size={20}
                  color="#FFF"
                  style={styles.buttonIcon}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>ou</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.registerLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBackground: {
    height: 250,
    width: '100%',
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventosLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  logoImage: {
    width: 200,
    height: 80,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 190,
  },
  card: {
    backgroundColor: '#FFF',
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F4F6F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#333',
    height: '100%',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4A9954',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4A9954',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  orText: {
    marginHorizontal: 16,
    color: '#A0A0A0',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: '#8A8A8A',
    fontSize: 14,
  },
  registerLink: {
    color: '#4A9954',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
