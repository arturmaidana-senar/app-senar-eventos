import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const CardContainer = styled.TouchableOpacity`
  width: ${width * 0.9}px;
  margin-right: 0px;
  background-color: #FFFFFF;
  border-radius: 20px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.12;
  shadow-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
`;

export const CardImage = styled.ImageBackground`
  width: 100%;
  height: 160px;
  position: relative;
  background-color: #F0F0F0;
`;

export const CardBadge = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: ${props => props.backgroundColor || '#07814F'};
  border-radius: 16px;
  padding: 6px 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`;

export const CardBadgeText = styled.Text`
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Ubuntu-Medium';
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const GradientOverlay = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, rgba(0,0,0,0.2));
`;

export const CardContent = styled.View`
  padding: 18px;
  position: relative;
`;

export const CardTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
  line-height: 24px;
  font-family: 'Ubuntu-Bold';
`;

export const CardDescription = styled.Text`
  font-size: 14px;
  color: #666666;
  line-height: 20px;
  margin-bottom: 16px;
  font-family: 'Ubuntu-Regular';
`;

export const CardFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

export const CardDate = styled.Text`
  font-size: 13px;
  color: #07814F;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: 'Ubuntu-Medium';
`;

export const ParticipantsInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
`;

export const ParticipantsText = styled.Text`
  font-size: 12px;
  color: #888888;
  font-family: 'Ubuntu-Regular';
`;

export const PriceContainer = styled.View`
  background-color: #F8F9FA;
  border: 1px solid #E9ECEF;
  border-radius: 12px;
  padding: 8px 12px;
`;

export const PriceText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #07814F;
  font-family: 'Ubuntu-Medium';
`;

export const ActionButton = styled.TouchableOpacity`
  background-color: #07814F;
  border-radius: 12px;
  padding: 8px 16px;
  elevation: 2;
  shadow-color: #07814F;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`;

export const ActionButtonText = styled.Text`
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Ubuntu-Medium';
`;

export const StatusIndicator = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: ${props => props.color || '#07814F'};
`;

// Componentes para estados especiais
export const LoadingCard = styled.View`
  width: ${width * 0.75}px;
  margin-right: 16px;
  background-color: #FFFFFF;
  border-radius: 20px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  overflow: hidden;
`;

export const LoadingImage = styled.View`
  width: 100%;
  height: 160px;
  background-color: #F0F0F0;
`;

export const LoadingContent = styled.View`
  padding: 18px;
`;

export const LoadingLine = styled.View`
  height: 12px;
  background-color: #E0E0E0;
  border-radius: 6px;
  margin-bottom: 8px;
  width: ${props => props.width || '100%'};
`;

// Componentes para animações
export const AnimatedCard = styled.View`
  transform: scale(1);
  opacity: 1;
`;

export const HoverEffect = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(7, 129, 79, 0.05);
  opacity: 0;
`;

// Componentes para diferentes tipos de eventos
export const EventTypeIcon = styled.View`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
  align-items: center;
`;

export const EventTypeText = styled.Text`
  font-size: 16px;
`;

// Componentes para favoritos
export const FavoriteButton = styled.TouchableOpacity`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
  align-items: center;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

export const FavoriteIcon = styled.Text`
  font-size: 18px;
  color: ${props => props.isFavorite ? '#FF6B6B' : '#999999'};
`;

// Componentes para informações extras
export const ExtraInfo = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
`;

export const InfoIcon = styled.Text`
  font-size: 12px;
  margin-right: 4px;
`;

export const InfoText = styled.Text`
  font-size: 12px;
  color: #888888;
  font-family: 'Ubuntu-Regular';
`;

// Componentes para tags
export const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: 8px;
`;

export const Tag = styled.View`
  background-color: #F0F8F4;
  border: 1px solid #C8E6C9;
  border-radius: 12px;
  padding: 4px 8px;
  margin-right: 6px;
  margin-bottom: 4px;
`;

export const TagText = styled.Text`
  font-size: 10px;
  color: #07814F;
  font-weight: 500;
  font-family: 'Ubuntu-Medium';
`;
