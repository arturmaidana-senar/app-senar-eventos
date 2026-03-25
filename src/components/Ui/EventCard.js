import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { formatDateEvent } from '../../utils/dateFormat';

const { width: screenWidth } = Dimensions.get('window');

const EventCard = ({
  event,
  onPress,
  imageBaseUrl = 'https://eventos.senarmt.org.br/storage/',
}) => {
  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Data não informada';

    const start = formatDateEvent(startDate);
    const end = formatDateEvent(endDate);

    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPlainTextFromHtml = html => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {event.image ? (
          <Image
            source={{ uri: `${imageBaseUrl}${event.image}` }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📅</Text>
          </View>
        )}

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: event.status === '1' ? '#10B981' : '#EF4444' },
          ]}
        >
          <Text style={styles.statusText}>
            {event.status === '1' ? 'Ativo' : 'Inativo'}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.name}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>
            {formatEventDate(event.started_at, event.ended_at)}
          </Text>
        </View>

        {event.name_location && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText} numberOfLines={1}>
              {event.name_location} - {event.cidade}/{event.sigla}
            </Text>
          </View>
        )}

        {event.subject && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📋</Text>
            <Text style={styles.infoText} numberOfLines={1}>
              {event.subject}
            </Text>
          </View>
        )}

        {event.description && (
          <Text style={styles.descriptionPreview} numberOfLines={2}>
            {truncateText(getPlainTextFromHtml(event.description))}
          </Text>
        )}

        <View style={styles.footer}>
          {event.number_max && parseInt(event.number_max) > 0 && (
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>
                👥 {event.number_max} vagas
              </Text>
            </View>
          )}

          {event.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  descriptionPreview: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  capacityBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  capacityText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
});

export default EventCard;
