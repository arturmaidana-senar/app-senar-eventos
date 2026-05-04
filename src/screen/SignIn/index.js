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
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'react-native-linear-gradient';
import { AuthContext } from '../../contexts/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export default function SignIn() {
  const { signIn, loadingAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#00A859" />

      <LinearGradient
        colors={['#00A859', '#004A24']}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000} 
            useNativeDriver 
            style={styles.headerContainer}
          >
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoTitle}>Senar Eventos</Text>
            <Text style={styles.logoSubtitle}>Controle de Eventos</Text>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp" 
            duration={1000} 
            useNativeDriver 
            style={styles.card}
          >
            <Text style={styles.title}>Seja Bem-vindo!</Text>
            <Text style={styles.subtitle}>
              Para continuar é necessário fazer login
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="mail"
                  size={18}
                  color="#777"
                  style={styles.icon}
                />
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
                <Feather
                  name="lock"
                  size={18}
                  color="#777"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="senha"
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
                    size={18}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ResetPassword')}
              activeOpacity={0.7}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
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
                <Text style={styles.submitText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Image
                source={footerLogos}
                style={styles.footerImage}
                resizeMode="contain"
              />
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
    backgroundColor: '#3d8b46',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    paddingVertical: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
    tintColor: '#FFF',
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#E0F2E9',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 40,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputContainer: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4ea658',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  footerImage: {
    width: '100%',
    height: 60,
  },
});
