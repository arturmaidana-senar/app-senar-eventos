import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const CardHome = ({ item }) => {
  const navigation = useNavigation();

  const formatDateTime = dateString => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  };

  const currentDate = new Date();
  const eventDate = new Date(item.ended_at || item.started_at);
  const isRealizado = currentDate > eventDate;

  const status = isRealizado ? 'REALIZADO' : 'AGUARDANDO';
  const statusColor = isRealizado ? '#51A85A' : '#EBB455';
  const badgeBgColor = isRealizado ? '#E8F5E9' : '#FFF8E1';

  let displayDate = formatDateTime(item.started_at);
  if (!displayDate) {
    displayDate = `${item?.date || '00/00/0000'} às ${item?.time || '00:00'}`;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Service', { eventId: item.id })}
      activeOpacity={0.8}
    >
      <View style={[styles.indicatorLine, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name || 'Nome do Evento'}
          </Text>

          <View style={[styles.badge, { backgroundColor: badgeBgColor }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={14} color="#A0A0A0" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.name_location || 'Local não informado'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="calendar" size={14} color="#A0A0A0" />
          <Text style={styles.infoText}>{displayDate}</Text>
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <Feather name="chevron-right" size={20} color="#C0C0C0" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  indicatorLine: {
    width: 4,
    borderRadius: 2,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3539',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#8A8A8A',
    marginLeft: 8,
    flex: 1,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
});

export default CardHome;
