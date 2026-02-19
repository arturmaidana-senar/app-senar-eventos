import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { formatDateEvent } from '../../utils/dateFormat'; // Assumindo que esta função existe
import EventDescription from '../EventDescription';

const { width: screenWidth } = Dimensions.get('window');

const EventDetailView = ({ 
  event, 
  imageBaseUrl = 'https://eventos.senarmt.org.br/storage/' // Configure com sua URL base
}) => {
  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando evento...</Text>
      </View>
    );
  }

  // Função para formatar a data de forma mais elegante
  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Data não informada';
    
    const start = formatDateEvent(startDate);
    const end = formatDateEvent(endDate);
    
    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Imagem principal do evento */}
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
            <Text style={styles.placeholderSubtext}>Imagem do evento</Text>
          </View>
        )}
        
        {/* Overlay com informações básicas */}
        {/* <View style={styles.imageOverlay}>
          <View style={[styles.statusBadge, { backgroundColor: event.status === '1' ? '#10B981' : '#EF4444' }]}>
            <Text style={styles.statusText}>
              {event.status === '1' ? 'Evento Ativo' : 'Evento Inativo'}
            </Text>
          </View>
        </View> */}
      </View>

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        {/* Título do evento */}
        <View style={styles.titleSection}>
          <Text style={styles.eventTitle}>{event.name}</Text>
        </View>

        {/* Informações principais em cards */}
        <View style={styles.infoCardsContainer}>
          {/* Card de Data */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Text style={styles.infoCardIcon}>📅</Text>
              <Text style={styles.infoCardTitle}>Data e Horário</Text>
            </View>
            <Text style={styles.infoCardContent}>
              {formatEventDate(event.started_at, event.ended_at)}
            </Text>
          </View>

          {/* Card de Local */}
          {event.name_location && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>📍</Text>
                <Text style={styles.infoCardTitle}>Local</Text>
              </View>
              <Text style={styles.infoCardContent}>
                {event.name_location}
              </Text>
              <Text style={styles.infoCardSubcontent}>
                {event.cidade}/{event.sigla}
              </Text>
            </View>
          )}

          {/* Card de Assunto */}
          {event.subject && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>📋</Text>
                <Text style={styles.infoCardTitle}>Assunto</Text>
              </View>
              <Text style={styles.infoCardContent}>
                {event.subject}
              </Text>
            </View>
          )}

          {/* Card de Categoria/Material */}
          {event.category && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>📚</Text>
                <Text style={styles.infoCardTitle}>Material</Text>
              </View>
              <Text style={styles.infoCardContent}>
                {event.category}
              </Text>
            </View>
          )}

          {/* Card de Capacidade */}
          {event.number_max && parseInt(event.number_max) > 0 && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>👥</Text>
                <Text style={styles.infoCardTitle}>Capacidade</Text>
              </View>
              <Text style={styles.infoCardContent}>
                {event.number_max} participantes
              </Text>
              {event.number_max_web && parseInt(event.number_max_web) > 0 && (
                <Text style={styles.infoCardSubcontent}>
                  {event.number_max_web} vagas online
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Descrição detalhada */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Sobre o Evento</Text>
            <EventDescription htmlContent={event.description} />
          </View>
        )}

        {/* Link online se disponível */}
        {event.link_online && (
          <View style={styles.linkSection}>
            <Text style={styles.sectionTitle}>Acesso Online</Text>
            <View style={styles.linkCard}>
              <Text style={styles.linkIcon}>🔗</Text>
              <Text style={styles.linkText} numberOfLines={1}>
                {event.link_online}
              </Text>
            </View>
          </View>
        )}

        {/* Espaçamento final */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
    opacity: 0.5,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6B7280',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
    textAlign: 'center',
  },
  infoCardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  infoCardContent: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 22,
  },
  infoCardSubcontent: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  linkSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  linkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#2563EB',
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default EventDetailView;

