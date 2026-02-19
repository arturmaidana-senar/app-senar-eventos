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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo from '../../assets/images/logo_senarmt.svg';
import { AuthContext } from '../../contexts/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EyeIcon from 'react-native-vector-icons/Feather';
import EyeOffIcon from 'react-native-vector-icons/Feather';

import { CustomButton } from './styles';

export default function SignIn() {
  const { signIn, loadingAuth } = useContext(AuthContext);
  const navigation = useNavigation();
  const [emailField, setEmailField] = useState('');
  const [passwordField, setPasswordField] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);

  const iconColorPassWord = passwordField.length > 0 ? '#007C6F' : '#000';

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
      // Tenta realizar o login e captura o retorno
      const result = await signIn(emailField, passwordField);

      // Se o login falhar por algum motivo interno que o Context não disparou alerta
      if (result?.error) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Falha no Login',
          textBody: `Mensagem: ${result.message}\nRota: ${
            result.endpoint || 'Não informada'
          }`,
          button: 'Fechar',
        });
      }
    } catch (err) {
      // Captura erros de rede ou crash na requisição
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro de Conexão (Debug)',
        textBody: `Causa: ${err.message}\nVerifique se o servidor está online.`,
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
      messageAlert = 'O campo Endereço de e-mail é obrigatório.';
    } else if (passwordField === '') {
      result = true;
      messageAlert = 'O campo Senha é obrigatório.';
    } else if (!reg.test(emailField.trim())) {
      result = true;
      messageAlert =
        'O Endereço de e-mail deve ser um endereço de e-mail válido.';
    }
    return result;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.logoContainer}>
          <Logo width={141} marginTop={33} marginBottom={32} />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <Icon
              name="mail-outline"
              size={24}
              color={emailField.length > 0 ? '#007C6F' : '#000'}
              style={styles.icon}
            />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#888"
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
            <MCIcon
              name="lock-outline"
              size={24}
              color={iconColorPassWord}
              style={styles.icon}
            />
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#888"
              style={styles.input}
              value={passwordField}
              secureTextEntry={passwordHide}
              onChangeText={t => setPasswordField(t)}
            />
            <CustomButton onPress={() => setPasswordHide(!passwordHide)}>
              <EyeIcon
                name={passwordHide ? 'eye' : 'eye-off'}
                size={24}
                color="#000"
              />
            </CustomButton>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPassword')}
          activeOpacity={0.5}
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
            <Text style={styles.submitText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollViewContent: { flexGrow: 1, justifyContent: 'flex-start', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  inputWrapper: { marginBottom: 20 },
  label: { color: '#007C6F', fontSize: 14, fontWeight: '400', marginBottom: 8 },
  inputContainer: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderColor: '#007C6F',
  },
  icon: { marginRight: 8 },
  input: { flex: 1, color: '#000', height: '100%' },
  forgotPasswordText: { fontSize: 16, color: '#007C6F', textAlign: 'right' },
  submitButton: {
    backgroundColor: '#37C064',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: { color: '#FFF', fontSize: 16 },
});
