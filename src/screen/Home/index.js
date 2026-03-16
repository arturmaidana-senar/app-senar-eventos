import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import CardHome from '../../components/CardHome';
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
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function requestPermissions() {
    try {
      const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
      const locationPermission = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );
      const audioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);

      if (
        cameraPermission === RESULTS.GRANTED &&
        locationPermission === RESULTS.GRANTED &&
        audioPermission === RESULTS.GRANTED
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

  useEffect(() => {
    getEvents();
    requestPermissions();
  }, []);

  const renderEventItem = ({ item }) => <CardHome item={item} />;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A9954" />
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>Bem-vindo de volta!</Text>
              <Text style={styles.bannerSubtitle}>
                Descubra os próximos eventos
              </Text>
            </View>

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
    </SafeAreaView>
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
    paddingBottom: 20,
    paddingTop: 16,
  },
  banner: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3539',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A9954',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8A8A8A',
    fontSize: 15,
    textAlign: 'center',
  },
});
