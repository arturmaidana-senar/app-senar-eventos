import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import {
  CardContainer,
  CardImage,
  CardContent,
  CardTitle,
  CardDescription,
  CardDate,
  CardBadge,
  CardBadgeText,
  GradientOverlay,
  CardFooter,
  ParticipantsInfo,
  ParticipantsText,
  StatusIndicator,
  PriceContainer,
  PriceText,
  ActionButton,
  ActionButtonText
} from './styles_modern';

const { width } = Dimensions.get('window');

export default function CardHome({ item, onPress }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    
    const date = new Date(dateString);
    const options = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      locale: 'pt-BR'
    };
    
    return date.toLocaleDateString('pt-BR', options);
  };

  const getEventStatus = (dateString) => {
    if (!dateString) return 'indefinido';
    
    const eventDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    if (eventDay > today) return 'proximo';
    if (eventDay.getTime() === today.getTime()) return 'hoje';
    return 'finalizado';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'proximo': return 'Próximo';
      case 'hoje': return 'Hoje';
      case 'finalizado': return 'Finalizado';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'proximo': return '#07814F';
      case 'hoje': return '#FF6B35';
      case 'finalizado': return '#666666';
      default: return '#999999';
    }
  };

  const status = getEventStatus(item.date);
  const statusText = getStatusText(status);
  const statusColor = getStatusColor(status);

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <CardContainer onPress={handlePress} activeOpacity={0.8}>
 
      {/* <CardImage
        source={
          item.image 
            ? { uri: item.image }
            : require('../../assets/images/logo_home.png')
        }
        resizeMode="cover"
      >
 
        {statusText && (
          <CardBadge backgroundColor={statusColor}>
            <CardBadgeText>{statusText}</CardBadgeText>
          </CardBadge>
        )}
 
        <GradientOverlay />
      </CardImage> */}

      {/* Conteúdo do card */}
      <CardContent>
        {/* Título e descrição */}
        <CardTitle numberOfLines={2}>
          {item.title || 'Evento sem título'}
        </CardTitle>
        
        <CardDescription numberOfLines={3}>
          {item.description || 'Descrição não disponível'}
        </CardDescription>

        {/* Informações adicionais */}
        <CardFooter>
          <View style={{ flex: 1 }}>
            <CardDate>
              📅 {formatDate(item.date)}
            </CardDate>
            
            {item.location && (
              <ParticipantsInfo>
                📍 {item.location}
              </ParticipantsInfo>
            )}
            
            {item.participants && (
              <ParticipantsInfo>
                <ParticipantsText>
                  👥 {item.participants} participantes
                </ParticipantsText>
              </ParticipantsInfo>
            )}
          </View>

          {/* Preço ou botão de ação */}
          <View style={{ alignItems: 'flex-end' }}>
            {item.price ? (
              <PriceContainer>
                <PriceText>
                  {item.price === 0 || item.price === '0' ? 'Gratuito' : `R$ ${item.price}`}
                </PriceText>
              </PriceContainer>
            ) : (
              <ActionButton>
                <ActionButtonText>Ver mais</ActionButtonText>
              </ActionButton>
            )}
          </View>
        </CardFooter>

        {/* Indicador de status */}
        <StatusIndicator color={statusColor} />
      </CardContent>
    </CardContainer>
  );
}
