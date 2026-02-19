import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import api from '../../services/endpont';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export default function Credential() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params;

  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState(null);
  const [qtde, setQtde] = useState('');

  // busca dados
  const handleSearch = async () => {
    if (cpf.replace(/\D/g, '').length !== 11) {
      return Alert.alert('CPF inválido', 'Informe um CPF com 11 dígitos.');
    }
    setLoading(true);
    try {
      const resp = await api.searchCredential(eventId, cpf);
      console.log(resp.data.whatsapp);
      setParticipant(resp.data);
      setQtde(String(resp.data.qtde_remaining));
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.message || 'Falha na busca');
      setParticipant(null);
    } finally {
      setLoading(false);
    }
  };

  // grava credenciamento
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
      console.log(payload);
      const resp = await api.createCredential(eventId, payload);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Sucesso',
        textBody: resp.data.message,
        button: 'Fechar',
      });
      // opcional: redirecionar para impressão
      if (resp.data.print_route) {
        // abrir WebView ou Linking.openURL(resp.data.print_route)
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        'Erro',
        err.response?.data?.message || 'Falha ao gravar credenciamento.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Campo CPF */}
      <View style={styles.row}>
        <TextInput
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
          style={[styles.input, { borderColor: colors.border }]}
          maxLength={14}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
          <Icon name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Exibe dados se encontrado */}
      {participant && (
        <View style={styles.card}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{participant.name}</Text>

          <Text style={styles.label}>WhatsApp:</Text>
          <TextInput
            style={styles.input}
            value={participant.whatsapp}
            onChangeText={w => setParticipant({ ...participant, whatsapp: w })}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Qtde Ingressos:</Text>
          <TextInput
            style={styles.input}
            value={qtde}
            onChangeText={setQtde}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    color: '#000'
  },
  iconButton: { marginLeft: 8, padding: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    elevation: 2,
  },
  label: { fontWeight: 'bold', marginTop: 8},
  value: { marginBottom: 4 },
  saveButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600' },
});
