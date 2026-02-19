// screens/CredentialScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import api from '../../services/endpont';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { formatDateEvent } from '../../utils/dateFormat';
import { COLORS, FONTS } from "../../constants/theme";
import { setHeaderOptions } from '../../components/HeaderTitle';

export default function CredentialScreen() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [qtde, setQtde] = useState('');

  // Busca dados do evento
  useEffect(() => {
    (async () => {
      try {
        const resp = await api.getEvent(eventId);
        setEvent(resp.data);
      } catch {
        // erro silenciado
      }
    })();
  }, [eventId]);

  // Máscara de CPF: XXX.XXX.XXX-XX
  const formatCpfMask = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  };

  // Busca participante pelo CPF
  const handleSearch = async () => {
    if (cpf.replace(/\D/g, '').length !== 11) {
      return Alert.alert('CPF inválido', 'Informe um CPF com 11 dígitos.');
    }
    setLoading(true);
    try {
      const resp = await api.searchCredential(eventId, cpf.replace(/\D/g, ''));
      setParticipant(resp.data);
      setQtde(String(resp.data.qtde_remaining));
    } catch (err) {
        Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Falha',
            textBody: err.response?.data?.message || 'Falha na busca.',
            button: 'Fechar',
        });
      setParticipant(null);
    } finally {
      setLoading(false);
    }
  };

  // Salva credenciamento
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
 
        if(resp.error == true){
            return  Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Falha',
                textBody: resp.message,
                button: 'Fechar',
            });
        } 
        
        setParticipant(null);
        setQtde('');
        setCpf('');
        return  Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Sucesso',
            textBody: resp.message,
            button: 'Fechar',
        });


        } catch (err) {
            return  Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Falha',
                textBody: err.response?.data?.message || 'Falha ao gravar credenciamento.',
                button: 'Fechar',
            });
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        setHeaderOptions(navigation, {
        headerTitle: 'Credenciamento',
        headerTitleStyle: { fontFamily: 'Arial', fontSize: 18, color: '#333333' },
        headerTintColor: '#333333',
        });
    }, [navigation]);

    const handleCpfInput = (text) => {
        const masked = formatCpfMask(text);
        setCpf(masked);

        // sempre que o CPF for alterado, esconde o card de participante
        if (participant) {
            setParticipant(null);
            setQtde('');
        }
    };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cartão de Evento */}
        {event ? (
          <View style={[styles.eventCard, { backgroundColor: '#fff' }]}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>
              {event.name}
            </Text>
            <Text style={[styles.eventDate, { color: colors.text }]}>
              {formatDateEvent(event.started_at)} — {formatDateEvent(event.ended_at)}
            </Text>
          </View>
        ) : (
          <ActivityIndicator style={{ marginVertical: 16 }} color={COLORS.primary} />
        )}

        {/* Campo CPF + botão buscar */}
        <View style={styles.searchRow}>
            <TextInput
                placeholder="CPF (000.000.000-00)"
                placeholderTextColor="#888"
                value={cpf}
                onChangeText={handleCpfInput}   // ← aqui
                keyboardType="numeric"
                style={[
                    styles.input,
                    {
                    backgroundColor: '#fff',
                    borderColor: COLORS.primary,
                    color: colors.text,
                    },
                ]}
            />
            <TouchableOpacity
                onPress={handleSearch}
                style={[styles.iconButton, { backgroundColor: COLORS.primary }]}
            >
            <Icon name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Card de dados do participante */}
        {participant && (
          <View style={[styles.card, { backgroundColor: '#fff' }]}>
            <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {participant.name}
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>WhatsApp</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#fff',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={participant.whatsapp}
              onChangeText={(w) =>
                setParticipant({ ...participant, whatsapp: w })
              }
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Qtde Ingressos
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: '#fff',
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={qtde}
              onChangeText={setQtde}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 16 },
    eventCard: {
        padding: 16,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        marginBottom: 20,
    },
    eventTitle: { fontSize: 20, fontWeight: 'bold' },
    eventDate: { fontSize: 14, marginTop: 4 },

    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderWidth: 1.5,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 16,
    },
    iconButton: {
        marginLeft: 8,
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        padding: 16,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        marginBottom: 30,
    },
    label: { fontSize: 14, fontWeight: '600', marginTop: 12 },
    value: { fontSize: 16, marginTop: 4 },

    saveButton: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
