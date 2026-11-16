import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  X,
  Search,
  Info,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from '../../components/Modals/CustomAlertModal';

import apiService from '../../services/api';
import apiEndpoint from '../../services/endpont';
import { formatDateEvent } from '../../utils/dateFormat';

import CadastroResponsavelForm from '../../components/Ui/CadastroResponsavelForm';

export default function ResponsibleSignature() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId, termText, termMinorText } = route.params;

  const [event, setEvent] = useState(null);
  const [cpfInput, setCpfInput] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiEndpoint.getEvent(eventId);
        setEvent(resp.data);
      } catch (error) {
        console.log('Erro ao buscar evento', error);
      }
    })();
  }, [eventId]);

  const handleCpfChange = text => {
    let v = text.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpfInput(v);
  };

  const handleSearch = async () => {
    const cpfClean = cpfInput.replace(/\D/g, '');

    if (cpfClean.length !== 11) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'CPF inválido',
        textBody: 'Digite os 11 números do CPF para continuar.',
        button: 'Entendi',
      });
    }

    setLoadingSearch(true);

    try {
      const response = await apiService.get(`/physical-people/${cpfClean}`);
      const rootBody = response.data;
      const personData = rootBody.data || rootBody;
      const genders = rootBody.genders || [];

      if (personData) {
        setInitialData({
          name: personData.name,
          cpf: personData.cpf || cpfClean,
          phone:
            personData.whatsapp ||
            personData.phone ||
            personData.cellphone ||
            '',
          birth_date:
            personData.birth_date ||
            personData.nascimento ||
            personData.data_nascimento ||
            personData.dataNascimento,
          gender_id: personData.gender_id,
          genders: genders,
        });

        setShowForm(true);
      } else {
        throw new Error('Dados vazios');
      }
    } catch (err) {
      console.log('Erro na busca:', err);

      if (err.response && err.response.status === 404) {
        Dialog.show({
          type: ALERT_TYPE.INFO,
          title: 'Não encontrado',
          textBody: 'CPF não localizado. Preencha os dados manualmente.',
          button: 'Ok',
          autoClose: 2000,
        });

        setInitialData({
          cpf: cpfClean,
          name: '',
          phone: '',
          birth_date: '',
          genders: err.response?.data?.genders || [],
        });

        setShowForm(true);
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: 'Não foi possível buscar o responsável.',
          button: 'Fechar',
        });
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setInitialData(null);
  };

  const handleSuccessForm = () => {
    setShowForm(false);
    setCpfInput('');
    setInitialData(null);
  };

  const handleBackPress = () => {
    if (showForm) {
      handleCancelForm();
      return;
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
    >
      <StatusBar
        hidden={true}
        barStyle="dark-content"
        backgroundColor="#F6F7F2"
      />

      {/* Top Header */}
      <View
        style={[
          styles.topHeader,
          { paddingTop: Math.max(insets.top, 16) + 8 },
        ]}
      >
        <Text style={styles.eyebrowText}>LISTA LIVRE</Text>
        <Text style={styles.pageTitle}>Credenciamento de participante</Text>

        <TouchableOpacity
          style={styles.backLinkRow}
          onPress={handleBackPress}
          activeOpacity={0.75}
        >
          <ArrowLeft size={16} color="#5F6A61" />
          <Text style={styles.backLinkText}>
            {showForm ? 'Voltar para busca por CPF' : 'Voltar para o evento'}
          </Text>
        </TouchableOpacity>
      </View>

      {showForm ? (
        <CadastroResponsavelForm
          id_evento={eventId}
          initialData={initialData}
          onCancel={handleCancelForm}
          onSuccess={handleSuccessForm}
          termText={termText}
          termMinorText={termMinorText}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 20) + 28 },
          ]}
        >
          {/* Hero Event Card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#1E4B31', '#2E6241', '#3E7751']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroCircleDecor} />

            <View style={styles.heroContent}>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusPillText}>NOVO PARTICIPANTE</Text>
              </View>

              {event ? (
                <>
                  <Text style={styles.heroTitle}>{event.name}</Text>
                  <View style={styles.heroMetaRow}>
                    <Calendar size={14} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.heroMetaText}>
                      {formatDateEvent(event.started_at)} —{' '}
                      {formatDateEvent(event.ended_at)}
                    </Text>
                  </View>
                </>
              ) : (
                <ActivityIndicator color="#FFFFFF" style={styles.heroLoader} />
              )}
            </View>
          </View>

          {/* CPF Search Card */}
          <View style={styles.searchCard}>
            <Text style={styles.sectionEyebrow}>IDENTIFICAÇÃO</Text>
            <Text style={styles.sectionHeading}>
              Dados do participante / responsável
            </Text>

            <View style={styles.inputRow}>
              <View style={styles.inputBox}>
                <CreditCard
                  size={18}
                  color="#7A847B"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="000.000.000-00"
                  placeholderTextColor="#9AA39B"
                  value={cpfInput}
                  onChangeText={handleCpfChange}
                  keyboardType="numeric"
                  maxLength={14}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  style={styles.input}
                />
                {cpfInput.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setCpfInput('')}
                    style={styles.clearBtn}
                    activeOpacity={0.7}
                  >
                    <X size={16} color="#7A847B" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={handleSearch}
                disabled={loadingSearch}
                activeOpacity={0.85}
              >
                <View style={styles.searchButton}>
                  <LinearGradient
                    colors={['#437A56', '#2F5E3E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {loadingSearch ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Search size={20} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Info size={17} color="#2F5E38" />
              <Text style={styles.infoText}>
                Informe o CPF. Se o responsável já tiver cadastro, os dados
                (Nome, WhatsApp e Data de Nasc.) serão carregados
                automaticamente.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    backgroundColor: '#F6F7F2',
  },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 10,
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6A61',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 20,
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
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    padding: 18,
  },
  sectionEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 3,
  },
  sectionHeading: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  inputBox: {
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
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#18221B',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDF4EE',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    color: '#35533C',
    lineHeight: 18,
  },
});
