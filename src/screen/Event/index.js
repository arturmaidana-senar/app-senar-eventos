import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/endpont';
import { formatDateEvent } from '../../utils/dateFormat';
import TicketCard3D from '../../components/Ui/TicketCard3D';

const MONTHS_FULL = [
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

function TicketIcon({ color = '#2F5E38', size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 5v2m0 4v2m0 4v2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function Event() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [tickets, setTickets] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('proximos'); // 'proximos' | 'realizados'
  const [selectedTicket, setSelectedTicket] = useState(null);

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
      console.error('Erro ao ler AsyncStorage em Ingressos:', error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const response = await api.getParticipantEvents();
      const list = Array.isArray(response?.data) ? response.data : [];
      setTickets(list);
    } catch (error) {
      console.error('Erro ao buscar ingressos do participante:', error);
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    fetchTickets();
  }, [loadUser, fetchTickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
  };

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const { proximosTickets, realizadosTickets } = useMemo(() => {
    const now = new Date();
    const proximos = [];
    const realizados = [];

    tickets.forEach(item => {
      const endRef = new Date(item.ended_at || item.started_at);
      if (!isNaN(endRef.getTime()) && now > endRef) {
        realizados.push(item);
      } else {
        proximos.push(item);
      }
    });

    proximos.sort(
      (a, b) =>
        new Date(a.started_at || 0).getTime() -
        new Date(b.started_at || 0).getTime(),
    );

    realizados.sort(
      (a, b) =>
        new Date(b.ended_at || b.started_at || 0).getTime() -
        new Date(a.ended_at || a.started_at || 0).getTime(),
    );

    return { proximosTickets: proximos, realizadosTickets: realizados };
  }, [tickets]);

  const displayedTickets =
    activeTab === 'proximos' ? proximosTickets : realizadosTickets;

  const formatPeriod = (startStr, endStr) => {
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return 'Data a confirmar';

    const startDay = start.getDate();
    const startMonth = MONTHS_FULL[start.getMonth()];
    const startYear = start.getFullYear();

    if (!endStr) {
      return `${startDay} de ${startMonth}, ${startYear}`;
    }

    const end = new Date(endStr);
    if (isNaN(end.getTime())) {
      return `${startDay} de ${startMonth}, ${startYear}`;
    }

    const endDay = end.getDate();
    const endMonth = MONTHS_FULL[end.getMonth()];
    const endYear = end.getFullYear();

    if (
      startDay === endDay &&
      start.getMonth() === end.getMonth() &&
      startYear === endYear
    ) {
      return `${startDay} de ${startMonth}, ${startYear}`;
    }

    if (start.getMonth() === end.getMonth() && startYear === endYear) {
      return `${startDay} a ${endDay} de ${startMonth}, ${startYear}`;
    }

    return `${startDay} de ${startMonth} a ${endDay} de ${endMonth}, ${endYear}`;
  };

  const getTicketStatus = item => {
    const hasCheckin = Boolean(item?.date_time_confirmation);
    const endRef = new Date(item?.ended_at || item?.started_at);
    const isPast = !isNaN(endRef.getTime()) && new Date() > endRef;

    if (hasCheckin) {
      return {
        label: 'CHECK-IN REALIZADO',
        pillLabel: 'Check-in realizado',
        color: '#2F5E38',
        bg: '#E3EFE6',
      };
    }

    if (isPast) {
      return {
        label: 'EVENTO REALIZADO',
        pillLabel: 'Evento realizado',
        color: '#6E786F',
        bg: '#ECEFE9',
      };
    }

    return {
      label: 'AGUARDANDO CHECK-IN',
      pillLabel: 'Inscrição confirmada',
      color: '#9A7422',
      bg: '#F5EFE0',
    };
  };

  const formatLocation = item => {
    const parts = [];
    if (item?.name_location) parts.push(item.name_location);
    if (item?.cidade) {
      parts.push(item.estado ? `${item.cidade}, ${item.estado}` : item.cidade);
    }
    return parts.join(' · ') || 'Local a definir';
  };

  const renderTicketCard = (item, index) => {
    const status = getTicketStatus(item);
    const key = item.participant_id
      ? `ticket-${item.participant_id}`
      : `event-${item.id}-${index}`;

    return (
      <TicketCard3D
        key={key}
        item={item}
        index={index}
        userName={userName}
        status={status}
        locationText={formatLocation(item)}
        onPress={() => setSelectedTicket(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={true}
        barStyle="dark-content"
        backgroundColor="#F6F7F2"
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.breadcrumbRow}>
          <Text style={styles.breadcrumbMuted}>Meu Senar</Text>
          <Text style={styles.breadcrumbSlash}> / </Text>
          <Text style={styles.breadcrumbActive}>Meus ingressos</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={() => navigation.navigate('Information')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{getInitials(userName)}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 92 },
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
        {/* Header / Greeting */}
        <View style={styles.headerSection}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>
              CONEXÕES QUE CULTIVAM O FUTURO
            </Text>
          </View>

          <Text style={styles.pageTitle}>Boas experiências te esperam.</Text>
          <Text style={styles.pageSubtitle}>
            Seus eventos e ingressos, sempre à mão.
          </Text>
        </View>

        {/* Underline Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'proximos' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('proximos')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'proximos' && styles.tabLabelActive,
              ]}
            >
              Próximos
            </Text>
            <View
              style={[
                styles.tabCountBadge,
                activeTab === 'proximos' && styles.tabCountBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  activeTab === 'proximos' && styles.tabCountTextActive,
                ]}
              >
                {proximosTickets.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'realizados' && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab('realizados')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'realizados' && styles.tabLabelActive,
              ]}
            >
              Realizados
            </Text>
            <View
              style={[
                styles.tabCountBadge,
                activeTab === 'realizados' && styles.tabCountBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  activeTab === 'realizados' && styles.tabCountTextActive,
                ]}
              >
                {realizadosTickets.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* List / Loading / Empty */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2F5E38" />
            <Text style={styles.loadingText}>Carregando seus ingressos...</Text>
          </View>
        ) : displayedTickets.length > 0 ? (
          <View style={styles.listContainer}>
            {displayedTickets.map(renderTicketCard)}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <TicketIcon color="#2F5E38" size={24} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'proximos'
                ? 'Nenhum ingresso próximo'
                : 'Nenhum evento realizado'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'proximos'
                ? 'Quando você estiver inscrito em um evento futuro, seu ingresso aparecerá aqui.'
                : 'Seus ingressos de eventos já encerrados ou com check-in concluído ficarão listados aqui.'}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerQuoteRow}>
            <Feather name="feather" size={14} color="#7A847B" />
            <Text style={styles.footerQuote}>
              Cultivando conhecimento. Transformando vidas.
            </Text>
          </View>
          <Text style={styles.footerMeta}>
            Senar Mato Grosso · Juntos pelo campo.
          </Text>
        </View>
      </ScrollView>

      {/* Ticket Detail Modal */}
      <Modal
        visible={Boolean(selectedTicket)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTicket(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedTicket &&
              (() => {
                const status = getTicketStatus(selectedTicket);
                return (
                  <>
                    <View style={styles.modalHeader}>
                      <View style={styles.modalHeaderLeft}>
                        <View style={styles.modalTicketIconBox}>
                          <TicketIcon color="#2F5E38" size={18} />
                        </View>
                        <Text style={styles.modalEyebrow}>MEU INGRESSO</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.modalCloseIcon}
                        onPress={() => setSelectedTicket(null)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Feather name="x" size={20} color="#6E786F" />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={[
                        styles.modalStatusPill,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: status.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.modalStatusText,
                          { color: status.color },
                        ]}
                      >
                        {status.pillLabel}
                      </Text>
                    </View>

                    <Text style={styles.modalTitle}>{selectedTicket.name}</Text>

                    <View style={styles.modalInfoList}>
                      <View style={styles.modalInfoRow}>
                        <Feather name="user" size={15} color="#2F5E38" />
                        <Text style={styles.modalInfoText}>
                          {userName || 'Participante'}
                        </Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <Feather name="calendar" size={15} color="#2F5E38" />
                        <Text style={styles.modalInfoText}>
                          {selectedTicket.started_at
                            ? formatDateEvent(selectedTicket.started_at)
                            : formatPeriod(
                                selectedTicket.started_at,
                                selectedTicket.ended_at,
                              )}
                        </Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <Feather name="map-pin" size={15} color="#2F5E38" />
                        <Text style={styles.modalInfoText}>
                          {formatLocation(selectedTicket)}
                        </Text>
                      </View>

                      {selectedTicket.date_time_confirmation ? (
                        <View style={styles.modalInfoRow}>
                          <Feather
                            name="check-circle"
                            size={15}
                            color="#2F5E38"
                          />
                          <Text style={styles.modalInfoText}>
                            Check-in em{' '}
                            {formatDateEvent(
                              selectedTicket.date_time_confirmation,
                            )}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.ticketPassDivider}>
                      <View style={styles.passNotchLeft} />
                      <View style={styles.passDashedLine} />
                      <View style={styles.passNotchRight} />
                    </View>

                    <View style={styles.ticketCodeBox}>
                      <Text style={styles.ticketCodeLabel}>
                        CÓDIGO DA INSCRIÇÃO
                      </Text>
                      <Text style={styles.ticketCodeValue}>
                        #{selectedTicket.participant_id || selectedTicket.id}
                      </Text>
                      {selectedTicket.participant_uuid ? (
                        <Text style={styles.ticketUuidText} numberOfLines={1}>
                          {selectedTicket.participant_uuid}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.modalPrimaryBtn}
                        activeOpacity={0.85}
                        onPress={() => {
                          const eventId = selectedTicket.id;
                          setSelectedTicket(null);
                          navigation.navigate('EventShow', { eventId });
                        }}
                      >
                        <Text style={styles.modalPrimaryBtnText}>
                          Ver detalhes do evento
                        </Text>
                        <Feather name="arrow-right" size={16} color="#FFFFFF" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalSecondaryBtn}
                        activeOpacity={0.8}
                        onPress={() => setSelectedTicket(null)}
                      >
                        <Text style={styles.modalSecondaryBtnText}>Fechar</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              })()}
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
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
    color: '#7D877E',
    fontWeight: '500',
  },
  breadcrumbSlash: {
    fontSize: 13,
    color: '#A5AEA5',
  },
  breadcrumbActive: {
    fontSize: 13,
    color: '#1E2A21',
    fontWeight: '700',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF1E6',
    borderWidth: 1,
    borderColor: '#D6DFCA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F5E38',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    marginBottom: 22,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#67996B',
    marginRight: 8,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#677468',
  },
  pageTitle: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '800',
    color: '#18221B',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6E786F',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAE0',
    marginBottom: 20,
    gap: 24,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
    gap: 8,
  },
  tabButtonActive: {
    borderBottomColor: '#2F5E38',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7A847B',
  },
  tabLabelActive: {
    color: '#18221B',
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: '#ECEFE9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tabCountBadgeActive: {
    backgroundColor: '#E3EFE6',
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E786F',
  },
  tabCountTextActive: {
    color: '#2F5E38',
  },
  listContainer: {
    gap: 14,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  dateBox: {
    width: 58,
    height: 66,
    borderRadius: 14,
    backgroundColor: '#EDF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F5E38',
    lineHeight: 26,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C6C5D',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  ticketMain: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18221B',
    lineHeight: 22,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    flex: 1,
    fontSize: 12.5,
    color: '#6E786F',
  },
  ticketCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFF2EB',
  },
  ticketCodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A847B',
  },
  ticketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE2D6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  ticketButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18221B',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6E786F',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EDF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18221B',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6E786F',
    textAlign: 'center',
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5EAE0',
  },
  footerQuoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  footerQuote: {
    fontSize: 13,
    color: '#6E786F',
    fontWeight: '500',
  },
  footerMeta: {
    fontSize: 12,
    color: '#8D968E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 30, 21, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTicketIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EDF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#677468',
  },
  modalCloseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6F7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStatusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  modalStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18221B',
    lineHeight: 26,
    marginBottom: 16,
  },
  modalInfoList: {
    gap: 10,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 13.5,
    color: '#465248',
    fontWeight: '500',
  },
  ticketPassDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    marginHorizontal: -22,
  },
  passNotchLeft: {
    width: 14,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(18, 30, 21, 0.55)',
  },
  passDashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#DCE2D6',
    marginHorizontal: 8,
  },
  passNotchRight: {
    width: 14,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: 'rgba(18, 30, 21, 0.55)',
  },
  ticketCodeBox: {
    backgroundColor: '#F6F7F2',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5EAE0',
    marginBottom: 18,
  },
  ticketCodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A847B',
    marginBottom: 4,
  },
  ticketCodeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F5E38',
    letterSpacing: 0.5,
  },
  ticketUuidText: {
    marginTop: 4,
    fontSize: 11,
    color: '#7A847B',
  },
  modalActions: {
    gap: 10,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2F5E38',
    borderRadius: 14,
    paddingVertical: 13,
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSecondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7F2',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#465248',
  },
});
