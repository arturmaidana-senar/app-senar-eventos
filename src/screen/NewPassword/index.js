import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigation, CommonActions, useRoute } from '@react-navigation/native';
import { setHeaderOptions } from '../../components/HeaderTitle';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EyeIcon from 'react-native-vector-icons/Feather';
import EyeOffIcon from 'react-native-vector-icons/Feather';
import api from './../../services/endpont';
import LoadingInfo from '../../components/LoadingInfo';

import {
	Container,
	Title,
	Description,
	ContinueButton,
	ContinueButtonText,
	CustomButton
} from './styles';

export default function NewPassword() {
  	const navigation = useNavigation();
	const route = useRoute();
	const { name, userId, tokenId } = route.params || {};

	const [passwordField, setPasswordField] = useState('');
	const [passwordHide, setPasswordHide] = useState(true);
	const [passwordNewField, setPasswordNewField] = useState('');
	const [passwordNewHide, setPasswordNewHide] = useState(true);
	const [loading, setLoading] = useState(false); 
	const iconColorPassWord = passwordField.length > 0 ? '#007C6F' : '#000';
	const iconColorPassWordNew = passwordNewField.length > 0 ? '#007C6F' : '#000';


	async function handlePassword() {
		if( (passwordField == '') || (passwordNewField == '')){
			return Dialog.show({
				type: ALERT_TYPE.WARNING,
				title: 'Aviso',
				textBody: 'Informe a senha.',
				button: 'Fechar',
			});
		}
		if( passwordField.length < 6){
			return Dialog.show({
				type: ALERT_TYPE.WARNING,
				title: 'Aviso',
				textBody: 'Senha deve ter no minímo 6 caracteres.',
				button: 'Fechar',
			});
		}

		if(passwordField != passwordNewField){
			return Dialog.show({
				type: ALERT_TYPE.WARNING,
				title: 'Aviso',
				textBody: 'Senha são diferentes por gentileza conferir.',
				button: 'Fechar',
			});
		}

		try{
			setLoading(true);
			const response = await api.postUpdatePassword(passwordField, passwordNewField, userId, tokenId );
			if(response.error){
				return Dialog.show({
					type: ALERT_TYPE.DANGER,
					title: 'Erro',
					textBody: response.message,
					button: 'Fechar',
				});
			}
			setPasswordField('');
			setPasswordNewField('');

			Dialog.show({
				type: ALERT_TYPE.SUCCESS,
				title: 'Sucesso',
				textBody: 'Senha alterada com sucesso',
				button: 'OK',
				onHide: () => {
				navigation.reset({
					index: 0,
					routes: [{ name: 'SignIn' }],
				});
				},
			});


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

	useEffect(() => {
		setHeaderOptions(navigation, {
		headerTitle: 'Senha',
		headerTitleStyle: { fontFamily: 'Arial', fontSize: 18, color: '#333333' },
		headerTintColor: '#333333',
		});
	}, [navigation]);

	useLayoutEffect(() => {
		navigation.setOptions({
		  headerLeft: () => (
			<TouchableOpacity
			  style={{ marginLeft: 15 }}
			  onPress={() => {
				// Resetar a pilha de navegação e navegar para "SignIn"
				navigation.dispatch(
				  CommonActions.reset({
					index: 0,
					routes: [{ name: 'SignIn' }],
				  })
				);
			  }}
			>
			<Icon name="arrow-back" size={24} color="black" />
			</TouchableOpacity>
		  ),
		});
	}, [navigation]);
 
	return (
    <Container>
		<LoadingInfo visible={loading} />
		<Title>{name}</Title>
		<Description>
			Digite abaixo a nova senha e também confirme esta nova senha.
		</Description>

		<View style={[styles.container]}>
			<Text style={styles.label}>Nova Senha</Text>
			<View style={styles.inputContainer}>
				<MCIcon name="lock-outline" size={24} color={iconColorPassWord} style={styles.icon} />
				<TextInput
					placeholder="Senha"
					placeholderTextColor="#888"
					style={styles.input}
					value={passwordField}
					secureTextEntry={passwordHide}
					onChangeText={t => setPasswordField(t)}
				/>
				<CustomButton onPress={() => setPasswordHide(!passwordHide)}>
					{passwordHide &&
						<EyeIcon name="eye" size={24} marginLeft="2%" />
					}
					{!passwordHide &&
						<EyeOffIcon name="eye-off" size={24} marginLeft="2%" />
					}
				</CustomButton>
			</View>
		</View>


		<View style={[styles.container]}>
			<Text style={styles.label}>Confirmação da nova senha</Text>
			<View style={styles.inputContainer}>
				<MCIcon name="lock-outline" size={24} color={iconColorPassWordNew} style={styles.icon} />
				<TextInput
					placeholder="Confirma Senha"
					placeholderTextColor="#888"
					style={styles.input}
					value={passwordNewField}
					secureTextEntry={passwordNewHide}
					onChangeText={t => setPasswordNewField(t)}
				/>
				<CustomButton onPress={() => setPasswordNewHide(!passwordNewHide)}>
					{passwordNewHide &&
						<EyeIcon name="eye" size={24} marginLeft="2%" />
					}
					{!passwordNewHide &&
						<EyeOffIcon name="eye-off" size={24} marginLeft="2%" />
					}
				</CustomButton>
			</View>
		</View>


		<ContinueButton onPress={handlePassword}>
			<ContinueButtonText>Cadastrar</ContinueButtonText>
		</ContinueButton>

 
    </Container>
  );
}

const styles = StyleSheet.create({
	body: {
		alignItems: "center",
		justifyContent: "center",
		height: "90%"
	},
	container: {
		width: '100%',
		marginBottom: 10,
		marginTop: 16,
	},
	label: {
		color: '#007C6F',
		fontFamily: 'Rubik',
		fontSize: 14,
		fontStyle: 'normal',
		fontWeight: '400',
		lineHeight: 20,
		marginBottom: 8
	},
	error: {
		lineHeight: 20,
		fontSize: 16,
		color: 'red',
	},
	inputContainer: {
		width: '100%',
		height: 48,
		flexShrink: 0,
		borderWidth: 1,
		borderRadius: 6,
		backgroundColor: 'white',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		borderColor: '#007C6F',
		backgroundColor: '#FFF'
	},
	input: {
		flex: 1,
		height: 48,
		fontSize: 16,
		color: 'black',
	},
	input2: {
		flex: 1,
		height: 50,
		backgroundColor: '#62BD6E',
		padding: 8,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: '#fff',
		color: 'black',
	},
	iconContainer: {
		paddingHorizontal: 10,
	},
	icon: {
		width: 24,
		height: 24,
		marginTop: 4,
		marginRight: 6,
	},
	eyeIconContainer: {
		paddingHorizontal: 10,
	},
	eyeIcon: {
		width: 24,
		height: 24,
	},
	errorText: {
		color: 'red',
		fontSize: 14,
		marginTop: 4,
	},
	disabled: {
		opacity: 0.5,
	},
});

