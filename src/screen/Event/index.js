import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  MoreHorizontal,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Calendar,
  Check,
  Search,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/endpont';

const MONTHS_SHORT = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
];

const MONTHS_CAP = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const IMAGE_BASE_URL = 'https://eventos.senarmt.org.br/storage/';

function EventManagementCard({
  item,
  isFeatured,
  checkins = [],
  onPress,
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item?.image]);

  const now = new Date();
  const start = item?.started_at
    ? new Date(item.started_at.replace(' ', 'T'))
    : null;
  const end = item?.ended_at
    ? new Date(item.ended_at.replace(' ', 'T'))
    : start;

  const validStart = start && !isNaN(start.getTime());
  const validEnd = end && !isNaN(end.getTime());

  const isActive =
    validStart && validEnd && now >= start && now <= end;
  const isFinished = validEnd && now > end;

  const status = isActive
    ? { label: 'EM ANDAMENTO', dot: '#318C5A', text: '#1E4627', bg: '#EBF5EE' }
    : isFinished
      ? { label: 'FINALIZADO', dot: '#6E786F', text: '#465248', bg: '#ECEFE9' }
      : { label: 'PRÓXIMO', dot: '#C27803', text: '#8C5600', bg: '#FEF5E4' };

  const day = validStart ? String(start.getDate()).padStart(2, '0') : '--';
  const month = validStart ? MONTHS_SHORT[start.getMonth()] : 'EVT';

  const formatTimeRange = () => {
    if (!validStart) return 'Horário a definir';
    const sTime = `${String(start.getHours()).padStart(2, '0')}:${String(
      start.getMinutes(),
    ).padStart(2, '0')}`;
    if (!validEnd) return sTime;
    const eTime = `${String(end.getHours()).padStart(2, '0')}:${String(
      end.getMinutes(),
    ).padStart(2, '0')}`;
    return `${sTime} — ${eTime}`;
  };

  const hasCover = Boolean(
    item?.image && String(item.image).trim().length > 0 && !imageError,
  );

  const capacity = Number(item?.number_max) || 0;
  const checkinCount = checkins.length;
  const progressPct =
    capacity > 0 ? Math.min(100, Math.round((checkinCount / capacity) * 100)) : 0;

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Cover */}
      <View style={styles.coverBox}>
        {hasCover ? (
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${item.image}` }}
            style={styles.coverImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={
              isFinished
                ? ['#4A564D', '#38423B', '#2C342E']
                : ['#2E5F40', '#234C32', '#1B3B27']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverGradient}
          >
            <View style={styles.coverDecorBarOne} />
            <View style={styles.coverDecorBarTwo} />
          </LinearGradient>
        )}

        <View style={styles.coverTopRow}>
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>

          <View style={styles.coverMoreBtn}>
            <MoreHorizontal size={16} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.coverDateRow}>
          <Text style={styles.coverDateDay}>{day}</Text>
          <Text style={styles.coverDateMonth}>{month}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardEyebrow}>
          {isFeatured ? 'EVENTO PRINCIPAL' : 'EVENTO SENAR-MT'}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item?.name || 'Evento Senar'}
        </Text>

        <View style={styles.metaRow}>
          <MapPin size={13} color="#7A847B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {item?.name_location || 'Local a definir'}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Clock size={13} color="#7A847B" />
          <Text style={styles.metaText}>{formatTimeRange()}</Text>
        </View>

        {isFeatured && capacity > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progresso do check-in</Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progressPct}%` }]}
              />
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          {isFeatured && checkinCount > 0 ? (
            <View style={styles.avatarStackRow}>
              {checkins.slice(0, 3).map((c, idx) => (
                <View
                  key={`${c.participant_id}-${idx}`}
                  style={[
                    styles.miniAvatar,
                    idx > 0 && styles.miniAvatarOverlap,
                  ]}
                >
                  <Text style={styles.miniAvatarText}>
                    {getInitials(c.name_participante)}
                  </Text>
                </View>
              ))}
              {checkinCount > 3 && (
                <Text style={styles.extraCountText}>
                  +{checkinCount - 3}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.footerCapacityText}>
              {capacity > 0 ? `${capacity} vagas` : 'Gestão de presença'}
            </Text>
          )}

          <View style={styles.detailsLinkRow}>
            <Text style={styles.detailsLinkText}>Ver detalhes</Text>
            <ArrowRight size={15} color="#2F5E38" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Event() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState([]);
  const [featuredCheckins, setFeaturedCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'upcoming' | 'finished'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCurrentMonth, setFilterCurrentMonth] = useState(false);

  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = MONTHS_CAP[currentMonthIndex];

  const getEventCategory = useCallback(event => {
    const now = new Date();
    const start = event?.started_at
      ? new Date(event.started_at.replace(' ', 'T'))
      : null;
    const end = event?.ended_at
      ? new Date(event.ended_at.replace(' ', 'T'))
      : start;
    const validStart = start && !isNaN(start.getTime());
    const validEnd = end && !isNaN(end.getTime());

    if (validStart && validEnd && now >= start && now <= end) return 'active';
    if (validEnd && now > end) return 'finished';
    return 'upcoming';
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.getUserEvents();
      const list = Array.isArray(response?.data) ? response.data : [];
      setEvents(list);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const counts = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let finished = 0;

    events.forEach(ev => {
      const cat = getEventCategory(ev);
      if (cat === 'active') active++;
      else if (cat === 'upcoming') upcoming++;
      else finished++;
    });

    return {
      all: events.length,
      active,
      upcoming,
      finished,
    };
  }, [events, getEventCategory]);

  const sortedEvents = useMemo(() => {
    const order = { active: 0, upcoming: 1, finished: 2 };
    return [...events].sort((a, b) => {
      const catA = getEventCategory(a);
      const catB = getEventCategory(b);
      if (order[catA] !== order[catB]) return order[catA] - order[catB];

      const timeA = new Date(
        (a.started_at || a.ended_at || '').replace(' ', 'T'),
      ).getTime();
      const timeB = new Date(
        (b.started_at || b.ended_at || '').replace(' ', 'T'),
      ).getTime();

      if (catA === 'finished') return (timeB || 0) - (timeA || 0);
      return (timeA || 0) - (timeB || 0);
    });
  }, [events, getEventCategory]);

  const featuredEvent = useMemo(() => {
    return (
      sortedEvents.find(ev => getEventCategory(ev) !== 'finished') ||
      sortedEvents[0] ||
      null
    );
  }, [sortedEvents, getEventCategory]);

  useEffect(() => {
    if (!featuredEvent?.id) {
      setFeaturedCheckins([]);
      return;
    }
    api
      .getListEventCheckin(featuredEvent.id)
      .then(res => setFeaturedCheckins(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setFeaturedCheckins([]));
  }, [featuredEvent?.id]);

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter(ev => {
      if (statusFilter !== 'all' && getEventCategory(ev) !== statusFilter) {
        return false;
      }

      if (filterCurrentMonth && ev.started_at) {
        const d = new Date(ev.started_at.replace(' ', 'T'));
        if (!isNaN(d.getTime()) && d.getMonth() !== currentMonthIndex) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = ev.name?.toLowerCase().includes(q);
        const matchLoc = ev.name_location?.toLowerCase().includes(q);
        if (!matchName && !matchLoc) return false;
      }

      return true;
    });
  }, [
    sortedEvents,
    statusFilter,
    filterCurrentMonth,
    currentMonthIndex,
    searchQuery,
    getEventCategory,
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
  };

  const finishedPct =
    counts.all > 0 ? Math.round((counts.finished / counts.all) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} barStyle="dark-content" backgroundColor="#F6F7F2" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 104 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2F5E38']}
            tintColor="#2F5E38"
          />
        }
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.eyebrow}>GESTÃO DE EVENTOS</Text>
            <Text style={styles.pageTitle}>Meus eventos</Text>
            <Text style={styles.pageSubtitle}>
              Acompanhe seus eventos ativos, próximos encontros e resultados
              recentes.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshSquareBtn}
            onPress={onRefresh}
            activeOpacity={0.85}
          >
            <RefreshCw size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 3 Real KPI Metric Cards */}
        <View style={styles.kpiStack}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EDF1E6' }]}>
              <Calendar size={18} color="#2F5E38" />
            </View>
            <View style={styles.kpiMiddle}>
              <Text style={styles.kpiLabel}>Total de eventos</Text>
              <Text style={styles.kpiValue}>{counts.all}</Text>
            </View>
            <Text style={styles.kpiHint}>
              {counts.active} em andamento
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EDF1E6' }]}>
              <Clock size={18} color="#2F5E38" />
            </View>
            <View style={styles.kpiMiddle}>
              <Text style={styles.kpiLabel}>Próximos e ativos</Text>
              <Text style={styles.kpiValue}>
                {counts.active + counts.upcoming}
              </Text>
            </View>
            <Text style={styles.kpiHint}>
              {counts.upcoming} agendado{counts.upcoming === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FEF5E4' }]}>
              <Check size={18} color="#B8862D" />
            </View>
            <View style={styles.kpiMiddle}>
              <Text style={styles.kpiLabel}>Eventos finalizados</Text>
              <Text style={styles.kpiValue}>{counts.finished}</Text>
            </View>
            <Text style={styles.kpiHint}>{finishedPct}% concluídos</Text>
          </View>
        </View>

        {/* Filter & List Container Card */}
        <View style={styles.listContainerCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsRow}
          >
            {[
              { key: 'all', label: 'Todos', count: counts.all },
              { key: 'active', label: 'Em andamento', count: counts.active },
              { key: 'upcoming', label: 'Próximos', count: counts.upcoming },
              { key: 'finished', label: 'Finalizados', count: counts.finished },
            ].map(tab => {
              const active = statusFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterTab, active && styles.filterTabActive]}
                  onPress={() => setStatusFilter(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      active && styles.filterTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  <Text
                    style={[
                      styles.filterTabCount,
                      active && styles.filterTabCountActive,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={16} color="#8D968E" />
              <TextInput
                placeholder="Buscar evento..."
                placeholderTextColor="#8D968E"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.monthBtn,
                filterCurrentMonth && styles.monthBtnActive,
              ]}
              onPress={() => setFilterCurrentMonth(prev => !prev)}
              activeOpacity={0.8}
            >
              <Calendar
                size={15}
                color={filterCurrentMonth ? '#2F5E38' : '#6E786F'}
              />
              <Text
                style={[
                  styles.monthBtnText,
                  filterCurrentMonth && styles.monthBtnTextActive,
                ]}
              >
                {filterCurrentMonth ? currentMonthName : 'Mês'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerLine} />

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#2F5E38" />
              <Text style={styles.loadingText}>Carregando eventos...</Text>
            </View>
          ) : filteredEvents.length > 0 ? (
            <View style={styles.cardsStack}>
              {filteredEvents.map(item => (
                <EventManagementCard
                  key={String(item.id)}
                  item={item}
                  isFeatured={item.id === featuredEvent?.id}
                  checkins={
                    item.id === featuredEvent?.id ? featuredCheckins : []
                  }
                  onPress={() =>
                    navigation.navigate('Service', { eventId: item.id })
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={24} color="#7A847B" />
              <Text style={styles.emptyTitle}>Nenhum evento encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Tente limpar os filtros ou atualizar a lista.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 68,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18221B',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#6E786F',
  },
  refreshSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#3F7652',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#1E462D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  kpiStack: {
    gap: 12,
    marginBottom: 18,
  },
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    gap: 14,
  },
  kpiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiMiddle: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6E786F',
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#18221B',
  },
  kpiHint: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2F5E38',
  },
  listContainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  filterTabsRow: {
    gap: 6,
    marginBottom: 14,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterTabActive: {
    backgroundColor: '#EDF4EA',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7A847B',
  },
  filterTabTextActive: {
    color: '#2F5E38',
    fontWeight: '700',
  },
  filterTabCount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9AA39B',
  },
  filterTabCountActive: {
    color: '#2F5E38',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAF6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#18221B',
  },
  monthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  monthBtnActive: {
    backgroundColor: '#EDF4EA',
    borderColor: '#2F5E38',
  },
  monthBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6E786F',
  },
  monthBtnTextActive: {
    color: '#2F5E38',
    fontWeight: '700',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#EFF2EB',
    marginVertical: 16,
  },
  cardsStack: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    overflow: 'hidden',
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  coverBox: {
    height: 142,
    position: 'relative',
    justifyContent: 'space-between',
    padding: 14,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  coverDecorBarOne: {
    position: 'absolute',
    right: 26,
    bottom: -16,
    width: 18,
    height: 92,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    transform: [{ rotate: '-18deg' }],
  },
  coverDecorBarTwo: {
    position: 'absolute',
    right: 2,
    bottom: -24,
    width: 18,
    height: 76,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ rotate: '-18deg' }],
  },
  coverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  coverMoreBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverDateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  coverDateDay: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  coverDateMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.88)',
    letterSpacing: 0.8,
  },
  cardBody: {
    padding: 16,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 10,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },
  metaText: {
    flex: 1,
    fontSize: 12.5,
    color: '#6E786F',
  },
  progressSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFF2EB',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6E786F',
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '800',
    color: '#18221B',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EDF1E6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#589C68',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFF2EB',
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E3EFE6',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarOverlap: {
    marginLeft: -8,
  },
  miniAvatarText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2F5E38',
  },
  extraCountText: {
    marginLeft: 6,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7A847B',
  },
  footerCapacityText: {
    fontSize: 12,
    color: '#7A847B',
    fontWeight: '500',
  },
  detailsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailsLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F5E38',
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13.5,
    color: '#6E786F',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18221B',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#6E786F',
    textAlign: 'center',
  },
});
