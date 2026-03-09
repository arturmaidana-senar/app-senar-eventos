import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import apiService from '../../services/api';
import apiEndpoint from '../../services/endpont';

import { formatDateEvent } from '../../utils/dateFormat';
import { COLORS } from '../../constants/theme';
import { setHeaderOptions } from '../../components/HeaderTitle';
import CustomTopHeader from '../../components/Ui/CustomTopHeader';

import CadastroResponsavelForm from '../../components/Ui/CadastroResponsavelForm';

export default function CredentialScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId, termText, termMinorText } = route.params;
  const [event, setEvent] = useState(null);
  const [cpfInput, setCpfInput] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    setHeaderOptions(navigation, {
      headerTitle: 'Credenciamento de Participante',
      headerTitleStyle: { fontFamily: 'Arial', fontSize: 18, color: '#333333' },
      headerTintColor: '#333333',
    });

    (async () => {
      try {
        const resp = await apiEndpoint.getEvent(eventId);
        setEvent(resp.data);
      } catch (error) {
        console.log('Erro ao buscar evento', error);
      }
    })();
  }, [eventId, navigation]);

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
        title: 'Atenção',
        textBody: 'CPF inválido. Digite 11 números.',
        button: 'Ok',
      });
    }

    setLoadingSearch(true);

    try {
      const response = await apiService.get(`/physical-people/${cpfClean}`);

      // --- LOG PARA DEBUG ---
      console.log('--- RESPOSTA DO BACKEND (RAW) ---');
      console.log(JSON.stringify(response.data, null, 2));
      // ----------------------

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

        // Dialog.show({
        //   type: ALERT_TYPE.SUCCESS,
        //   title: 'Cadastro Encontrado',
        //   textBody: `Responsável: ${personData.name}`,
        //   button: 'Ok',
        //   autoClose: 1500,
        // });

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
          textBody: 'CPF não localizado. Preencha manualmente.',
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

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.background || '#F2F4F8' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={Platform.OS === 'ios'}
    >
      <CustomTopHeader
        navigation={navigation}
        title="Credenciamento de Participante"
      />

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
        <ScrollView contentContainerStyle={styles.scroll}>
          {event ? (
            <View style={[styles.eventCard, { backgroundColor: '#fff' }]}>
              <Text style={[styles.eventTitle, { color: '#333' }]}>
                {event.name}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Icon name="event" size={16} color="#666" />
                <Text
                  style={[styles.eventDate, { color: '#666', marginLeft: 6 }]}
                >
                  {formatDateEvent(event.started_at)} —{' '}
                  {formatDateEvent(event.ended_at)}
                </Text>
              </View>
            </View>
          ) : (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              color={COLORS.primary}
            />
          )}

          <View style={styles.searchContainer}>
            <Text style={styles.searchLabel}>
              Dados do participante/Responsável
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="CPF (000.000.000-00)"
                placeholderTextColor="#999"
                value={cpfInput}
                onChangeText={handleCpfChange}
                keyboardType="numeric"
                maxLength={14}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchButton}
                disabled={loadingSearch}
              >
                {loadingSearch ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Icon name="search" size={26} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Icon
                name="info-outline"
                size={22}
                color="#0288D1"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.infoText}>
                Informe o CPF. Se o responsável já tiver cadastro, os dados
                (Nome, Whatsapp, Data Nasc.) serão carregados automaticamente.
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
  },
  scroll: {
    padding: 16,
  },

  eventCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 25,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
  },

  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: COLORS.primary || '#3E7B58',
    borderRadius: 8,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E1F5FE',
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  infoText: {
    flex: 1,
    color: '#0277BD',
    fontSize: 13,
    lineHeight: 18,
  },
});
