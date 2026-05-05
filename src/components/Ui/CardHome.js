import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Calendar, ChevronRight } from 'lucide-react-native';

const CardEvent = ({ item }) => {
  const navigation = useNavigation();
  const imageBaseUrl = 'https://eventos.senarmt.org.br/storage/';

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
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: `${imageBaseUrl}${item.image}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Feather name="image" size={40} color="#E0E0E0" />
          </View>
        )}

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
        <Calendar size={14} color="#8A8A8A" style={styles.icon} />
        <Text style={styles.infoText}>{displayDate}</Text>
      </View>

      <ChevronRight size={20} color="#D3D3D3" style={styles.chevronIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F7F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  badgeRealizado: {
    // Styles for realizado badge background if needed
  },
  badgeAguardando: {
    // Styles for aguardando badge background if needed
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
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  textRealizado: {
    color: '#4CAF50',
  },
  textAguardando: {
    color: '#D97706',
  },
  content: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
    width: 14,
  },
  infoText: {
    fontSize: 13,
    color: '#6A737D',
    fontWeight: '500',
  },
  chevronContainer: {
    paddingLeft: 8,
  },
});

export default CardEvent;
