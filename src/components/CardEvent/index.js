import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { formatDate } from '../../utils/dateFormat';

import {
	Container,
	InfoContainer,
	Title,
	LocationContainer,
	LocationText,
	DateStatusContainer,
	DateContainer,
	DateText,
	StatusText,
} from './styles';

const CardHome = ({ item }) => {

	const navigation = useNavigation();

	const formatDate = (dateString) => {
		const date = new Date(dateString);
	  
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam de 0
		const year = date.getFullYear();
	  
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
	  
		return `${day}/${month}/${year} às ${hours}:${minutes}`;
	};

	const currentDate = new Date();
	const eventDate = new Date(item.ended_at);
	const status = currentDate > eventDate ? "Realizado" : "Aguardando";

	const formattedDate = formatDate(item.started_at);
	const formattedDateEnd = formatDate(item.ended_at);
	
	return (
		<TouchableOpacity onPress={ () => navigation.navigate('Service', { eventId: item.id }) }>
			<Container>
				<InfoContainer>
					<Title>{item.name}</Title>
					<LocationContainer>
						<Icon name="map-marker-alt" size={12} color="#007C6F" />
						<LocationText>{item.name_location}</LocationText>
					</LocationContainer>
					<DateStatusContainer>
						<DateContainer>
							<Icon name="calendar-alt" size={12} color="#6d6d6d" />
							<DateText>{formattedDate} até {formattedDateEnd}</DateText>
						</DateContainer>
						<StatusText>{status}</StatusText>
					</DateStatusContainer>
				</InfoContainer>
				<Icon name="angle-right" size={16} color="#37C064" />
			</Container>
		</TouchableOpacity>
	);
};


  

const styles = StyleSheet.create({
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    fontSize: 18,
  },
});

export default CardHome;