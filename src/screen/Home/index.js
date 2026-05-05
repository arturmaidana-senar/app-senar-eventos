import React, { useState, useEffect, useMemo } from 'react';
import {
  Text,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Header from '../../components/Ui/Header';
import CardHome from '../../components/Ui/CardHome';
import DashboardBanner from '../../components/Ui/DashboardBanner';
import api from '../../services/endpont';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { InteractionManager } from 'react-native';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getEvents();

    const task = InteractionManager.runAfterInteractions(() => {
      requestPermissions();
    });

    return () => task.cancel();
  }, []);

  async function getEvents() {
    try {
      setLoading(true);
      const response = await api.getAllEvents();
      setEvents(response.data || []);
      setFilteredEvents(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = events.length;
    const now = new Date();
    let realizados = 0;
    let aguardando = 0;

    events.forEach(event => {
      const eventDate = new Date(event.ended_at || event.started_at);
      if (now > eventDate) {
        realizados++;
      } else {
        aguardando++;
      }
    });

    return { total, realizados, aguardando };
  }, [events]);

  async function requestPermissions() {
    try {
      const isAndroid = Platform.OS === 'android';

      const cameraPerm = isAndroid
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;
      const locationPerm = isAndroid
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      const audioPerm = isAndroid
        ? PERMISSIONS.ANDROID.RECORD_AUDIO
        : PERMISSIONS.IOS.MICROPHONE;

      const cameraStatus = await request(cameraPerm);
      const locationStatus = await request(locationPerm);
      const audioStatus = await request(audioPerm);

      if (
        cameraStatus === RESULTS.GRANTED &&
        locationStatus === RESULTS.GRANTED &&
        audioStatus === RESULTS.GRANTED
      ) {
        console.log('Todas as permissões foram concedidas!');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões: ', error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await getEvents();
    setRefreshing(false);
  };

  const renderEventItem = ({ item }) => <CardHome item={item} />;

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A9954" />
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <Header />

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={item =>
          item.id ? item.id.toString() : Math.random().toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A9954']}
          />
        }
        ListHeaderComponent={
          <>
            <DashboardBanner stats={stats} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos Eventos</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Nenhum evento encontrado para sua pesquisa'
                : 'Nenhum evento disponível no momento'}
            </Text>
          </View>
        }
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
  },
  loadingText: {
    marginTop: 12,
    color: '#6A737D',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A9954',
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8A8A8A',
    fontSize: 16,
    textAlign: 'center',
  },
});
