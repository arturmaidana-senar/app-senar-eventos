import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const fallbackImages = [
  'https://images.unsplash.com/photo-1594498653385-d5172c532c00?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511225070737-5af5ac9a690d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534143003024-db5e42d76de8?q=80&w=400&auto=format&fit=crop',
];

const CardEvent = ({
  item,
  imageBaseUrl = 'https://eventos.senarmt.org.br/storage/',
}) => {
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

  const fallbackImage = fallbackImages[(item.id || 0) % fallbackImages.length];
  const imageSource = item.image
    ? { uri: `${imageBaseUrl}${item.image}` }
    : { uri: fallbackImage };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EventShow', { eventId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <View style={styles.badge}>
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

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <Feather name="chevron-right" size={20} color="#D3D3D3" />
        </View>

        <View style={styles.infoRow}>
          <Feather
            name="map-pin"
            size={14}
            color="#4A9954"
            style={styles.icon}
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.name_location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Feather
            name="calendar"
            size={14}
            color="#8A8A8A"
            style={styles.icon}
          />
          <Text style={styles.infoText}>{displayDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
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
  contentContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
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
});

export default CardEvent;
