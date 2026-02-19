import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const Container = styled.View`
  flex: 1;
  background-color: #FAFAFA;
`;

export const HeaderContainer = styled.View`
  background-color: #FFFFFF;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

export const WelcomeSection = styled.View`
  padding: 24px 20px 16px 20px;
  background-color: #FFFFFF;
`;

export const WelcomeText = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 4px;
  font-family: 'Ubuntu-Bold';
`;

export const SubtitleText = styled.Text`
  font-size: 16px;
  color: #666666;
  font-weight: 400;
  font-family: 'Ubuntu-Regular';
`;

export const SearchContainer = styled.View`
  padding: 0 20px 20px 20px;
  background-color: #FFFFFF;
`;

export const SearchInput = styled.TextInput`
  height: 48px;
  background-color: #F5F5F5;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  color: #333333;
  border: 1px solid #E0E0E0;
  font-family: 'Ubuntu-Regular';
`;

export const FilterContainer = styled.View`
  margin: 16px 0;
  height: 50px;
`;

export const FilterButton = styled.TouchableOpacity`
  background-color: ${props => props.active ? '#07814F' : '#FFFFFF'};
  border: 1px solid ${props => props.active ? '#07814F' : '#E0E0E0'};
  border-radius: 25px;
  padding: 12px 20px;
  margin-right: 12px;
  height: 44px;
  justify-content: center;
  align-items: center;
  elevation: ${props => props.active ? 3 : 1};
  shadow-color: ${props => props.active ? '#07814F' : '#000'};
  shadow-offset: 0px 2px;
  shadow-opacity: ${props => props.active ? 0.2 : 0.1};
  shadow-radius: 4px;
`;

export const FilterText = styled.Text`
  color: ${props => props.active ? '#FFFFFF' : '#666666'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  font-family: 'Ubuntu-Medium';
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px 20px;
`;

export const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: 700;
  color: #1A1A1A;
  font-family: 'Ubuntu-Bold';
`;

export const ViewAllButton = styled.TouchableOpacity`
  padding: 8px 12px;
`;

export const ViewAllText = styled.Text`
  color: #07814F;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Ubuntu-Medium';
`;

export const EventsContainer = styled.View`
  flex: 1;
  min-height: 200px;
`;

export const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  min-height: 200px;
`;

export const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #999999;
  text-align: center;
  font-family: 'Ubuntu-Regular';
  line-height: 24px;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FAFAFA;
`;

// Estilos adicionais para melhorar a experiência
export const EventCard = styled.View`
  width: ${width * 0.75}px;
  margin-right: 16px;
  background-color: #FFFFFF;
  border-radius: 16px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  overflow: hidden;
`;

export const EventImage = styled.Image`
  width: 100%;
  height: 140px;
  background-color: #F0F0F0;
`;

export const EventContent = styled.View`
  padding: 16px;
`;

export const EventTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
  font-family: 'Ubuntu-Medium';
`;

export const EventDescription = styled.Text`
  font-size: 14px;
  color: #666666;
  line-height: 20px;
  margin-bottom: 12px;
  font-family: 'Ubuntu-Regular';
`;

export const EventDate = styled.Text`
  font-size: 12px;
  color: #07814F;
  font-weight: 500;
  font-family: 'Ubuntu-Medium';
`;

export const EventBadge = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #07814F;
  border-radius: 12px;
  padding: 4px 8px;
`;

export const EventBadgeText = styled.Text`
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Ubuntu-Medium';
`;

// Componentes para animações e transições
export const AnimatedContainer = styled.View`
  opacity: 1;
  transform: translateY(0px);
`;

export const GradientOverlay = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(0,0,0,0.3));
`;

// Estilos para estados de carregamento
export const SkeletonCard = styled.View`
  width: ${width * 0.75}px;
  height: 200px;
  margin-right: 16px;
  background-color: #F0F0F0;
  border-radius: 16px;
  overflow: hidden;
`;

export const SkeletonImage = styled.View`
  width: 100%;
  height: 140px;
  background-color: #E0E0E0;
`;

export const SkeletonContent = styled.View`
  padding: 16px;
`;

export const SkeletonLine = styled.View`
  height: 12px;
  background-color: #E0E0E0;
  border-radius: 6px;
  margin-bottom: 8px;
  width: ${props => props.width || '100%'};
`;

// Estilos para acessibilidade
export const AccessibleButton = styled.TouchableOpacity`
  min-height: 44px;
  min-width: 44px;
  justify-content: center;
  align-items: center;
`;

export const AccessibleText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: #1A1A1A;
  font-family: 'Ubuntu-Regular';
`;
