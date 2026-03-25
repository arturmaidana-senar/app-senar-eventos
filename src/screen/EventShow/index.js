import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native'; // ← Text adicionado
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { setHeaderOptions } from '../../components/Ui/HeaderTitle';
import api from '../../services/endpont';
import EventDetailView from '../../components/Ui/EventDetailView';
import { EventTheme } from '../../components/Ui/EventTheme';

export default function EventShow() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchEvent() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getEvent(eventId);

      if (response && response.data) {
        setEvent(response.data);
      } else {
        throw new Error('Dados do evento não encontrados');
      }
    } catch (err) {
      console.error('Erro ao carregar evento:', err);
      setError('Não foi possível carregar os dados do evento');
    } finally {
      setLoading(false);
    }
  }

  // ← Alert movido para useEffect, reage à mudança do estado error
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar os dados do evento. Tente novamente.',
        [
          { text: 'Tentar Novamente', onPress: fetchEvent },
          { text: 'Voltar', onPress: () => navigation.goBack() },
        ],
      );
    }
  }, [error]);

  useEffect(() => {
    setHeaderOptions(navigation, {
      headerTitle: 'Detalhes do Evento',
      headerTitleStyle: {
        fontFamily: EventTheme.typography.fontFamily.bold,
        fontSize: EventTheme.typography.fontSize.lg,
        color: EventTheme.colors.gray[900],
        fontWeight: EventTheme.typography.fontWeight.bold,
      },
      headerTintColor: EventTheme.colors.gray[900],
      headerStyle: {
        backgroundColor: EventTheme.colors.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: EventTheme.colors.gray[200],
      },
    });

    if (eventId) {
      fetchEvent();
    } else {
      setError('ID do evento não fornecido');
      setLoading(false);
    }
  }, [navigation, eventId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={EventTheme.colors.primary[500]}
        />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Evento não encontrado'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EventDetailView
        event={event}
        imageBaseUrl="https://eventos.senarmt.org.br/storage/"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: EventTheme.colors.gray[50],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: EventTheme.colors.gray[50],
    paddingHorizontal: EventTheme.spacing.lg,
  },
  errorText: {
    fontSize: EventTheme.typography.fontSize.base,
    color: EventTheme.colors.error[600],
    textAlign: 'center',
    lineHeight:
      EventTheme.typography.lineHeight.normal *
      EventTheme.typography.fontSize.base,
  },
});
