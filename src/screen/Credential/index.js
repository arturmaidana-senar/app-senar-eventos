import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/endpont';
import { ALERT_TYPE, Dialog } from '../../components/Modals/CustomAlertModal';
import { formatDateEvent } from '../../utils/dateFormat';
import LoadingInfo from '../../components/Ui/LoadingInfo';

export default function CredentialScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [qtde, setQtde] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.getEvent(eventId);
        setEvent(resp.data);
      } catch {}
    })();
  }, [eventId]);

  const formatCpfMask = value => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    if (digits.length <= 9) {
      return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    }
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  };

  const getInitials = name => {
    if (!name) return 'PA';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSearch = async () => {
    if (cpf.replace(/\D/g, '').length !== 11) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'CPF inválido',
        textBody: 'Informe um CPF válido com 11 dígitos.',
        button: 'Entendi',
      });
    }
    setLoading(true);
    try {
      const resp = await api.searchCredential(eventId, cpf.replace(/\D/g, ''));
      setParticipant(resp.data);
      setQtde(String(resp.data.qtde_remaining));
    } catch (err) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Não encontrado',
        textBody: err.response?.data?.message || 'Falha na busca.',
        button: 'Fechar',
      });
      setParticipant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!participant) return;
    setLoading(true);
    try {
      const payload = {
        participant_id: participant.participant_id,
        whatsapp: participant.whatsapp,
        gender_id: participant.gender_id,
        qtde: Number(qtde),
      };
      const resp = await api.createCredential(eventId, payload);

      if (resp.error === true) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Falha',
          textBody: resp.message,
          button: 'Fechar',
        });
      }

      setParticipant(null);
      setQtde('');
      setCpf('');
      return Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Presença registrada',
        textBody: resp.message || 'Check-in realizado com sucesso!',
        button: 'Fechar',
      });
    } catch (err) {
      return Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Falha',
        textBody:
          err.response?.data?.message || 'Falha ao gravar credenciamento.',
        button: 'Fechar',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCpfInput = text => {
    const masked = formatCpfMask(text);
    setCpf(masked);

    if (participant) {
      setParticipant(null);
      setQtde('');
    }
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
      <LoadingInfo visible={loading} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: Math.max(insets.bottom, 20) + 28,
          },
        ]}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrowText}>CREDENCIAMENTO MANUAL</Text>
            <Text style={styles.pageTitle}>Registrar presença</Text>
          </View>
        </View>

        {/* Back Link */}
        <TouchableOpacity
          style={styles.backLinkRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Feather name="arrow-left" size={16} color="#5F6A61" />
          <Text style={styles.backLinkText}>Voltar para o evento</Text>
        </TouchableOpacity>

        {/* Hero Event Card */}
        <LinearGradient
          colors={['#1E4B31', '#2E6241', '#3E7751']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCircleDecor} />

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>CHECK-IN POR CPF</Text>
          </View>

          {event ? (
            <>
              <Text style={styles.heroTitle}>{event.name}</Text>
              <View style={styles.heroMetaRow}>
                <Feather
                  name="calendar"
                  size={14}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={styles.heroMetaText}>
                  {formatDateEvent(event.started_at)} —{' '}
                  {formatDateEvent(event.ended_at)}
                </Text>
              </View>
            </>
          ) : (
            <ActivityIndicator color="#FFFFFF" style={styles.heroLoader} />
          )}
        </LinearGradient>

        {/* Search Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>BUSCA POR DOCUMENTO</Text>
          <Text style={styles.sectionHeading}>Localizar participante</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Feather
                name="credit-card"
                size={18}
                color="#7A847B"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="000.000.000-00"
                placeholderTextColor="#9AA39B"
                value={cpf}
                onChangeText={handleCpfInput}
                keyboardType="numeric"
                maxLength={14}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                style={styles.searchInput}
              />
              {cpf.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleCpfInput('')}
                  style={styles.clearBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={16} color="#7A847B" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={handleSearch} activeOpacity={0.85}>
              <LinearGradient
                colors={['#437A56', '#2F5E3E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.searchBtn}
              >
                <Feather name="search" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Participant Result Card */}
        {participant ? (
          <View style={styles.sectionCard}>
            <View style={styles.participantHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(participant.name)}
                </Text>
              </View>
              <View style={styles.participantTitleWrap}>
                <Text style={styles.sectionEyebrow}>
                  PARTICIPANTE ENCONTRADO
                </Text>
                <Text style={styles.participantName} numberOfLines={2}>
                  {participant.name}
                </Text>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>WhatsApp</Text>
              <View style={styles.fieldBox}>
                <Feather
                  name="phone"
                  size={17}
                  color="#7A847B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  value={participant.whatsapp}
                  onChangeText={w =>
                    setParticipant({ ...participant, whatsapp: w })
                  }
                  keyboardType="phone-pad"
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#9AA39B"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Qtde Ingressos</Text>
              <View style={styles.fieldBox}>
                <Feather
                  name="tag"
                  size={17}
                  color="#7A847B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.fieldInput}
                  value={qtde}
                  onChangeText={setQtde}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor="#9AA39B"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#437A56', '#2F5E3E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.saveText}>Confirmar presença</Text>
                    <Feather name="check" size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyTipCard}>
            <View style={styles.emptyTipIconBox}>
              <Feather name="user-check" size={22} color="#2F5E38" />
            </View>
            <Text style={styles.emptyTipTitle}>Busca rápida por CPF</Text>
            <Text style={styles.emptyTipText}>
              Digite os 11 dígitos do CPF acima e toque no botão de busca para
              localizar a inscrição do participante.
            </Text>
          </View>
        )}
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
    marginBottom: 14,
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
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 26,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroMetaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.86)',
    fontWeight: '500',
    flex: 1,
  },
  heroLoader: {
    marginVertical: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    padding: 18,
    marginBottom: 16,
  },
  sectionEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 3,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputWrap: {
    flex: 1,
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#18221B',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  searchBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EBF3ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F5E38',
  },
  participantTitleWrap: {
    flex: 1,
  },
  participantName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18221B',
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
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 14,
    height: 50,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#18221B',
    paddingVertical: 0,
  },
  saveButton: {
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyTipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    padding: 24,
    alignItems: 'center',
  },
  emptyTipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EDF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 6,
  },
  emptyTipText: {
    fontSize: 13,
    color: '#6E786F',
    textAlign: 'center',
    lineHeight: 19,
  },
});
