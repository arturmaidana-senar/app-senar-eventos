import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
 
export const Body = styled.View`
  flex: 1;
  background-color: #F8F8F8;
`;

// Container para o ScrollView
const Container = styled(ScrollView)`
	flex: 1;
	background-color: #FAFAFA;
	padding: 0px;
`;

// Componente para os Cards
const Card = styled.View`
  	background-color: white;
	padding: 16px;
	border-radius: 8px;
	margin-bottom: 16px;
	flex-direction: row;
	align-items: center;
	height: 100px;
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
	color: #2B9348;
`;

// Descrição do Card
const CardDescription = styled.Text`
	font-size: 16px;
	color: #666;
	margin-top: 4px;
`;


const CardNotEvent = () => {

  return (
    <Body>
        <Container>
                <Card>
                    <Icon name="info" size={32} color="#37C064" style={{ marginTop: 5 }} />
                    <CardTextContainer>
                        <CardDescription>Nenhum evento...</CardDescription>
                    </CardTextContainer>
                </Card>
        </Container>
    </Body>
  );
};

export default CardNotEvent;
