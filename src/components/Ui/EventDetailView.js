import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDateEvent } from '../../utils/dateFormat';
import EventDescription from './EventDescription';

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

const EventDetailView = ({
  event,
  imageBaseUrl = 'https://eventos.senarmt.org.br/storage/',
}) => {
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [event?.image]);

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando evento...</Text>
      </View>
    );
  }

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Data não informada';
    const start = formatDateEvent(startDate);
    const end = formatDateEvent(endDate);
    if (start === end) return start;
    return `${start} — ${end}`;
  };

  const now = new Date();
  const startDate = event.started_at ? new Date(event.started_at) : null;
  const endDate = event.ended_at ? new Date(event.ended_at) : startDate;
  const hasValidStart = startDate && !isNaN(startDate.getTime());
  const hasValidEnd = endDate && !isNaN(endDate.getTime());

  const isRealizado = hasValidEnd && now > endDate;
  const isEmAndamento =
    hasValidStart && hasValidEnd && now >= startDate && now <= endDate;

  let statusLabel = 'Aguardando';
  let statusColor = '#C27803';
  if (isEmAndamento) {
    statusLabel = 'Em andamento';
    statusColor = '#2F7D4B';
  } else if (isRealizado) {
    statusLabel = 'Realizado';
    statusColor = '#4E5D52';
  }

  const dayBadge = hasValidStart
    ? String(startDate.getDate()).padStart(2, '0')
    : '--';
  const monthBadge = hasValidStart
    ? MONTHS_SHORT[startDate.getMonth()]
    : 'EVT';

  const hasCoverImage = Boolean(
    event?.image && String(event.image).trim().length > 0 && !imageError,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 36) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Cover */}
      <View style={styles.imageContainer}>
        {hasCoverImage ? (
          <Image
            source={{ uri: `${imageBaseUrl}${event.image}` }}
            style={styles.eventImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <LinearGradient
            colors={['#318C5A', '#2B7B4F', '#236841']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.placeholderGradient}
          >
            <View style={styles.coverRingDecor} />
            <Text style={styles.coverEyebrow}>SENAR MATO GROSSO</Text>
            <Text style={styles.coverTitle} numberOfLines={2}>
              {event.name}
            </Text>
          </LinearGradient>
        )}

        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>

        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeDay}>{dayBadge}</Text>
          <Text style={styles.dateBadgeMonth}>{monthBadge}</Text>
        </View>
      </View>

      {/* Main Content Sheet */}
      <View style={styles.contentContainer}>
        <View style={styles.titleSection}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>DETALHES DO EVENTO</Text>
          </View>
          <Text style={styles.eventTitle}>{event.name}</Text>
        </View>

        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={[styles.iconBox, { backgroundColor: '#EBF1E4' }]}>
              <Feather name="calendar" size={18} color="#2F5E38" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoCardLabel}>Data e Horário</Text>
              <Text style={styles.infoCardContent}>
                {formatEventDate(event.started_at, event.ended_at)}
              </Text>
            </View>
          </View>

          {event.name_location && (
            <View style={styles.infoCard}>
              <View style={[styles.iconBox, { backgroundColor: '#EBF1E4' }]}>
                <Feather name="map-pin" size={18} color="#2F5E38" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoCardLabel}>Local</Text>
                <Text style={styles.infoCardContent}>
                  {event.name_location}
                </Text>
                {(event.cidade || event.sigla) && (
                  <Text style={styles.infoCardSubcontent}>
                    {event.cidade}
                    {event.sigla ? `/${event.sigla}` : ''}
                  </Text>
                )}
              </View>
            </View>
          )}

          {event.subject && (
            <View style={styles.infoCard}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF3FB' }]}>
                <Feather name="file-text" size={18} color="#2563EB" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoCardLabel}>Assunto</Text>
                <Text style={styles.infoCardContent}>{event.subject}</Text>
              </View>
            </View>
          )}

          {event.category && (
            <View style={styles.infoCard}>
              <View style={[styles.iconBox, { backgroundColor: '#FDF3E7' }]}>
                <Feather name="book-open" size={18} color="#D97706" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoCardLabel}>Material</Text>
                <Text style={styles.infoCardContent}>{event.category}</Text>
              </View>
            </View>
          )}

          {event.number_max && parseInt(event.number_max, 10) > 0 && (
            <View style={styles.infoCard}>
              <View style={[styles.iconBox, { backgroundColor: '#F3EEFC' }]}>
                <Feather name="users" size={18} color="#6D28D9" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoCardLabel}>Capacidade</Text>
                <Text style={styles.infoCardContent}>
                  {event.number_max} participantes
                </Text>
                {event.number_max_web &&
                  parseInt(event.number_max_web, 10) > 0 && (
                    <Text style={styles.infoCardSubcontent}>
                      {event.number_max_web} vagas online
                    </Text>
                  )}
              </View>
            </View>
          )}
        </View>

        {event.description && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Sobre o Evento</Text>
            <View style={styles.descriptionCard}>
              <EventDescription htmlContent={event.description} />
            </View>
          </View>
        )}

        {event.link_online && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Acesso Online</Text>
            <View style={styles.infoCard}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF3FB' }]}>
                <Feather name="link" size={18} color="#2563EB" />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {event.link_online}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F7F2',
  },
  loadingText: {
    fontSize: 15,
    color: '#6B776D',
  },
  imageContainer: {
    position: 'relative',
    height: 210,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    paddingBottom: 38,
    overflow: 'hidden',
  },
  coverRingDecor: {
    position: 'absolute',
    right: -36,
    top: -32,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 24,
    borderColor: 'rgba(181, 219, 108, 0.3)',
  },
  coverEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4ECD9',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EAF6E8',
    lineHeight: 26,
    paddingRight: 56,
  },
  statusPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#18221B',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    width: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  dateBadgeDay: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18221B',
    lineHeight: 17,
  },
  dateBadgeMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8D988E',
    marginTop: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F6F7F2',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 22,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 18,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#699B4E',
    marginRight: 7,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C8A78',
    letterSpacing: 1.2,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18221B',
    lineHeight: 28,
  },
  infoCardsContainer: {
    marginBottom: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A867C',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardContent: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#18221B',
    lineHeight: 20,
  },
  infoCardSubcontent: {
    fontSize: 12.5,
    color: '#6B776D',
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 10,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});

export default EventDetailView;
