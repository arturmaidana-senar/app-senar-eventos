import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

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

const CardHome = ({ item, variant = 'featured' }) => {
  const navigation = useNavigation();
  const imageBaseUrl = 'https://eventos.senarmt.org.br/storage/';

  const startDate = item.started_at ? new Date(item.started_at) : null;
  const endDate = item.ended_at ? new Date(item.ended_at) : startDate;
  const now = new Date();

  const hasValidStart = startDate && !isNaN(startDate.getTime());
  const hasValidEnd = endDate && !isNaN(endDate.getTime());

  const isRealizado = hasValidEnd && now > endDate;
  const isEmAndamento =
    hasValidStart && hasValidEnd && now >= startDate && now <= endDate;

  let statusLabel = 'Aguardando';
  let statusColor = '#C27803';
  let badgeBg = '#FEF6E7';

  if (isEmAndamento) {
    statusLabel = 'Em andamento';
    statusColor = '#2F7D4B';
    badgeBg = '#EAF5ED';
  } else if (isRealizado) {
    statusLabel = 'Realizado';
    statusColor = '#4E5D52';
    badgeBg = '#EFF2EE';
  }

  const dayBadge = hasValidStart
    ? String(startDate.getDate()).padStart(2, '0')
    : '--';
  const monthBadge = hasValidStart
    ? MONTHS_SHORT[startDate.getMonth()]
    : 'EVT';

  const formatFullDateRange = () => {
    if (!hasValidStart) {
      return `${item?.date || 'Data a definir'}${
        item?.time ? ` • ${item.time}` : ''
      }`;
    }
    const startDay = startDate.getDate();
    const startMonth = MONTHS_FULL[startDate.getMonth()];
    const startYear = startDate.getFullYear();

    if (
      hasValidEnd &&
      (startDate.getDate() !== endDate.getDate() ||
        startDate.getMonth() !== endDate.getMonth())
    ) {
      const endDay = endDate.getDate();
      const endMonth = MONTHS_FULL[endDate.getMonth()];
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDay} a ${endDay} de ${startMonth}, ${startYear}`;
      }
      return `${startDay} de ${startMonth} a ${endDay} de ${endMonth}, ${startYear}`;
    }

    const hours = String(startDate.getHours()).padStart(2, '0');
    const mins = String(startDate.getMinutes()).padStart(2, '0');
    return `${startDay} de ${startMonth}, ${startYear} • ${hours}:${mins}`;
  };

  // Extrai ano (ex: 2025) para estilizar o banner editorial quando não há imagem
  const eventName = item.name || 'Evento SENAR';
  const yearMatch = eventName.match(/\b(20\d{2})\b/);
  const eventYear = yearMatch ? yearMatch[1] : null;
  const cleanTitle = eventYear
    ? eventName.replace(eventYear, '').trim()
    : eventName;

  const handlePress = () => {
    navigation.navigate(isRealizado ? 'EventShow' : 'Service', {
      eventId: item.id,
    });
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.compactDateBox}>
          <Text style={styles.compactDay}>{dayBadge}</Text>
          <Text style={styles.compactMonth}>{monthBadge}</Text>
        </View>

        <View style={styles.compactContent}>
          <View style={styles.compactTopRow}>
            <View style={[styles.statusPill, { backgroundColor: badgeBg }]}>
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.compactTitle} numberOfLines={2}>
            {eventName}
          </Text>

          <View style={styles.infoRow}>
            <Feather name="map-pin" size={12} color="#7A867C" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.name_location || 'Local não informado'}
            </Text>
          </View>
        </View>

        <Feather name="arrow-right" size={18} color="#7A867C" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.coverContainer}>
        {item.image ? (
          <Image
            source={{ uri: `${imageBaseUrl}${item.image}` }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#318C5A', '#2B7B4F', '#236841']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverFallback}
          >
            <View style={styles.coverRingDecor} />

            <View style={styles.coverEditorialRow}>
              <View style={styles.coverEditorialLeft}>
                <Text style={styles.coverFallbackEyebrow}>
                  SENAR MATO GROSSO
                </Text>
                <Text style={styles.coverFallbackTitle} numberOfLines={2}>
                  {cleanTitle}.
                </Text>
              </View>

              {eventYear && (
                <View style={styles.coverYearCol}>
                  <Text style={styles.coverYearText}>
                    {eventYear.slice(0, 2)}
                  </Text>
                  <Text style={styles.coverYearText}>
                    {eventYear.slice(2, 4)}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.coverFallbackSub}>
              SENAR MATO GROSSO · CONHECIMENTO QUE TRANSFORMA
            </Text>
          </LinearGradient>
        )}

        <View style={styles.coverStatusPill}>
          <View
            style={[styles.statusDot, { backgroundColor: statusColor }]}
          />
          <Text style={styles.coverStatusText}>{statusLabel}</Text>
        </View>

        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeDay}>{dayBadge}</Text>
          <Text style={styles.dateBadgeMonth}>{monthBadge}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.categoryEyebrow}>EVENTO SENAR-MT</Text>
        <Text style={styles.title} numberOfLines={2}>
          {eventName}
        </Text>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={14} color="#8D988E" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.name_location || 'Local não informado'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="calendar" size={14} color="#8D988E" />
          <Text style={styles.infoText} numberOfLines={1}>
            {formatFullDateRange()}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerMeta}>
            <View style={styles.footerDot} />
            <Text style={styles.footerMetaText}>
              {isRealizado ? 'Ver detalhes do evento' : 'Presencial'}
            </Text>
          </View>
          <Feather name="arrow-right" size={17} color="#5B695D" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    overflow: 'hidden',
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  coverContainer: {
    height: 112,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverFallback: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 38,
    paddingBottom: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  coverRingDecor: {
    position: 'absolute',
    right: -30,
    top: -28,
    width: 115,
    height: 115,
    borderRadius: 57.5,
    borderWidth: 18,
    borderColor: 'rgba(181, 219, 108, 0.34)',
  },
  coverEditorialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  coverEditorialLeft: {
    flex: 1,
    marginRight: 10,
  },
  coverFallbackEyebrow: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#D4ECD9',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  coverFallbackTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EAF6E8',
    lineHeight: 20,
  },
  coverYearCol: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40,
  },
  coverYearText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D5DE6C',
    lineHeight: 18,
  },
  coverFallbackSub: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#AED6BA',
    letterSpacing: 1.1,
  },
  coverStatusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  coverStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2B4431',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  dateBadgeDay: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18221B',
    lineHeight: 16,
  },
  dateBadgeMonth: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#8D988E',
    marginTop: 1,
  },
  body: {
    padding: 13,
  },
  categoryEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8D988E',
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 8,
    lineHeight: 19,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B776D',
    marginLeft: 6,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFF2EC',
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#7B9467',
    marginRight: 7,
  },
  footerMetaText: {
    fontSize: 12,
    color: '#6B776D',
    fontWeight: '500',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  compactDateBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#EFF3E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactDay: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18221B',
  },
  compactMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C6B5E',
  },
  compactContent: {
    flex: 1,
    marginRight: 8,
  },
  compactTopRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 4,
  },
});

export default CardHome;
