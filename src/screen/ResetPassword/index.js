import React, { useLayoutEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
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
import api from './../../services/endpont';
import LoadingInfo from '../../components/Ui/LoadingInfo';
import {
  ALERT_TYPE,
  Dialog,
} from '../../components/Modals/CustomAlertModal';

export default function ResetPassword() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const formatCPF = value => {
    const digits = value.replace(/\D/g, '');
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = text => {
    const cleanedText = text.replace(/\D/g, '');
    if (cleanedText.length <= 11) {
      setCpf(formatCPF(cleanedText));
    }
  };

  async function handleCpfPress() {
    if (cpf.length < 14) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'CPF incompleto',
        textBody: 'Digite os 11 dígitos do seu CPF para continuar.',
        button: 'Entendi',
      });
    }

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
      const name = response.data.name;
      navigation.navigate('ValidatePin', { cpf, name });
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

  const isCpfReady = cpf.length === 14;

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
            <Text style={styles.eyebrowText}>RECUPERAÇÃO DE ACESSO</Text>
            <Text style={styles.pageTitle}>Esqueceu sua senha?</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() =>
              Dialog.show({
                type: ALERT_TYPE.INFO,
                title: 'Recuperação por PIN',
                textBody:
                  'Após informar seu CPF, enviaremos um código PIN para o e-mail vinculado ao seu cadastro.',
                button: 'Entendi',
              })
            }
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
            <Text style={styles.statusPillText}>VERIFICAÇÃO SEGURA</Text>
          </View>

          <View style={styles.heroContentRow}>
            <View style={styles.heroIconBox}>
              <Feather name="key" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>
                Não se preocupe, vamos te ajudar.
              </Text>
              <Text style={styles.heroSubtitle}>
                Informe seu CPF para receber um código PIN de validação no seu
                e-mail.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formEyebrow}>IDENTIFICAÇÃO</Text>
          <Text style={styles.formTitle}>Digite seu CPF</Text>
          <Text style={styles.formSubtitle}>
            Localizaremos seu cadastro automaticamente assim que os 11 dígitos
            forem preenchidos.
          </Text>

          <View style={styles.inputContainer}>
            <Feather
              name="user"
              size={18}
              color="#7A847B"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#9AA39B"
              keyboardType="numeric"
              value={cpf}
              onChangeText={handleCpfChange}
              maxLength={14}
              returnKeyType="done"
              onSubmitEditing={handleCpfPress}
            />
            {cpf.length > 0 && (
              <TouchableOpacity
                onPress={() => setCpf('')}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Feather name="x" size={16} color="#7A847B" />
              </TouchableOpacity>
            )}
          </View>

          {isCpfReady && (
            <>
              <TouchableOpacity
                onPress={handleCpfPress}
                style={styles.optionButton}
                activeOpacity={0.8}
              >
                <View style={styles.optionIconBox}>
                  <Feather name="mail" size={19} color="#2F5E38" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Enviar PIN por E-mail</Text>
                  <Text style={styles.optionSubtitle}>
                    Receber código no e-mail cadastrado
                  </Text>
                </View>
                <Feather name="arrow-right" size={18} color="#2F5E38" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCpfPress} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#437A56', '#2F5E3E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>Continuar</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.tipBox}>
            <Feather name="info" size={16} color="#2F5E38" />
            <Text style={styles.tipText}>
              Vamos enviar o código PIN por e-mail. Caso não encontre, confira
              também sua caixa de spam.
            </Text>
          </View>
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
    marginBottom: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '600',
    color: '#18221B',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D6E4D9',
    backgroundColor: '#F5F9F6',
    marginBottom: 14,
    gap: 12,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E4EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14.5,
    color: '#18221B',
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#5F6A61',
    marginTop: 2,
  },
  submitButton: {
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDF4EE',
    borderRadius: 14,
    padding: 13,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 12.5,
    color: '#35533C',
    lineHeight: 18,
  },
});
