import React, { useContext, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../../contexts/auth';
import Header from '../../components/Ui/Header';
import Help from '../../components/Ui/Help';
import api from './../../services/endpont';
import LoadingInfo from '../../components/Ui/LoadingInfo';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export const Body = styled.View`
  flex: 1;
  background-color: #f8f8f8;
`;

// Container para o ScrollView
const Container = styled(ScrollView)`
  flex: 1;
  background-color: #fafafa;
  padding: 16px;
`;

// Componente para os Cards
const Card = styled.TouchableOpacity`
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: center;
`;

// Container do texto dentro do Card
const CardTextContainer = styled.View`
  flex: 1;
  margin-left: 16px;
`;

// Título do Card
const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #2b9348;
`;

// Descrição do Card
const CardDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const Information = () => {
  const { logoff } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalHelpVisible, setModalHelpVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameProfile, setNameProfile] = useState('');
  const cardData = [
    {
      title: 'Ajuda',
      description: 'Dúvidas mais frequentes sobre o Senar Atendimento.',
      icon: 'help-outline',
    },
    {
      title: 'Sair',
      description:
        'Obrigado por usar nosso aplicativo! Esperamos vê-lo de volta em breve.',
      icon: 'account-balance-wallet',
    },
  ];

  async function handleProfile() {
    try {
      setLoading(true);
      const response = await api.getProfile();
      setLoading(false);
      if (response.error) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: response.message,
          button: 'Fechar',
        });
      }
      setNameProfile(response.nameProfile);
      setModalVisible(true);
    } catch (error) {
      return Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: error,
        button: 'Fechar',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleCardPress = index => {
    if (index == 1) {
      Alert.alert('Confirmação', 'Tem certeza que deseja sair?', [
        { text: 'Sim', onPress: () => logoff() },
        { text: 'Cancelar', onPress: null, styled: 'cancel' },
      ]);

      // logoff();
    } else if (index == 0) {
      setModalHelpVisible(true);
    }
  };

  return (
    <Body>
      <Header />
      <LoadingInfo visible={loading} />
      <Container>
        {cardData.map((card, index) => (
          <Card key={index} onPress={() => handleCardPress(index)}>
            <Icon name={card.icon} size={24} color="#37C064" />
            <CardTextContainer>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardTextContainer>
          </Card>
        ))}
        <Help
          visible={modalHelpVisible}
          onClose={() => setModalHelpVisible(false)}
        />
      </Container>
    </Body>
  );
};

export default Information;
