import React, { useLayoutEffect, useState, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
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

export default function ValidatePin() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { cpf, name } = route.params || {};

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function handleResendCode() {
    try {
      setLoading(true);
      const response = await api.getRecoverPassword(cpf);
      if (response.error) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: response.message,
          button: 'Fechar',
        });
      }
      setPin('');
      inputRefs.current[0]?.focus();
      return Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'PIN reenviado',
        textBody: 'Enviamos um novo código PIN para o seu e-mail cadastrado.',
        button: 'Fechar',
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

  async function validatePin() {
    if (pin.length !== 5) return;

    try {
      setLoading(true);
      const response = await api.getVerifyToken(cpf, pin);
      if (response.error) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Código inválido',
          textBody: response.message,
          button: 'Fechar',
        });
      }
      const userName = response.data.name;
      const userId = response.data.id;
      const tokenId = response.token_id;

      navigation.navigate('NewPassword', {
        name: userName,
        userId,
        tokenId,
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

  function handleNotResendCode() {
    return Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Suporte',
      textBody: 'Envie um e-mail para suporte@senarmt.org.br',
      button: 'Entendi',
    });
  }

  const isPinReady = pin.length === 5;

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
            <Text style={styles.eyebrowText}>VERIFICAÇÃO</Text>
            <Text style={styles.pageTitle}>Validar PIN</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleNotResendCode}
            activeOpacity={0.75}
          >
            <Feather name="help-circle" size={19} color="#18221B" />
          </TouchableOpacity>
        </View>

        {/* Back Link */}
        <TouchableOpacity
          style={styles.backLinkRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Feather name="arrow-left" size={16} color="#5F6A61" />
          <Text style={styles.backLinkText}>Voltar</Text>
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
            <Text style={styles.statusPillText}>CÓDIGO DE 5 DÍGITOS</Text>
          </View>

          <View style={styles.heroContentRow}>
            <View style={styles.heroIconBox}>
              <Feather name="shield" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle} numberOfLines={2}>
                Olá, {name || 'Organizador'}
              </Text>
              <Text style={styles.heroSubtitle}>
                Digite o código PIN enviado para o seu e-mail cadastrado.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formEyebrow}>CÓDIGO DE VALIDAÇÃO</Text>
          <Text style={styles.formTitle}>Informe o PIN recebido</Text>
          <Text style={styles.formSubtitle}>
            Caso não localize na caixa de entrada, verifique também a pasta de
            spam.
          </Text>

          <View style={styles.pinRow}>
            {Array(5)
              .fill('')
              .map((_, index) => {
                const digit = pin[index] || '';
                const isFilled = Boolean(digit);
                return (
                  <TextInput
                    key={index}
                    ref={ref => (inputRefs.current[index] = ref)}
                    style={[styles.pinBox, isFilled && styles.pinBoxFilled]}
                    maxLength={1}
                    keyboardType="numeric"
                    value={digit}
                    selectionColor="#2F5E38"
                    onChangeText={text => {
                      const clean = text.replace(/\D/g, '');
                      const newPin = pin.split('');
                      newPin[index] = clean;
                      setPin(newPin.join(''));
                      if (clean && index < 4) {
                        inputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (
                        nativeEvent.key === 'Backspace' &&
                        !pin[index] &&
                        index > 0
                      ) {
                        inputRefs.current[index - 1]?.focus();
                      }
                    }}
                  />
                );
              })}
          </View>

          <TouchableOpacity
            onPress={handleResendCode}
            style={styles.resendRow}
            activeOpacity={0.75}
          >
            <Feather name="refresh-cw" size={14} color="#2F5E38" />
            <Text style={styles.resendText}>Reenviar código PIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={validatePin}
            disabled={!isPinReady}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isPinReady ? ['#437A56', '#2F5E3E'] : ['#C7D0C8', '#B8C3B9']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Continuar</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNotResendCode}
            style={styles.helpBtn}
            activeOpacity={0.75}
          >
            <Feather name="mail" size={14} color="#5F6A61" />
            <Text style={styles.helpBtnText}>Não recebi o PIN</Text>
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
    marginBottom: 20,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 18,
  },
  pinBox: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F6F7F2',
    borderWidth: 1.5,
    borderColor: '#E5EAE0',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#18221B',
  },
  pinBoxFilled: {
    borderColor: '#2F5E38',
    backgroundColor: '#EDF4EE',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 18,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2F5E38',
  },
  submitButton: {
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  helpBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F6A61',
  },
});
