import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Calendar, ChevronRight } from 'lucide-react-native';

const CardEvent = ({ item }) => {
  const navigation = useNavigation();

  const formatDateObj = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const currentDate = new Date();
  const eventDate = new Date(item.ended_at || item.started_at);
  const isRealizado = currentDate > eventDate;

  const status = isRealizado ? 'REALIZADO' : 'AGUARDANDO';
  const startDate = formatDateObj(item.started_at);
  const endDate = formatDateObj(item.ended_at);

  let displayDate = startDate;
  if (endDate && startDate !== endDate) {
    displayDate = `${startDate} — ${endDate}`;
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EventShow', { eventId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>

        <View
          style={[
            styles.badge,
            isRealizado ? styles.badgeRealizado : styles.badgeAguardando,
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              isRealizado ? styles.dotRealizado : styles.dotAguardando,
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              isRealizado ? styles.textRealizado : styles.textAguardando,
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MapPin size={14} color="#4A9954" style={styles.icon} />
        <Text style={styles.infoText} numberOfLines={1}>
          {item.name_location}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Calendar
          size={14}
          color="#8A8A8A"
          style={styles.icon}
        />
        <Text style={styles.infoText}>{displayDate}</Text>
      </View>

      <ChevronRight
        size={20}
        color="#D3D3D3"
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeRealizado: {
    backgroundColor: '#E8F5E9',
  },
  badgeAguardando: {
    backgroundColor: '#FFF8E1',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotRealizado: {
    backgroundColor: '#4CAF50',
  },
  dotAguardando: {
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  textRealizado: {
    color: '#4CAF50',
  },
  textAguardando: {
    color: '#D97706',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 24,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6A737D',
  },
  chevronIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -2,
  },
});

export default CardEvent;
