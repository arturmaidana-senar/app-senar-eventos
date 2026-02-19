import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { setHeaderOptions } from '../../components/HeaderTitle';
import api from '../../services/endpont';
import { formatDateEvent } from '../../utils/dateFormat';
import EventDescription from '../../components/EventDescription';
 
export default function EventShow() {
	const route = useRoute();
	const navigation = useNavigation();
	const { eventId } = route.params || {};

	const [event, setEvent] = useState(false);
	const [visible, setVisible] = useState(true);
	const [loading, setLoading] = useState(true);

	async function firstEvent(){
		const response = await api.getEvent(eventId);
		console.log(response.data);
		setEvent(response.data);
		setLoading(false);
	}

	useEffect(() => {
		setHeaderOptions(navigation, {
			headerTitle: 'Evento',
			headerTitleStyle: { fontFamily: 'Arial', fontSize: 18, color: '#333333' },
			headerTintColor: '#333333',
		});
		firstEvent();
	}, [navigation]);

	return (
		<ScrollView style={styles.container}>
			{loading &&
              	<ActivityIndicator size="large" color="#37C064"  /> 
            } 
			{!loading && (
			<>
			    {/* <Image
					source={require('../../assets/images/logo_home.png')}
					style={styles.image}
					resizeMode="contain"
				/> */}
 				<View style={{ marginTop: 10 } }>
					<View>
						<Text style={[styles.title, { fontSize: 18 } ]}>{event.name}</Text>
					</View>
					<View opacity={0.4}>
						<Text style={[styles.title, { fontSize: 14 } ]}>{formatDateEvent(event.started_at)} a {formatDateEvent(event.ended_at)}</Text>
					</View>
					<View style={styles.textContent}>
						<Text style={[styles.title, { fontSize: 18 } ]}>
							{event.name_location} - {event.cidade}/{event.sigla} 
						</Text>
						<EventDescription htmlContent={event.description} />
						<Text style={styles.textList}>
							- Assunto: 	{event.subject}
						</Text>
						{event.category != '' && (
						<>
							<Text style={styles.textList}>
								- Material: {event.category}
							</Text>
					 	</>
						)}
					</View>
				</View>
			</>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container:{
	  flex:1,
	  width: '100%',
	  backgroundColor: '#FFF'
	},
	image:{
	  width: '100%',
	  height: '50%'
	},
	title:{
	  fontFamily: 'Anton_400Regular',
	  paddingHorizontal: '2%',
	  color: '#000'
	},
	dotContainer:{
	  flexDirection: 'row',
	  marginVertical: '7%'
	},
	textContent:{
	  fontSize: 16,
	  lineHeight: 25,
	  marginVertical: '2%',
	  paddingHorizontal: '2%',
	  color: '#000'
	},
	textTitle: {
	  fontSize: 22,
	  marginVertical: '2%',
	  color: '#000'
	},
	textList:{
	  fontSize: 16,
	  lineHeight: 25,
	  color: '#000'
	},
	line:{
	  borderWidth: 1,
	  borderBottomColor: '#DDD',
	  marginVertical: '2%',
	}
  });

