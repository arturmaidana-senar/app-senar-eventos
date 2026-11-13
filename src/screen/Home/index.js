import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  InteractionManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CardHome from '../../components/Ui/CardHome';
import api from '../../services/endpont';

export default function Home() {
  const navigation = useNavigation();
  const listRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'aguardando' | 'realizados'
  const [viewMode, setViewMode] = useState('featured'); // 'featured' | 'compact'

  useEffect(() => {
    loadUser();
    getEvents();

    const task = InteractionManager.runAfterInteractions(() => {
      requestPermissions();
    });

    return () => task.cancel();
  }, []);

  async function loadUser() {
    try {
      const storageUser = await AsyncStorage.getItem('@eventUser');
      if (storageUser) {
        if (storageUser.includes('{')) {
          const parsedUser = JSON.parse(storageUser);
          const finalName =
            parsedUser.name ||
            parsedUser.nome ||
            parsedUser.user?.name ||
            parsedUser.user?.nome ||
            '';
          setUserName(finalName);
        } else {
          setUserName(storageUser);
        }
      }
    } catch (error) {
      console.error('Erro ao ler AsyncStorage na Home:', error);
    }
  }

  async function getEvents() {
    try {
      setLoading(true);
      const response = await api.getAllEvents();
      setEvents(response.data || []);
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

  const getFirstName = name => {
    if (!name) return 'Usuário';
    const first = name.trim().split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  };

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const stats = useMemo(() => {
    const total = events.length;
    const now = new Date();
    let realizados = 0;
    let aguardando = 0;

    events.forEach(event => {
      const eventDate = new Date(event.ended_at || event.started_at);
      if (!isNaN(eventDate.getTime()) && now > eventDate) {
        realizados++;
      } else {
        aguardando++;
      }
    });

    return { total, realizados, aguardando };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const filtered = events.filter(event => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (event.name || '').toLowerCase().includes(q);
        const matchLocation = (event.name_location || '')
          .toLowerCase()
          .includes(q);
        if (!matchName && !matchLocation) return false;
      }

      if (statusFilter !== 'all') {
        const eventDate = new Date(event.ended_at || event.started_at);
        const isRealizado = !isNaN(eventDate.getTime()) && now > eventDate;

        if (statusFilter === 'realizados' && !isRealizado) return false;
        if (statusFilter === 'aguardando' && isRealizado) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const aEnd = new Date(a.ended_at || a.started_at);
      const bEnd = new Date(b.ended_at || b.started_at);
      const aRealizado = !isNaN(aEnd.getTime()) && now > aEnd;
      const bRealizado = !isNaN(bEnd.getTime()) && now > bEnd;

      // Aguardando/em andamento primeiro, realizados depois
      if (aRealizado !== bRealizado) {
        return aRealizado ? 1 : -1;
      }

      const aStart = new Date(a.started_at || a.ended_at).getTime() || 0;
      const bStart = new Date(b.started_at || b.ended_at).getTime() || 0;

      // Aguardando: do dia mais próximo ao mais distante; Realizados: mais recente primeiro
      return aRealizado ? bStart - aStart : aStart - bStart;
    });
  }, [events, searchQuery, statusFilter]);

  const handleQuickCheckin = () => {
    if (events.length > 0) {
      navigation.navigate('Service', { eventId: events[0].id });
    } else {
      navigation.navigate('Event');
    }
  };

  const scrollToEvents = () => {
    listRef.current?.scrollToOffset({ offset: 470, animated: true });
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.breadcrumbRow}>
        <Text style={styles.breadcrumbMuted}>Senar Eventos</Text>
        <Text style={styles.breadcrumbSlash}> / </Text>
        <Text style={styles.breadcrumbActive}>Visão geral</Text>
      </View>

      <TouchableOpacity
        style={styles.avatarCircle}
        onPress={() => navigation.navigate('Information')}
        activeOpacity={0.8}
      >
        <Text style={styles.avatarText}>{getInitials(userName)}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderListHeader = () => (
    <View>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>
            CONEXÕES QUE CULTIVAM O FUTURO
          </Text>
        </View>

        <Text style={styles.greetingTitle}>
          Bom te ver por aqui, {getFirstName(userName)}.
        </Text>
        <Text style={styles.greetingSubtitle}>
          Novas experiências, conhecimento e oportunidades. Tudo em um só lugar.
        </Text>
      </View>

      {/* Hero Banner */}
      <LinearGradient
        colors={['#12261B', '#1B3B29', '#275438']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroDecorCircleOne} />
        <View style={styles.heroDecorCircleTwo} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroEyebrowRow}>
            <View style={styles.heroEyebrowDot} />
            <Text style={styles.heroEyebrow}>PERTO DE VOCÊ. JUNTO DO CAMPO.</Text>
          </View>

          <View style={styles.heroDotsRow}>
            <View style={styles.heroDotActive} />
            <View style={styles.heroDot} />
            <View style={styles.heroDot} />
          </View>
        </View>

        <Text style={styles.heroHeadline}>
          O campo conecta.{'\n'}O conhecimento{' '}
          <Text style={styles.heroHeadlineAccent}>transforma.</Text>
        </Text>

        <Text style={styles.heroSubtitle}>
          Encontros que inspiram. Experiências que ficam.
        </Text>

        <TouchableOpacity
          style={styles.heroCtaBtn}
          onPress={scrollToEvents}
          activeOpacity={0.85}
        >
          <Text style={styles.heroCtaText}>Encontre seu próximo evento</Text>
          <Feather name="arrow-right" size={16} color="#18221B" />
        </TouchableOpacity>

        <View style={styles.heroLocationRow}>
          <Feather name="map-pin" size={11} color="#B8DEC1" />
          <Text style={styles.heroLocationText}>Mato Grosso, nossa terra</Text>
        </View>
      </LinearGradient>

      {/* Check-in Quick Card */}
      <TouchableOpacity
        style={styles.checkinBanner}
        onPress={handleQuickCheckin}
        activeOpacity={0.85}
      >
        <View style={styles.checkinIconBox}>
          <Feather name="maximize" size={20} color="#315D3E" />
        </View>

        <View style={styles.checkinTextWrap}>
          <Text style={styles.checkinTitle}>
            Chegou no evento? Dê o próximo passo.
          </Text>
          <Text style={styles.checkinSubtitle}>
            Seu check-in em poucos segundos. Mais tempo para viver o encontro.
          </Text>
        </View>

        <View style={styles.checkinArrowBtn}>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Two-Column Stats */}
      <View style={styles.metricsRow}>
        <TouchableOpacity
          style={styles.metricItem}
          onPress={() =>
            setStatusFilter(prev =>
              prev === 'realizados' ? 'all' : 'realizados',
            )
          }
          activeOpacity={0.75}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#EDF1E7' }]}>
            <Feather name="check-circle" size={16} color="#58705C" />
          </View>
          <View style={styles.metricTextWrap}>
            <Text style={styles.metricLabel}>Experiências vividas</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>
                {String(stats.realizados).padStart(2, '0')}
              </Text>
              <Text style={styles.metricUnit}>eventos realizados</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.metricDivider} />

        <TouchableOpacity
          style={styles.metricItem}
          onPress={() =>
            setStatusFilter(prev =>
              prev === 'aguardando' ? 'all' : 'aguardando',
            )
          }
          activeOpacity={0.75}
        >
          <View style={[styles.metricIconBox, { backgroundColor: '#F7F1E3' }]}>
            <Feather name="clock" size={16} color="#B8862D" />
          </View>
          <View style={styles.metricTextWrap}>
            <Text style={styles.metricLabel}>O que vem por aí</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>
                {String(stats.aguardando).padStart(2, '0')}
              </Text>
              <Text style={styles.metricUnit}>eventos esperando</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionDivider} />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Text style={styles.sectionEyebrow}>APRENDA. CONECTE. PARTICIPE.</Text>
          <Text style={styles.sectionTitle}>Seu próximo grande encontro</Text>
        </View>

        <TouchableOpacity
          style={styles.circleArrowBtn}
          onPress={() => navigation.navigate('Event')}
          activeOpacity={0.8}
        >
          <Feather name="arrow-right" size={16} color="#4E5D52" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('all')}
          activeOpacity={0.8}
        >
          <Feather
            name="grid"
            size={13}
            color={statusFilter === 'all' ? '#2F5E38' : '#7A867C'}
          />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            Todos ({stats.total})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'aguardando' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('aguardando')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'aguardando' && styles.filterChipTextActive,
            ]}
          >
            Aguardando
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'realizados' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('realizados')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'realizados' && styles.filterChipTextActive,
            ]}
          >
            Realizados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search + View Toggle */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputBox}>
          <Feather name="search" size={16} color="#8D988E" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar evento..."
            placeholderTextColor="#9BA69C"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={16} color="#9BA69C" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.viewToggleBox}>
          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === 'featured' && styles.viewToggleBtnActive,
            ]}
            onPress={() => setViewMode('featured')}
            activeOpacity={0.8}
          >
            <Feather
              name="grid"
              size={16}
              color={viewMode === 'featured' ? '#2F5E38' : '#8D988E'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === 'compact' && styles.viewToggleBtnActive,
            ]}
            onPress={() => setViewMode('compact')}
            activeOpacity={0.8}
          >
            <Feather
              name="list"
              size={16}
              color={viewMode === 'compact' ? '#2F5E38' : '#8D988E'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} barStyle="dark-content" backgroundColor="#F6F7F2" />
        {renderTopBar()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#315D3E" />
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} barStyle="dark-content" backgroundColor="#F6F7F2" />
      {renderTopBar()}

      <FlatList
        ref={listRef}
        data={filteredEvents}
        renderItem={({ item }) => <CardHome item={item} variant={viewMode} />}
        keyExtractor={item =>
          item.id ? item.id.toString() : Math.random().toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#315D3E']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={30} color="#8D988E" />
            <Text style={styles.emptyTitle}>Nenhum evento encontrado</Text>
            <Text style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all'
                ? 'Tente ajustar a busca ou limpar os filtros.'
                : 'Não há eventos disponíveis no momento.'}
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
    backgroundColor: '#F6F7F2',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EDE3',
    backgroundColor: '#F6F7F2',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbMuted: {
    fontSize: 13,
    color: '#8C978C',
    fontWeight: '500',
  },
  breadcrumbSlash: {
    fontSize: 13,
    color: '#B8C1B7',
  },
  breadcrumbActive: {
    fontSize: 13,
    color: '#18221B',
    fontWeight: '700',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF1E4',
    borderWidth: 1,
    borderColor: '#DCE5D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2F5E38',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 125,
  },
  greetingSection: {
    marginBottom: 12,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#699B4E',
    marginRight: 7,
  },
  eyebrowText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#7C8A78',
    letterSpacing: 1.1,
  },
  greetingTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 3,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#6B776D',
    lineHeight: 17,
  },
  heroCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  heroDecorCircleOne: {
    position: 'absolute',
    top: -35,
    right: -25,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(217, 237, 142, 0.1)',
  },
  heroDecorCircleTwo: {
    position: 'absolute',
    bottom: -40,
    left: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroEyebrowDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D9ED8E',
    marginRight: 6,
  },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: '#CBE1CF',
    letterSpacing: 1,
  },
  heroDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroDotActive: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9ED8E',
  },
  heroDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroHeadline: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  heroHeadlineAccent: {
    color: '#D9ED8E',
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: '#D3E6D7',
    marginBottom: 12,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D9ED8E',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 8,
    marginBottom: 8,
  },
  heroCtaText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#18221B',
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  heroLocationText: {
    fontSize: 10,
    color: '#C3DEC9',
  },
  checkinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF3E8',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E9D7',
    marginBottom: 18,
  },
  checkinIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2EAD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkinTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  checkinTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 3,
  },
  checkinSubtitle: {
    fontSize: 11,
    color: '#6B776D',
    lineHeight: 15,
  },
  checkinArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#315D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metricTextWrap: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#7A867C',
    marginBottom: 2,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18221B',
  },
  metricUnit: {
    fontSize: 10,
    color: '#7A867C',
    flexShrink: 1,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E3E7DD',
    marginHorizontal: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E9EDE3',
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  sectionEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C978C',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18221B',
    lineHeight: 25,
  },
  circleArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E7DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#EBF1E4',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A867C',
  },
  filterChipTextActive: {
    color: '#2F5E38',
    fontWeight: '700',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E7DD',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#18221B',
    fontSize: 13,
  },
  viewToggleBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E7DD',
    padding: 4,
    gap: 4,
  },
  viewToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggleBtnActive: {
    backgroundColor: '#EBF1E4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B776D',
    fontSize: 15,
  },
  emptyContainer: {
    paddingVertical: 44,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18221B',
    marginTop: 10,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#7A867C',
    textAlign: 'center',
  },
});
