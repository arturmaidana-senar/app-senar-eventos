import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  useNavigation,
  CommonActions,
  useRoute,
} from '@react-navigation/native';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALERT_TYPE, Dialog } from '../../components/Modals/CustomAlertModal';
import api from './../../services/endpont';
import LoadingInfo from '../../components/Ui/LoadingInfo';

export default function NewPassword() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { name, userId, tokenId } = route.params || {};

  const [passwordField, setPasswordField] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);
  const [passwordNewField, setPasswordNewField] = useState('');
  const [passwordNewHide, setPasswordNewHide] = useState(true);
  const [loading, setLoading] = useState(false);

  const confirmInputRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleBackToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      }),
    );
  };

  async function handlePassword() {
    if (passwordField === '' || passwordNewField === '') {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Campos obrigatórios',
        textBody: 'Informe e confirme a nova senha para continuar.',
        button: 'Entendi',
      });
    }
    if (passwordField.length < 6) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Senha muito curta',
        textBody: 'A senha deve ter no mínimo 6 caracteres.',
        button: 'Entendi',
      });
    }

    if (passwordField !== passwordNewField) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Senhas diferentes',
        textBody: 'As senhas informadas não conferem. Por favor, verifique.',
        button: 'Entendi',
      });
    }

    try {
      setLoading(true);
      const response = await api.postUpdatePassword(
        passwordField,
        passwordNewField,
        userId,
        tokenId,
      );
      if (response.error) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: response.message,
          button: 'Fechar',
        });
      }
      setPasswordField('');
      setPasswordNewField('');

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Senha atualizada',
        textBody: 'Sua nova senha foi cadastrada com sucesso.',
        button: 'Ir para o login',
        onPressButton: handleBackToLogin,
      });
    } catch (error) {
      return Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: error,
        button: 'Fechar',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        hidden={true}
        backgroundColor="#F6F7F2"
        barStyle="dark-content"
      />
      <LoadingInfo visible={loading} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: Math.max(insets.bottom, 20) + 24,
          },
        ]}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrowText}>REDEFINIÇÃO DE SENHA</Text>
            <Text style={styles.pageTitle}>Nova senha</Text>
          </View>
        </View>

        {/* Back Link */}
        <TouchableOpacity
          style={styles.backLinkRow}
          onPress={handleBackToLogin}
          activeOpacity={0.75}
        >
          <Feather name="arrow-left" size={16} color="#5F6A61" />
          <Text style={styles.backLinkText}>Voltar para o login</Text>
        </TouchableOpacity>

        {/* Hero Card */}
        <LinearGradient
          colors={['#1E4B31', '#2E6241', '#3E7751']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCircleDecor} />

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>CRIE UMA NOVA SENHA</Text>
          </View>

          <View style={styles.heroContentRow}>
            <View style={styles.heroIconBox}>
              <Feather name="lock" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {name || 'Organizador'}
              </Text>
              <Text style={styles.heroSubtitle}>
                Escolha uma senha com pelo menos 6 caracteres e confirme abaixo.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formEyebrow}>SEGURANÇA</Text>
          <Text style={styles.formTitle}>Definir nova senha</Text>
          <Text style={styles.formSubtitle}>
            Preencha os dois campos abaixo para concluir a atualização.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Nova senha</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={18}
                color="#7A847B"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9AA39B"
                style={styles.input}
                value={passwordField}
                secureTextEntry={passwordHide}
                returnKeyType="next"
                onSubmitEditing={() => confirmInputRef.current?.focus()}
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

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirmar nova senha</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="check-circle"
                size={18}
                color="#7A847B"
                style={styles.inputIcon}
              />
              <TextInput
                ref={confirmInputRef}
                placeholder="Repita a nova senha"
                placeholderTextColor="#9AA39B"
                style={styles.input}
                value={passwordNewField}
                secureTextEntry={passwordNewHide}
                returnKeyType="done"
                onSubmitEditing={handlePassword}
                onChangeText={t => setPasswordNewField(t)}
              />
              <TouchableOpacity
                onPress={() => setPasswordNewHide(!passwordNewHide)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Feather
                  name={passwordNewHide ? 'eye' : 'eye-off'}
                  size={18}
                  color="#6E786F"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handlePassword} activeOpacity={0.85}>
            <LinearGradient
              colors={['#437A56', '#2F5E3E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Cadastrar nova senha</Text>
              <Feather name="check" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#18221B',
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6A61',
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
    width: 145,
    height: 145,
    borderRadius: 72,
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
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 23,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.84)',
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    padding: 20,
  },
  formEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13.5,
    color: '#6E786F',
    lineHeight: 19,
    marginBottom: 18,
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
  submitButton: {
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
