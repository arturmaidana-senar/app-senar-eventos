import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  InteractionManager,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/endpont';

const WEEKDAYS = [
  'Domingo',
  'Segunda-Feira',
  'Terça-Feira',
  'Quarta-Feira',
  'Quinta-Feira',
  'Sexta-Feira',
  'Sábado',
];

const MONTHS_FULL_CAP = [
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

export default function Home() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState([]);
  const [featuredCheckins, setFeaturedCheckins] = useState([]);
  const [featuredParticipants, setFeaturedParticipants] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllAgenda, setShowAllAgenda] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantTab, setParticipantTab] = useState('todos'); // 'todos' | 'confirmados' | 'aguardando'

  const loadUser = useCallback(async () => {
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
  }, []);

  const requestPermissions = useCallback(async () => {
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
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => {
        const endRef = new Date(
          (event.ended_at || event.started_at || '').replace(' ', 'T'),
        );
        return isNaN(endRef.getTime()) || endRef >= now;
      })
      .sort((a, b) => {
        const nowTs = now.getTime();
        const startA = new Date((a.started_at || '').replace(' ', 'T')).getTime();
        const endA = new Date(
          (a.ended_at || a.started_at || '').replace(' ', 'T'),
        ).getTime();
        const startB = new Date((b.started_at || '').replace(' ', 'T')).getTime();
        const endB = new Date(
          (b.ended_at || b.started_at || '').replace(' ', 'T'),
        ).getTime();

        const activeA = nowTs >= startA && nowTs <= endA ? 0 : 1;
        const activeB = nowTs >= startB && nowTs <= endB ? 0 : 1;
        if (activeA !== activeB) return activeA - activeB;

        return (startA || 0) - (startB || 0);
      });
  }, [events]);

  const featuredEvent = upcomingEvents[0] || null;

  const fetchFeaturedCheckins = useCallback(async eventId => {
    if (!eventId) {
      setFeaturedCheckins([]);
      setFeaturedParticipants([]);
      return;
    }

    let cachedList = [];
    try {
      await AsyncStorage.setItem('@activeEventId', String(eventId));
      const raw = await AsyncStorage.getItem(`@recentCheckins_${eventId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cachedList = parsed;
      }
    } catch {}

    const [checkinRes, participantsRes] = await Promise.allSettled([
      api.getListEventCheckin(eventId),
      api.getEventParticipants(eventId),
    ]);

    if (checkinRes.status === 'fulfilled') {
      const serverList = Array.isArray(checkinRes.value?.data)
        ? checkinRes.value.data
        : [];
      if (serverList.length > 0) {
        const serverNames = new Set(
          serverList.map(i => (i.name_participante || '').trim().toLowerCase()),
        );
        const pendingLocal = cachedList.filter(
          c => !serverNames.has((c.name_participante || '').trim().toLowerCase()),
        );
        setFeaturedCheckins([...pendingLocal, ...serverList]);
      } else {
        setFeaturedCheckins(cachedList);
      }
    } else {
      setFeaturedCheckins(cachedList);
    }

    if (participantsRes.status === 'fulfilled') {
      const list = Array.isArray(participantsRes.value)
        ? participantsRes.value
        : Array.isArray(participantsRes.value?.data)
        ? participantsRes.value.data
        : [];
      setFeaturedParticipants(list);
    } else {
      setFeaturedParticipants([]);
    }
  }, []);

  const getEvents = useCallback(async () => {
    try {
      const response = await api.getUserEvents();
      const list = Array.isArray(response?.data) ? response.data : [];
      setEvents(list);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    getEvents();

    const task = InteractionManager.runAfterInteractions(() => {
      requestPermissions();
    });

    return () => task.cancel();
  }, [getEvents, loadUser, requestPermissions]);

  useEffect(() => {
    if (featuredEvent?.id) {
      fetchFeaturedCheckins(featuredEvent.id);
    } else {
      setFeaturedCheckins([]);
    }
  }, [featuredEvent?.id, fetchFeaturedCheckins]);

  useFocusEffect(
    useCallback(() => {
      if (featuredEvent?.id) {
        fetchFeaturedCheckins(featuredEvent.id);
      }
    }, [featuredEvent?.id, fetchFeaturedCheckins]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getEvents();
    if (featuredEvent?.id) {
      await fetchFeaturedCheckins(featuredEvent.id);
    }
    setRefreshing(false);
  };

  const getFirstName = name => {
    if (!name) return 'Organizador';
    const first = name.trim().split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  };

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTodayHeader = () => {
    const today = new Date();
    const weekday = WEEKDAYS[today.getDay()];
    const day = String(today.getDate()).padStart(2, '0');
    const month = MONTHS_FULL_CAP[today.getMonth()];
    return `${weekday}, ${day} De ${month}`;
  };

  const formatTimeRange = (startStr, endStr) => {
    if (!startStr) return 'Horário a definir';
    const s = new Date(startStr.replace(' ', 'T'));
    if (isNaN(s.getTime())) return 'Horário a definir';
    const sTime = `${String(s.getHours()).padStart(2, '0')}:${String(
      s.getMinutes(),
    ).padStart(2, '0')}`;
    if (!endStr) return sTime;
    const e = new Date(endStr.replace(' ', 'T'));
    if (isNaN(e.getTime())) return sTime;
    const eTime = `${String(e.getHours()).padStart(2, '0')}:${String(
      e.getMinutes(),
    ).padStart(2, '0')}`;
    return `${sTime} — ${eTime}`;
  };

  const formatShortTime = dateStr => {
    if (!dateStr) return '—';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '—';
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes(),
    ).padStart(2, '0')}`;
  };

  const getDateParts = dateStr => {
    const d = new Date((dateStr || '').replace(' ', 'T'));
    if (isNaN(d.getTime())) return { day: '--', month: '---' };
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: MONTHS_SHORT[d.getMonth()] || '---',
    };
  };

  const isEventActive = event => {
    if (!event?.started_at) return false;
    const now = new Date().getTime();
    const start = new Date(event.started_at.replace(' ', 'T')).getTime();
    const end = new Date(
      (event.ended_at || event.started_at).replace(' ', 'T'),
    ).getTime();
    return now >= start && now <= end;
  };

  const lastHourCount = useMemo(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return featuredCheckins.filter(item => {
      if (!item.started_at) return false;
      const t = new Date(item.started_at.replace(' ', 'T')).getTime();
      return !isNaN(t) && t >= oneHourAgo;
    }).length;
  }, [featuredCheckins]);

  const maskCpf = cpf => {
    if (!cpf) return '';
    const digits = String(cpf).replace(/\D/g, '');
    if (digits.length === 11) {
      return `•••.${digits.slice(3, 6)}.•••-${digits.slice(9, 11)}`;
    }
    return String(cpf);
  };

  const mergedParticipants = useMemo(() => {
    const checkinById = new Map();
    const checkinByName = new Map();

    featuredCheckins.forEach(c => {
      if (c.participant_id) checkinById.set(String(c.participant_id), c);
      if (c.name_participante) {
        checkinByName.set(c.name_participante.trim().toLowerCase(), c);
      }
    });

    const seenNames = new Set();
    const fromEnrolled = featuredParticipants.map(p => {
      const keyName = (p.name || '').trim().toLowerCase();
      if (keyName) seenNames.add(keyName);
      const matched =
        checkinById.get(String(p.id)) || checkinByName.get(keyName);
      const isConfirmed = Boolean(
        matched || Number(p.credential) === 1 || p.date_time_credential,
      );
      return {
        id: p.id,
        name: p.name || 'Participante',
        subtitle: p.cpf
          ? maskCpf(p.cpf)
          : p.participant_type_name || 'Inscrito',
        cpf: p.cpf || '',
        confirmed: isConfirmed,
        checkinTime: matched?.started_at || p.date_time_credential || null,
      };
    });

    const extraCheckins = featuredCheckins
      .filter(c => {
        const keyName = (c.name_participante || '').trim().toLowerCase();
        return keyName && !seenNames.has(keyName);
      })
      .map((c, idx) => ({
        id: c.participant_id || `checkin-${idx}`,
        name: c.name_participante || 'Participante',
        subtitle: c.user_create || 'Check-in realizado',
        cpf: '',
        confirmed: true,
        checkinTime: c.started_at || null,
      }));

    return [...extraCheckins, ...fromEnrolled];
  }, [featuredCheckins, featuredParticipants]);

  const filteredParticipants = useMemo(() => {
    let base = mergedParticipants;
    if (participantTab === 'confirmados') {
      base = base.filter(p => p.confirmed);
    } else if (participantTab === 'aguardando') {
      base = base.filter(p => !p.confirmed);
    }

    const term = participantSearch.trim().toLowerCase();
    if (term) {
      base = base.filter(
        p =>
          p.name?.toLowerCase().includes(term) ||
          p.cpf?.toLowerCase().includes(term),
      );
    }
    return base.slice(0, 6);
  }, [mergedParticipants, participantSearch, participantTab]);

  const featuredProgress = useMemo(() => {
    const enrolledTotal = mergedParticipants.length;
    const confirmedTotal = mergedParticipants.filter(p => p.confirmed).length;

    if (enrolledTotal > 0) {
      const pct = Math.min(
        100,
        Math.round((confirmedTotal / enrolledTotal) * 100),
      );
      const waiting = Math.max(0, enrolledTotal - confirmedTotal);
      return {
        presentes: confirmedTotal,
        capacidade: enrolledTotal,
        restantes: waiting,
        pct,
        hasCapacity: true,
        hasEnrolled: true,
      };
    }

    const presentes = featuredCheckins.length;
    const capacidade = Number(featuredEvent?.number_max) || 0;
    if (capacidade > 0) {
      const pct = Math.min(100, Math.round((presentes / capacidade) * 100));
      const restantes = Math.max(0, capacidade - presentes);
      return {
        presentes,
        capacidade,
        restantes,
        pct,
        hasCapacity: true,
        hasEnrolled: false,
      };
    }
    return {
      presentes,
      capacidade: 0,
      restantes: 0,
      pct: 0,
      hasCapacity: false,
      hasEnrolled: false,
    };
  }, [featuredCheckins.length, featuredEvent?.number_max, mergedParticipants]);

  const visibleAgenda = showAllAgenda
    ? upcomingEvents
    : upcomingEvents.slice(0, 4);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar hidden={true} barStyle="dark-content" backgroundColor="#F6F7F2" />
        <ActivityIndicator size="large" color="#2F5E38" />
        <Text style={styles.loadingText}>Carregando painel...</Text>
      </View>
    );
  }

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
        {/* Top Greeting Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.dateSubtitle}>{formatTodayHeader()}</Text>
            <Text style={styles.greetingTitle}>
              Olá, {getFirstName(userName)}!
            </Text>
            <Text style={styles.welcomeSubtitle}>Bem-vindo de volta.</Text>
          </View>

          <TouchableOpacity
            style={styles.profileSquareBtn}
            onPress={() => navigation.navigate('Information')}
            activeOpacity={0.8}
          >
            <Feather name="user" size={18} color="#2F5E38" />
          </TouchableOpacity>
        </View>

        {/* Hero Featured Event Card */}
        {featuredEvent ? (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() =>
              navigation.navigate('Service', { eventId: featuredEvent.id })
            }
          >
            <LinearGradient
              colors={['#2C5B3D', '#214830', '#183724']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroDecorCircleOne} />
              <View style={styles.heroDecorCircleTwo} />

              <View style={styles.heroEyebrowRow}>
                <View style={styles.heroEyebrowDot} />
                <Text style={styles.heroEyebrow}>
                  {isEventActive(featuredEvent)
                    ? 'OPERAÇÃO EM ANDAMENTO'
                    : 'PRÓXIMO EVENTO'}
                </Text>
              </View>

              <Text style={styles.heroTitle} numberOfLines={2}>
                {featuredEvent.name}
              </Text>
              <Text style={styles.heroSubtitle}>
                Acompanhe o credenciamento em tempo real e mantenha sua equipe
                sincronizada.
              </Text>

              <View style={styles.heroMetaRow}>
                <Feather name="map-pin" size={13} color="#C7DEC9" />
                <Text style={styles.heroMetaText} numberOfLines={1}>
                  {featuredEvent.name_location || 'Local a definir'}
                </Text>
              </View>

              <View style={styles.heroMetaRow}>
                <Feather name="clock" size={13} color="#C7DEC9" />
                <Text style={styles.heroMetaText}>
                  {formatTimeRange(
                    featuredEvent.started_at,
                    featuredEvent.ended_at,
                  )}
                </Text>
              </View>

              {/* Inner Progress / Stats Box */}
              <View style={styles.progressBox}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    Progresso do check-in
                  </Text>
                  <Text style={styles.progressPct}>
                    {featuredProgress.hasCapacity
                      ? `${featuredProgress.pct}%`
                      : `${featuredProgress.presentes}`}
                  </Text>
                </View>

                {featuredProgress.hasCapacity && (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${featuredProgress.pct}%` },
                      ]}
                    />
                  </View>
                )}

                <View style={styles.statsColumns}>
                  <View style={styles.statCol}>
                    <Text style={styles.statNumber}>
                      {featuredProgress.presentes}
                    </Text>
                    <Text style={styles.statLabel}>presentes</Text>
                  </View>

                  {featuredProgress.hasCapacity && (
                    <>
                      <View style={styles.statColDivider} />
                      <View style={styles.statCol}>
                        <Text style={styles.statNumber}>
                          {featuredProgress.capacidade}
                        </Text>
                        <Text style={styles.statLabel}>
                          {featuredProgress.hasEnrolled ? 'inscritos' : 'vagas'}
                        </Text>
                      </View>
                      <View style={styles.statColDivider} />
                      <View style={styles.statCol}>
                        <Text style={styles.statNumber}>
                          {featuredProgress.restantes}
                        </Text>
                        <Text style={styles.statLabel}>
                          {featuredProgress.hasEnrolled
                            ? 'aguardando'
                            : 'restantes'}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyHeroCard}>
            <Feather name="calendar" size={26} color="#2F5E38" />
            <Text style={styles.emptyHeroTitle}>
              Nenhum evento próximo no momento
            </Text>
            <Text style={styles.emptyHeroSubtitle}>
              Quando houver eventos em andamento ou futuros para sua equipe, eles
              aparecerão aqui.
            </Text>
          </View>
        )}

        {/* Quick Actions Row */}
        {featuredEvent && (
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.qrActionCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('Service', {
                  eventId: featuredEvent.id,
                  initialTab: 'checkin',
                  openScanner: true,
                })
              }
            >
              <View style={styles.qrActionIconBox}>
                <Icon name="qr-code-scanner" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.actionCardTextWrap}>
                <Text style={styles.qrActionTitle}>Escanear QR Code</Text>
                <Text style={styles.qrActionSubtitle} numberOfLines={2}>
                  Use a câmera para credenciar
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cpfActionCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('Credential', { eventId: featuredEvent.id })
              }
            >
              <View style={styles.cpfActionIconBox}>
                <Feather name="credit-card" size={20} color="#2F5E38" />
              </View>
              <View style={styles.actionCardTextWrap}>
                <Text style={styles.cpfActionTitle}>Check-in por CPF</Text>
                <Text style={styles.cpfActionSubtitle} numberOfLines={2}>
                  Localize pelo documento
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Last Hour Live Check-ins Strip */}
        {featuredEvent && (
          <View style={styles.liveMetricBanner}>
            <View style={styles.liveMetricIconBox}>
              <Feather name="users" size={18} color="#2F5E38" />
            </View>
            <View style={styles.liveMetricTextWrap}>
              <Text style={styles.liveMetricLabel}>
                Check-ins na última hora
              </Text>
              <View style={styles.liveMetricValueRow}>
                <Text style={styles.liveMetricNumber}>{lastHourCount}</Text>
                <Text style={styles.liveMetricTotal}>
                  {featuredCheckins.length} realizado
                  {featuredCheckins.length === 1 ? '' : 's'} no evento
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Agenda Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>AGENDA</Text>
              <Text style={styles.sectionTitle}>Próximos eventos</Text>
            </View>
            <View style={styles.sectionIconBadge}>
              <Feather name="calendar" size={17} color="#2F5E38" />
            </View>
          </View>

          {visibleAgenda.length > 0 ? (
            <View style={styles.agendaList}>
              {visibleAgenda.map((item, idx) => {
                const { day, month } = getDateParts(item.started_at);
                const active = isEventActive(item);
                return (
                  <TouchableOpacity
                    key={String(item.id || idx)}
                    style={[
                      styles.agendaItem,
                      idx === 0 && active && styles.agendaItemHighlighted,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('Service', { eventId: item.id })
                    }
                  >
                    <View
                      style={[
                        styles.agendaDateBox,
                        idx % 2 === 1 && styles.agendaDateBoxAlt,
                      ]}
                    >
                      <Text style={styles.agendaDateDay}>{day}</Text>
                      <Text style={styles.agendaDateMonth}>{month}</Text>
                    </View>

                    <View style={styles.agendaInfo}>
                      <Text
                        style={[
                          styles.agendaStatus,
                          active && styles.agendaStatusActive,
                        ]}
                      >
                        {active ? 'EM ANDAMENTO' : 'PRÓXIMO'}
                      </Text>
                      <Text style={styles.agendaTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.agendaLocRow}>
                        <Feather name="map-pin" size={11} color="#7A847B" />
                        <Text style={styles.agendaLocText} numberOfLines={1}>
                          {item.name_location || 'Local a definir'}
                        </Text>
                      </View>
                    </View>

                    <Feather name="chevron-right" size={17} color="#8D968E" />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptySectionText}>
              Nenhum evento próximo agendado.
            </Text>
          )}

          {upcomingEvents.length > 0 && (
            <TouchableOpacity
              style={styles.viewAllBtn}
              activeOpacity={0.8}
              onPress={() => setShowAllAgenda(prev => !prev)}
            >
              <Text style={styles.viewAllBtnText}>
                {showAllAgenda
                  ? 'Mostrar menos'
                  : `Ver todos os eventos (${upcomingEvents.length})`}
              </Text>
              <Feather
                name={showAllAgenda ? 'chevron-up' : 'arrow-right'}
                size={15}
                color="#2F5E38"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Live Participants Tracking Card */}
        {featuredEvent && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  ACOMPANHAMENTO AO VIVO
                </Text>
                <Text style={styles.sectionTitle}>Participantes</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Service', {
                    eventId: featuredEvent.id,
                    initialTab: 'checkin',
                  })
                }
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="arrow-right" size={18} color="#2F5E38" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Feather name="search" size={16} color="#8D968E" />
              <TextInput
                placeholder="Buscar participante..."
                placeholderTextColor="#8D968E"
                style={styles.searchInput}
                value={participantSearch}
                onChangeText={setParticipantSearch}
              />
            </View>

            <View style={styles.segmentTabs}>
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'confirmados', label: 'Confirmados' },
                { key: 'aguardando', label: 'Aguardando' },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.segmentBtn,
                    participantTab === tab.key && styles.segmentBtnActive,
                  ]}
                  onPress={() => setParticipantTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      participantTab === tab.key && styles.segmentTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredParticipants.length > 0 ? (
              <View style={styles.participantsList}>
                {filteredParticipants.map((p, idx) => (
                  <TouchableOpacity
                    key={`${p.id}-${idx}`}
                    style={[
                      styles.participantRow,
                      idx < filteredParticipants.length - 1 &&
                        styles.participantDivider,
                    ]}
                    activeOpacity={0.75}
                    onPress={() =>
                      navigation.navigate('Service', {
                        eventId: featuredEvent.id,
                        initialTab: 'checkin',
                      })
                    }
                  >
                    <View style={styles.participantAvatar}>
                      <Text style={styles.participantAvatarText}>
                        {getInitials(p.name)}
                      </Text>
                    </View>

                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={styles.participantSub} numberOfLines={1}>
                        {p.subtitle}
                      </Text>
                    </View>

                    <View style={styles.participantRight}>
                      {p.confirmed ? (
                        <View style={styles.confirmedPill}>
                          <Feather name="check" size={11} color="#2F5E38" />
                          <Text style={styles.confirmedPillText}>
                            Confirmado
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.waitingPill}>
                          <Text style={styles.waitingPillText}>Aguardando</Text>
                        </View>
                      )}
                      <Text style={styles.participantTime}>
                        {p.confirmed ? formatShortTime(p.checkinTime) : '—'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptySectionText}>
                {participantTab === 'aguardando'
                  ? 'Nenhum participante aguardando check-in.'
                  : participantTab === 'confirmados'
                  ? 'Nenhum check-in registrado para este evento ainda.'
                  : 'Nenhum participante inscrito para este evento ainda.'}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#F6F7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6E786F',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 48,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  dateSubtitle: {
    fontSize: 12,
    color: '#7A847B',
    fontWeight: '500',
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#18221B',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: '#6E786F',
    marginTop: 2,
  },
  profileSquareBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#183724',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  heroDecorCircleOne: {
    position: 'absolute',
    top: -36,
    right: -36,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroDecorCircleTwo: {
    position: 'absolute',
    bottom: -44,
    left: 20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroEyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#98D89E',
    marginRight: 8,
  },
  heroEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#D8EAD9',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 27,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroMetaText: {
    flex: 1,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  progressBox: {
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#A9E2AE',
  },
  statsColumns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  statColDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginHorizontal: 10,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  emptyHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 26,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyHeroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18221B',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyHeroSubtitle: {
    fontSize: 13,
    color: '#6E786F',
    textAlign: 'center',
    lineHeight: 19,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  qrActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F7652',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    shadowColor: '#1E462D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  qrActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTextWrap: {
    flex: 1,
  },
  qrActionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  qrActionSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 14,
  },
  cpfActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  cpfActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpfActionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 2,
  },
  cpfActionSubtitle: {
    fontSize: 11,
    color: '#6E786F',
    lineHeight: 14,
  },
  liveMetricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4EA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCE8D7',
    gap: 14,
  },
  liveMetricIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveMetricTextWrap: {
    flex: 1,
  },
  liveMetricLabel: {
    fontSize: 12,
    color: '#6E786F',
    fontWeight: '500',
    marginBottom: 2,
  },
  liveMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  liveMetricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18221B',
  },
  liveMetricTotal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F5E38',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#18221B',
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaList: {
    gap: 10,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    gap: 12,
  },
  agendaItemHighlighted: {
    backgroundColor: '#F6FAF4',
    borderWidth: 1,
    borderColor: '#DCE8D7',
  },
  agendaDateBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaDateBoxAlt: {
    backgroundColor: '#EFF2D8',
  },
  agendaDateDay: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18221B',
    lineHeight: 19,
  },
  agendaDateMonth: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#5C6C5D',
    marginTop: 1,
  },
  agendaInfo: {
    flex: 1,
  },
  agendaStatus: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#C27803',
    marginBottom: 2,
  },
  agendaStatusActive: {
    color: '#2F5E38',
  },
  agendaTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#18221B',
    marginBottom: 2,
  },
  agendaLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agendaLocText: {
    flex: 1,
    fontSize: 11.5,
    color: '#7A847B',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    backgroundColor: '#FAFBF8',
  },
  viewAllBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F5E38',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAF6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#18221B',
  },
  segmentTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F5EF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A847B',
  },
  segmentTextActive: {
    color: '#18221B',
    fontWeight: '700',
  },
  participantsList: {
    gap: 2,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  participantDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3EC',
  },
  participantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2F5E38',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18221B',
    marginBottom: 2,
  },
  participantSub: {
    fontSize: 11.5,
    color: '#7A847B',
  },
  participantRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3EFE6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  confirmedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F5E38',
  },
  waitingPill: {
    backgroundColor: '#FEF5E4',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  waitingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B5632E',
  },
  participantTime: {
    fontSize: 11,
    color: '#7A847B',
    fontWeight: '500',
  },
  emptySectionText: {
    fontSize: 13,
    color: '#7A847B',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
