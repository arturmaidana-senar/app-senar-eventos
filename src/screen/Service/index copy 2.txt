import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { setHeaderOptions } from '../../components/HeaderTitle';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { PermissionsAndroid } from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

export default function Service() {

	const route = useRoute();
	const navigation = useNavigation();
	const { eventId } = route.params || {};

	const [data, SetData] = useState('Aguardando Leitura');
	const [qrData, setQrData] = useState(null);
	const [scannerVisible, setScannerVisible] = useState(false);

	const handleQRCodeRead = (e) => {
		setQrData(e);
		setScannerVisible(false);
	};

	const toggleScanner = () => {
		setQrData('');
		setScannerVisible(!scannerVisible);
	};

	const closeScanner = () => {
		setScannerVisible(false);
		setQrData('');
	};

	useEffect(() => {
		setHeaderOptions(navigation, {
			headerTitle: 'Evento',
			headerTitleStyle: { fontFamily: 'Arial', fontSize: 18, color: '#333333' },
			headerTintColor: '#333333',
		});
	}, [navigation]);

    return (
		<View style={styles.container}>

			{!scannerVisible && (
				<Button title="Ler QR Code" onPress={toggleScanner} />
			)}

			{scannerVisible && (
			<View style={styles.scannerContainer}>
				<QRCodeScanner
					onRead={({ data }) => handleQRCodeRead(data)}
					reactivate={false}
					reactivateTimeout={500}
					showMarker={true}
					topContent={
					<Text style={styles.centerText}>
						<Text style={styles.textBold}>{data}</Text>
					</Text>
					}
					bottomContent={
					<View>
						<Text style={styles.buttonText}>QrCode Eventos</Text>
					</View>
					}
				/>

				{/* Botão para fechar o scanner */}
				<TouchableOpacity style={styles.closeButton} onPress={closeScanner}>
					<Text style={styles.closeButtonText}>Fechar</Text>
				</TouchableOpacity>
				</View>
			)}

			{qrData && (
				<View style={styles.resultContainer}>
				<Text style={styles.resultText}>QR Code lido:</Text>
				<Text style={styles.resultText}>{qrData}</Text>
				</View>
			)}
		</View>
    );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff'
	},
	centerText: {
		flex: 1,
		fontSize: 18,
		padding: 32,
		color: '#777'
	},
	textBold: {
		fontWeight: '500',
		color: '#000'
	},
	buttonText: {
		fontSize: 21,
		color: 'rgb(0,122,255)'
	},
	buttonTouchable: {
		padding: 16
	},
	scannerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	closeButton: {
		position: 'absolute',
		top: 30,
		right: 20,
		backgroundColor: 'rgba(187, 2, 2, 0.5)',
		padding: 10,
		borderRadius: 5,
	},
	closeButtonText: {
		color: '#fff',
		fontSize: 16,
	},
	resultContainer: {
		padding: 20,
		marginTop: 20,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		backgroundColor: '#f9f9f9',
	},
	resultText: {
		fontSize: 18,
		color: '#333',
	}
});
