import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  StatusBar,
  TextInput,
  RefreshControl,
  Easing,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { Camera } from 'react-native-camera-kit';
import {
  Bell,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  ArrowUp,
  CreditCard,
  UserPlus,
  Users,
  Check,
  Search,
  X,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from '../../components/Modals/CustomAlertModal';

import LoadingInfo from '../../components/Ui/LoadingInfo';
import api from '../../services/endpont';
import apiService from '../../services/api';
import { formatDateEvent } from '../../utils/dateFormat';

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

function parseDateSafe(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const normalized = dateStr.includes('T')
    ? dateStr
    : dateStr.replace(' ', 'T');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatFullDatePt(dateStr) {
  const date = parseDateSafe(dateStr);
  if (!date) return 'Data a definir';
  const day = date.getDate();
  const month = MONTHS_PT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

function formatTimeHHMM(dateStr) {
  const date = parseDateSafe(dateStr);
  if (!date) return '--:--';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatHeaderToday() {
  const now = new Date();
  const weekday = WEEKDAYS_PT[now.getDay()];
  const day = now.getDate();
  const month = MONTHS_PT[now.getMonth()];
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${weekday}, ${day} de ${capitalizedMonth}`;
}

function stripHtml(value) {
  if (!value || typeof value !== 'string') return '';
  const entityMap = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&ccedil;': 'ç',
    '&Ccedil;': 'Ç',
    '&atilde;': 'ã',
    '&Atilde;': 'Ã',
    '&otilde;': 'õ',
    '&Otilde;': 'Õ',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&acirc;': 'â',
    '&ecirc;': 'ê',
    '&ocirc;': 'ô',
  };
  return value
    .replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-zA-Z0-9#]+;/g, match => entityMap[match] || ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function Service() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId, openScanner } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [titleLoading] = useState('Atualizando Informações');
  const [event, setEvent] = useState({});
  const [listCheckin, setListCheckin] = useState([]);
  const [enrolledParticipants, setEnrolledParticipants] = useState([]);
  const [participantFilterTab, setParticipantFilterTab] = useState('todos');
  const [searchParticipant, setSearchParticipant] = useState('');
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  const [scannerVisible, setScannerVisible] = useState(false);
  const [showCheckInButton, setShowCheckInButton] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [isCheckin, setIsCheckin] = useState(false);
  const [isCredential, setIsCredential] = useState(false);
  const [freeCheckin, setFreeCheckin] = useState(false);

  const [termText, setTermText] = useState(null);
  const [termMinorText, setTermMinorText] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [scannedCode, setScannedCode] = useState(null);
  const modalTranslateY = useRef(new Animated.Value(300)).current;
  const cornerPulseAnim = useRef(new Animated.Value(0)).current;
  const scanCaptureAnim = useRef(new Animated.Value(0)).current;
  const isScanning = useRef(false);

  useEffect(() => {
    if (!scannerVisible) {
      cornerPulseAnim.setValue(0);
      scanCaptureAnim.setValue(0);
      setScannedCode(null);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cornerPulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cornerPulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scannerVisible, cornerPulseAnim, scanCaptureAnim]);

  const checkEventTerm = useCallback(async () => {
    try {
      const id = eventId || route.params?.eventId;
      if (!id) return;

      const response = await apiService.get(`/events/${id}/term`);
      const data = response.data;

      if (data && (data.term_text || data.term_minor_text)) {
        setTermText(data.term_text || null);
        setTermMinorText(data.term_minor_text || null);
      } else {
        setTermText(null);
        setTermMinorText(null);
      }
    } catch (error) {
      console.log('Evento sem termo configurado ou erro na api:', error);
    }
  }, [eventId, route.params?.eventId]);

  const firstEvent = useCallback(async () => {
    try {
      const response = await api.getEvent(eventId);
      setEvent(response.data || {});

      setIsCheckin(response.isCredential || false);
      setIsCredential(response.isCheckin || false);
      setFreeCheckin(response.freeCheckin || false);
    } catch (error) {
      console.log('Erro ao buscar o evento:', error);
    }
  }, [eventId]);

  const handleListCheckin = useCallback(async () => {
    const cacheKey = `@recentCheckins_${eventId}`;
    let cachedList = [];
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cachedList = parsed;
      }
    } catch { }

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
        setListCheckin([...pendingLocal, ...serverList]);
      } else {
        setListCheckin(cachedList);
      }
    } else {
      setListCheckin(cachedList);
    }

    if (participantsRes.status === 'fulfilled') {
      const list = Array.isArray(participantsRes.value)
        ? participantsRes.value
        : Array.isArray(participantsRes.value?.data)
          ? participantsRes.value.data
          : [];
      setEnrolledParticipants(list);
    } else {
      setEnrolledParticipants([]);
    }
  }, [eventId]);

  useEffect(() => {
    if (event.started_at && event.ended_at) {
      const now = new Date();
      const start = parseDateSafe(event.started_at);
      const end = parseDateSafe(event.ended_at);
      const active = start && end ? now >= start && now <= end : false;
      setShowCheckInButton(active);
      if (openScanner && active && isCredential) {
        setScannerVisible(true);
      }
    }
  }, [event, openScanner, isCredential]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const safetyTimer = setTimeout(() => setLoading(false), 8000);

      Promise.allSettled([
        firstEvent(),
        handleListCheckin(),
        checkEventTerm(),
      ]).finally(() => {
        clearTimeout(safetyTimer);
        setLoading(false);
      });

      return () => clearTimeout(safetyTimer);
    }, [firstEvent, handleListCheckin, checkEventTerm]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      firstEvent(),
      handleListCheckin(),
      checkEventTerm(),
    ]);
    setRefreshing(false);
  };

  const handleQRCodeRead = async data => {
    if (isScanning.current || !data) return;
    isScanning.current = true;
    setScannedCode(String(data));
    scanCaptureAnim.setValue(0);

    Animated.spring(scanCaptureAnim, {
      toValue: 1,
      friction: 6,
      tension: 110,
      useNativeDriver: true,
    }).start();

    await new Promise(resolve => setTimeout(resolve, 650));
    setScannerVisible(false);

    setLoading(true);

    try {
      const response = await api.postCheckinEvent({ token: data, eventId });

      if (!response.error && response.name) {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const localSqlDate = `${now.getFullYear()}-${pad(
          now.getMonth() + 1,
        )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
          now.getMinutes(),
        )}:${pad(now.getSeconds())}`;

        const newRecord = {
          participant_id: String(data),
          name_participante: response.name,
          user_create: 'Check-in via QR Code',
          started_at: localSqlDate,
          checkin: [{ started_at: localSqlDate }],
        };

        try {
          const cacheKey = `@recentCheckins_${eventId}`;
          const raw = await AsyncStorage.getItem(cacheKey);
          const existing = raw ? JSON.parse(raw) : [];
          const filtered = Array.isArray(existing)
            ? existing.filter(
              item =>
                (item.name_participante || '').trim().toLowerCase() !==
                response.name.trim().toLowerCase(),
            )
            : [];
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify([newRecord, ...filtered]),
          );
        } catch { }
      }

      await handleListCheckin();
      Dialog.show({
        type: response.error ? ALERT_TYPE.DANGER : ALERT_TYPE.SUCCESS,
        title: response.error ? 'Erro no check-in' : 'Check-in confirmado',
        textBody: response.error
          ? `${response.message || JSON.stringify(response)}\n(Token lido: ${data} | Evento: ${eventId})`
          : response.name,
        button: 'Fechar',
      });
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro no check-in',
        textBody:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Houve uma falha, tente novamente.',
        button: 'Fechar',
      });
    } finally {
      isScanning.current = false;
      setLoading(false);
    }
  };

  const handleOpenScanner = () => {
    if (showCheckInButton && isCredential) {
      setScannerVisible(true);
      return;
    }
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Leitor indisponível',
      textBody:
        'O credenciamento por QR Code só fica disponível enquanto o evento estiver em andamento.',
      button: 'Entendi',
    });
  };

  const handleOpenCpfCheckin = () => {
    if (isCheckin) {
      navigation.navigate('Credential', { eventId });
      return;
    }
    if (freeCheckin) {
      navigation.navigate('CredencialmentoResponsavel', {
        eventId,
        termText,
        termMinorText,
      });
      return;
    }
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Check-in por CPF',
      textBody:
        'O check-in manual por CPF não está habilitado para este evento no momento.',
      button: 'Entendi',
    });
  };

  const closeScanner = () => setScannerVisible(false);

  const openModal = item => {
    setSelectedItem(item);
    setModalVisible(true);
    Animated.timing(modalTranslateY, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const renderCheckinDetails = checkins => {
    const rows = [];
    for (let i = 0; i < checkins.length; i += 2) {
      const entrada = checkins[i];
      const saida = checkins[i + 1];
      rows.push(
        <View key={i} style={styles.checkinRow}>
          <View style={styles.checkinColumn}>
            <Text style={styles.textBold}>Entrada</Text>
            <Text style={styles.modalContent}>
              {formatDateEvent(entrada.started_at)}
            </Text>
          </View>
          {saida ? (
            <View style={styles.checkinColumn}>
              <Text style={styles.textBold}>Saída</Text>
              <Text style={styles.modalContent}>
                {formatDateEvent(saida.started_at)}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyColumn} />
          )}
        </View>,
      );
    }
    return rows;
  };

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const eventStatus = useMemo(() => {
    const now = new Date();
    const start = parseDateSafe(event.started_at);
    const end = parseDateSafe(event.ended_at);
    if (start && end) {
      if (now >= start && now <= end) {
        return { label: 'EM ANDAMENTO', dotColor: '#3E8E58' };
      }
      if (now < start) {
        return { label: 'PRÓXIMO', dotColor: '#D48A29' };
      }
      return { label: 'FINALIZADO', dotColor: '#7A847B' };
    }
    return { label: 'EM ANDAMENTO', dotColor: '#3E8E58' };
  }, [event.started_at, event.ended_at]);

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

    listCheckin.forEach(c => {
      if (c.participant_id) checkinById.set(String(c.participant_id), c);
      if (c.name_participante) {
        checkinByName.set(c.name_participante.trim().toLowerCase(), c);
      }
    });

    const seenNames = new Set();
    const fromEnrolled = enrolledParticipants.map(p => {
      const keyName = (p.name || '').trim().toLowerCase();
      if (keyName) seenNames.add(keyName);
      const matched =
        checkinById.get(String(p.id)) || checkinByName.get(keyName);
      const isConfirmed = Boolean(
        matched || Number(p.credential) === 1 || p.date_time_credential,
      );
      return {
        participant_id: p.id,
        name_participante: p.name || 'Participante',
        subtitle: p.cpf
          ? maskCpf(p.cpf)
          : p.participant_type_name || `#EV-${p.id}`,
        cpf: p.cpf || '',
        confirmed: isConfirmed,
        started_at: matched?.started_at || p.date_time_credential || null,
        checkin: matched?.checkin || [],
      };
    });

    const extraCheckins = listCheckin
      .filter(c => {
        const keyName = (c.name_participante || '').trim().toLowerCase();
        return keyName && !seenNames.has(keyName);
      })
      .map(c => ({
        participant_id: c.participant_id,
        name_participante: c.name_participante || 'Participante',
        subtitle: c.participant_id
          ? `#EV-${c.participant_id}`
          : c.user_create || 'Check-in confirmado',
        cpf: '',
        confirmed: true,
        started_at: c.started_at || null,
        checkin: c.checkin || [],
      }));

    return [...extraCheckins, ...fromEnrolled];
  }, [enrolledParticipants, listCheckin]);

  const totalCheckins = useMemo(
    () => mergedParticipants.filter(p => p.confirmed).length,
    [mergedParticipants],
  );

  const totalEnrolled = useMemo(() => {
    if (mergedParticipants.length > 0) {
      return mergedParticipants.length;
    }
    const raw =
      event.registrations_count ??
      event.participants_count ??
      event.total_participants ??
      event.enrolled_count;
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric >= totalCheckins) {
      return numeric;
    }
    return totalCheckins;
  }, [event, mergedParticipants.length, totalCheckins]);

  const waitingCount = Math.max(totalEnrolled - totalCheckins, 0);
  const checkinPercent =
    totalEnrolled > 0 ? Math.round((totalCheckins / totalEnrolled) * 100) : 0;

  const lastHourCount = useMemo(() => {
    const nowMs = Date.now();
    return listCheckin.filter(item => {
      const dt = parseDateSafe(item.started_at);
      if (!dt) return false;
      const diff = nowMs - dt.getTime();
      return diff >= 0 && diff <= 3600 * 1000;
    }).length;
  }, [listCheckin]);

  const scheduleItems = useMemo(() => {
    if (Array.isArray(event.schedule) && event.schedule.length > 0) {
      return event.schedule.map((item, idx) => ({
        time: item.time || item.started_at || '--:--',
        title: item.title || item.name || 'Atividade',
        location: item.location || event.local || 'Local do evento',
        isNow: Boolean(item.is_now) || idx === 0,
      }));
    }

    const startTime = formatTimeHHMM(event.started_at);
    const endTime = formatTimeHHMM(event.ended_at);
    const place =
      event.local || event.location || event.address || 'Local do evento';
    const isOngoing = eventStatus.label === 'EM ANDAMENTO';

    return [
      {
        time: startTime,
        title: 'Abertura do credenciamento',
        location: place,
        isNow: isOngoing,
      },
      {
        time: startTime,
        title: event.name ? `Início — ${event.name}` : 'Início da programação',
        location: place,
        isNow: false,
      },
      {
        time: endTime,
        title: 'Encerramento previsto',
        location: place,
        isNow: false,
      },
    ];
  }, [event, eventStatus.label]);

  const filteredParticipants = useMemo(() => {
    let base = mergedParticipants;
    if (participantFilterTab === 'confirmados') {
      base = base.filter(p => p.confirmed);
    } else if (participantFilterTab === 'aguardando') {
      base = base.filter(p => !p.confirmed);
    }

    const term = searchParticipant.trim().toLowerCase();
    if (term) {
      base = base.filter(
        item =>
          item.name_participante?.toLowerCase().includes(term) ||
          item.cpf?.toLowerCase().includes(term),
      );
    }
    return base;
  }, [mergedParticipants, participantFilterTab, searchParticipant]);

  const visibleParticipants = showAllParticipants
    ? filteredParticipants
    : filteredParticipants.slice(0, 4);

  const eventLocation =
    event.local ||
    event.location ||
    event.address ||
    event.city ||
    'Local a definir';

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} barStyle="dark-content" backgroundColor="#F6F7F2" />
      <LoadingInfo visible={loading} message={titleLoading} />

      {!scannerVisible && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 20) + 12,
              paddingBottom: Math.max(insets.bottom, 20) + 28,
            },
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
            <View style={styles.headerTextWrap}>
              <Text style={styles.dateCaption}>{formatHeaderToday()}</Text>
              <Text style={styles.pageTitle}>Detalhes do evento</Text>
            </View>

            <TouchableOpacity
              style={styles.bellButton}
              onPress={onRefresh}
              activeOpacity={0.75}
            >
              <Bell size={19} color="#18221B" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* Back link */}
          <TouchableOpacity
            style={styles.backLinkRow}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <ArrowLeft size={16} color="#5F6A61" />
            <Text style={styles.backLinkText}>Voltar para eventos</Text>
          </TouchableOpacity>

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
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: eventStatus.dotColor },
                  ]}
                />
                <Text style={styles.statusPillText}>{eventStatus.label}</Text>
              </View>

              <Text style={styles.heroTitle}>
                {event.name || 'Carregando evento...'}
              </Text>

              <Text style={styles.heroDescription} numberOfLines={3}>
                {stripHtml(event.description) ||
                  'Uma experiência criada para conectar pessoas, conhecimento e oportunidades no campo.'}
              </Text>

              <View style={styles.heroMetaList}>
                <View style={styles.heroMetaRow}>
                  <Calendar size={14} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.heroMetaText}>
                    {formatFullDatePt(event.started_at)}
                  </Text>
                </View>

                <View style={styles.heroMetaRow}>
                  <Clock size={14} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.heroMetaText}>
                    {formatTimeHHMM(event.started_at)} —{' '}
                    {formatTimeHHMM(event.ended_at)}
                  </Text>
                </View>

                <View style={styles.heroMetaRow}>
                  <MapPin size={14} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.heroMetaText} numberOfLines={1}>
                    {eventLocation}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Primary Quick Actions */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionHalf}
              onPress={handleOpenScanner}
              activeOpacity={0.85}
            >
              <View style={styles.qrActionCard}>
                <LinearGradient
                  colors={['#437A56', '#2F5E3E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.qrActionContent}>
                  <View style={styles.qrActionIconBox}>
                    <QrCode size={20} color="#FFFFFF" />
                  </View>

                  <View style={styles.quickActionTextWrap}>
                    <Text style={styles.qrActionTitle} numberOfLines={2}>
                      Escanear QR Code
                    </Text>
                    <Text style={styles.qrActionSub} numberOfLines={1}>
                      Credenciamento rápido
                    </Text>
                  </View>

                  <ArrowRight size={16} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionHalf}
              onPress={handleOpenCpfCheckin}
              activeOpacity={0.82}
            >
              <View style={styles.cpfActionCard}>
                <View style={styles.cpfActionIconBox}>
                  <CreditCard size={19} color="#2F5E38" />
                </View>

                <View style={styles.quickActionTextWrap}>
                  <Text style={styles.cpfActionTitle} numberOfLines={2}>
                    Check-in por CPF
                  </Text>
                  <Text style={styles.cpfActionSub} numberOfLines={1}>
                    Busca manual
                  </Text>
                </View>

                <ArrowRight size={16} color="#18221B" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Free-list New Participant Card */}
          {freeCheckin && (
            <TouchableOpacity
              style={styles.freeCheckinCard}
              onPress={() =>
                navigation.navigate('CredencialmentoResponsavel', {
                  eventId,
                  termText,
                  termMinorText,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.freeCheckinIconBox}>
                <UserPlus size={19} color="#2F5E38" />
              </View>
              <View style={styles.freeCheckinTextWrap}>
                <Text style={styles.freeCheckinTitle}>
                  Credenciar novo participante
                </Text>
                <Text style={styles.freeCheckinSub}>
                  Cadastrar e credenciar na lista livre
                </Text>
              </View>
              <ArrowRight size={17} color="#18221B" />
            </TouchableOpacity>
          )}

          {/* 2x2 KPI Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#EBF3ED' }]}>
                <Users size={18} color="#2F5E38" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statLabel}>Inscritos</Text>
                <Text style={styles.statValue}>{totalEnrolled}</Text>
                <Text style={styles.statHint}>Total confirmado</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#E7F3EE' }]}>
                <Check size={18} color="#2F5E38" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statLabel}>Check-ins</Text>
                <Text style={styles.statValue}>{totalCheckins}</Text>
                <Text style={styles.statHint}>
                  {checkinPercent}% dos inscritos
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#FEF5E4' }]}>
                <Clock size={18} color="#B5632E" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statLabel}>Aguardando</Text>
                <Text style={styles.statValue}>{waitingCount}</Text>
                <Text style={styles.statHint}>Participantes</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#EDF1E6' }]}>
                <QrCode size={18} color="#2F5E38" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statLabel}>Última hora</Text>
                <Text style={styles.statValue}>{lastHourCount}</Text>
                <Text style={styles.statHint}>Check-ins recentes</Text>
              </View>
            </View>
          </View>

          {/* Programação do evento */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionEyebrow}>INFORMAÇÕES</Text>
            <Text style={styles.sectionHeading}>Programação do evento</Text>

            <View style={styles.timelineContainer}>
              {scheduleItems.map((item, idx) => {
                const isLast = idx === scheduleItems.length - 1;
                return (
                  <View key={idx} style={styles.timelineRow}>
                    <Text style={styles.timelineTime}>{item.time}</Text>

                    <View style={styles.timelineTrack}>
                      <View
                        style={[
                          styles.timelineDot,
                          item.isNow && styles.timelineDotActive,
                        ]}
                      >
                        {item.isNow && <View style={styles.timelineDotInner} />}
                      </View>
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>

                    <View style={styles.timelineBody}>
                      <View style={styles.timelineTitleRow}>
                        <Text style={styles.timelineTitle}>{item.title}</Text>
                        {item.isNow && (
                          <View style={styles.nowBadge}>
                            <Text style={styles.nowBadgeText}>Agora</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.timelineLocation}>
                        {item.location}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Participantes & Check-ins recentes */}
          <View style={styles.sectionCard}>
            <View style={styles.realtimeHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>EM TEMPO REAL</Text>
                <Text style={styles.sectionHeading}>Participantes</Text>
              </View>

              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Ao vivo</Text>
              </View>
            </View>

            <View style={styles.segmentTabs}>
              {[
                { key: 'todos', label: `Todos (${mergedParticipants.length})` },
                { key: 'confirmados', label: `Confirmados (${totalCheckins})` },
                { key: 'aguardando', label: `Aguardando (${waitingCount})` },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.segmentBtn,
                    participantFilterTab === tab.key && styles.segmentBtnActive,
                  ]}
                  onPress={() => setParticipantFilterTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      participantFilterTab === tab.key &&
                      styles.segmentTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(showAllParticipants || mergedParticipants.length > 4) && (
              <View style={styles.searchBox}>
                <Search size={16} color="#7A847B" />
                <TextInput
                  placeholder="Buscar participante..."
                  placeholderTextColor="#8D968E"
                  style={styles.searchInput}
                  value={searchParticipant}
                  onChangeText={setSearchParticipant}
                />
                {searchParticipant.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchParticipant('')}>
                    <X size={16} color="#7A847B" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {visibleParticipants.length > 0 ? (
              <View style={styles.recentList}>
                {visibleParticipants.map((item, index) => (
                  <TouchableOpacity
                    key={String(item.participant_id) + index}
                    style={[
                      styles.recentRow,
                      index < visibleParticipants.length - 1 &&
                      styles.recentRowBorder,
                    ]}
                    onPress={() => {
                      if (item.checkin && item.checkin.length > 0) {
                        openModal(item);
                      }
                    }}
                    activeOpacity={item.checkin?.length > 0 ? 0.75 : 1}
                  >
                    <View style={styles.recentAvatar}>
                      <Text style={styles.recentAvatarText}>
                        {getInitials(item.name_participante)}
                      </Text>
                    </View>

                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName} numberOfLines={1}>
                        {item.name_participante}
                      </Text>
                      <Text style={styles.recentSub} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>

                    {item.confirmed ? (
                      <>
                        <Text style={styles.recentTime}>
                          {formatTimeHHMM(item.started_at)}
                        </Text>
                        <View style={styles.recentCheckCircle}>
                          <Feather name="check" size={12} color="#FFFFFF" />
                        </View>
                      </>
                    ) : (
                      <View style={styles.waitingBadge}>
                        <Text style={styles.waitingBadgeText}>Aguardando</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyRecordsCard}>
                <Users size={22} color="#7A847B" />
                <Text style={styles.emptyRecordsTitle}>
                  {mergedParticipants.length === 0
                    ? 'Nenhum participante inscrito ainda'
                    : 'Nenhum participante encontrado'}
                </Text>
                <Text style={styles.emptyRecordsSubtitle}>
                  {mergedParticipants.length === 0
                    ? 'Os participantes inscritos no evento aparecerão aqui.'
                    : 'Tente alterar o filtro ou buscar por outro nome.'}
                </Text>
              </View>
            )}

            {filteredParticipants.length > 4 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setShowAllParticipants(v => !v)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllBtnText}>
                  {showAllParticipants
                    ? 'Mostrar menos'
                    : `Ver todos os participantes (${filteredParticipants.length})`}
                </Text>
                {showAllParticipants ? (
                  <ArrowUp size={15} color="#2F5E38" />
                ) : (
                  <ArrowRight size={15} color="#2F5E38" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* QR Code Scanner Modal */}
      {scannerVisible && (
        <View style={styles.scannerBackdrop}>
          <View style={styles.scannerModalCard}>
            <View style={styles.scannerHeaderRow}>
              <View style={styles.scannerHeaderText}>
                <Text style={styles.scannerEyebrow}>LEITOR DE CREDENCIAL</Text>
                <Text style={styles.scannerTitle}>Escaneie o QR Code</Text>
                <Text style={styles.scannerSubtitle}>
                  Posicione o código do participante dentro da área abaixo.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.scannerCloseCircle}
                onPress={closeScanner}
                activeOpacity={0.8}
              >
                <X size={18} color="#465248" />
              </TouchableOpacity>
            </View>

            <View style={styles.scannerViewport}>
              <Camera
                style={styles.scannerCamera}
                scanBarcode={true}
                onReadCode={scanEvent =>
                  handleQRCodeRead(scanEvent.nativeEvent.codeStringValue)
                }
                showFrame={false}
              />

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.scannerOverlayFrame,
                  {
                    transform: [
                      {
                        scale: cornerPulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.03],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </Animated.View>

              {scannedCode ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.capturedOverlay,
                    {
                      opacity: scanCaptureAnim,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.capturedCard,
                      {
                        transform: [
                          {
                            scale: scanCaptureAnim.interpolate({
                              inputRange: [0, 0.7, 1],
                              outputRange: [0.45, 1.06, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.capturedIconBox}>
                      <QrCode size={28} color="#2F5E38" />
                    </View>
                    <Text style={styles.capturedLabel}>QR Code lido</Text>
                    <Text style={styles.capturedCodeText} numberOfLines={1}>
                      {scannedCode}
                    </Text>
                  </Animated.View>
                </Animated.View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.scannerPrimaryBtn}
              activeOpacity={0.85}
              onPress={() => {
                closeScanner();
                if (isCheckin) {
                  navigation.navigate('Credential', { eventId });
                }
              }}
            >
              <Text style={styles.scannerPrimaryBtnText}>
                {isCheckin ? 'Fazer check-in por CPF' : 'Fechar leitor'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Participant Detail Modal */}
      {modalVisible && (
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modal,
                { transform: [{ translateY: modalTranslateY }] },
              ]}
            >
              <Text style={[styles.textBold, styles.modalTitle]}>
                Detalhes do Registro
              </Text>
              {renderCheckinDetails(selectedItem?.checkin || [])}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTextWrap: {
    flex: 1,
  },
  dateCaption: {
    fontSize: 12,
    color: '#7A847B',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#18221B',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D9822B',
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6A61',
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 20,
  },
  heroCircleDecor: {
    position: 'absolute',
    top: -42,
    right: -42,
    width: 170,
    height: 170,
    borderRadius: 85,
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
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#18221B',
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 28,
  },
  heroDescription: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.84)',
    lineHeight: 19,
    marginBottom: 16,
  },
  heroMetaList: {
    gap: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  heroMetaText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  quickActionHalf: {
    flex: 1,
  },
  qrActionCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  qrActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 9,
    minHeight: 74,
  },
  qrActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTextWrap: {
    flex: 1,
  },
  qrActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  qrActionSub: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
  },
  cpfActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 9,
    minHeight: 74,
  },
  cpfActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EDF4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpfActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18221B',
    lineHeight: 16,
  },
  cpfActionSub: {
    fontSize: 10.5,
    color: '#7A847B',
    marginTop: 2,
  },
  freeCheckinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 14,
  },
  freeCheckinIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDF4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeCheckinTextWrap: {
    flex: 1,
  },
  freeCheckinTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18221B',
  },
  freeCheckinSub: {
    fontSize: 11.5,
    color: '#7A847B',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48.3%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 13,
    paddingVertical: 14,
    gap: 11,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11.5,
    color: '#7A847B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18221B',
    lineHeight: 26,
    marginVertical: 1,
  },
  statHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2F5E38',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    padding: 18,
    marginBottom: 16,
  },
  sectionEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 16,
  },
  timelineContainer: {
    gap: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 54,
  },
  timelineTime: {
    width: 48,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#7A847B',
    paddingTop: 1,
  },
  timelineTrack: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6D9B78',
    backgroundColor: '#FFFFFF',
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderColor: '#CFE4D4',
    borderWidth: 3,
    backgroundColor: '#3E8E58',
    marginTop: 1,
  },
  timelineDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#3E8E58',
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    minHeight: 34,
    backgroundColor: '#DCE5DD',
    marginVertical: 3,
  },
  timelineBody: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 14,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timelineTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18221B',
  },
  nowBadge: {
    backgroundColor: '#E6F2EA',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  nowBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F5E38',
  },
  timelineLocation: {
    fontSize: 12,
    color: '#8D988E',
    marginTop: 3,
  },
  realtimeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3E8E58',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F5E38',
  },
  segmentTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F5F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
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
    fontSize: 11.5,
    fontWeight: '600',
    color: '#7A847B',
  },
  segmentTextActive: {
    color: '#18221B',
    fontWeight: '700',
  },
  waitingBadge: {
    backgroundColor: '#FEF5E4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  waitingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B5632E',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#18221B',
    paddingVertical: 0,
  },
  recentList: {
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  recentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2EB',
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF3ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F5E38',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18221B',
  },
  recentSub: {
    fontSize: 12,
    color: '#8D988E',
    marginTop: 2,
  },
  recentTime: {
    fontSize: 12,
    color: '#8D988E',
    fontWeight: '600',
  },
  recentCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#438A5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCE5DD',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  viewAllBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2F5E38',
  },
  emptyRecordsCard: {
    alignItems: 'center',
    paddingVertical: 22,
    gap: 6,
  },
  emptyRecordsTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#18221B',
  },
  emptyRecordsSubtitle: {
    fontSize: 12.5,
    color: '#7A847B',
    textAlign: 'center',
  },
  scannerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 34, 24, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  scannerModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  scannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  scannerHeaderText: {
    flex: 1,
  },
  scannerEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 4,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 4,
  },
  scannerSubtitle: {
    fontSize: 12.5,
    color: '#6E786F',
    lineHeight: 18,
  },
  scannerCloseCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerViewport: {
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#122218',
    marginBottom: 16,
    position: 'relative',
  },
  scannerCamera: {
    flex: 1,
  },
  scannerOverlayFrame: {
    ...StyleSheet.absoluteFillObject,
    margin: 26,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#4BA468',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 8,
  },
  capturedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 34, 24, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  capturedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    minWidth: 200,
    maxWidth: '90%',
  },
  capturedIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EDF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  capturedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2F5E38',
    marginBottom: 4,
  },
  capturedCodeText: {
    fontSize: 12,
    color: '#5F6A61',
  },
  scannerPrimaryBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#3F7652',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 34, 24, 0.55)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderTopWidth: 1,
    borderColor: '#E5EAE0',
  },
  modalTitle: {
    fontSize: 17,
    marginBottom: 14,
    color: '#18221B',
  },
  textBold: {
    fontWeight: '700',
    color: '#18221B',
  },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2EB',
  },
  checkinColumn: {
    flex: 1,
  },
  emptyColumn: {
    flex: 1,
  },
  modalContent: {
    fontSize: 13.5,
    color: '#5F6A61',
    marginTop: 2,
  },
});
