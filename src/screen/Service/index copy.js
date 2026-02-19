import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useRoute } from '@react-navigation/native';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { PermissionsAndroid } from 'react-native';

export default function Service() {

	const route = useRoute();
	const navigation = useNavigation();
	const { eventId } = route.params || {};

  const [qrData, setQrData] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleQRCodeRead = (e) => {
    setQrData(e.data);
    setScannerVisible(false);
  };

  const toggleScanner = () => {
    setScannerVisible(!scannerVisible);
  };

  async function requestPermissions() {
	try {
	  const granted = await PermissionsAndroid.requestMultiple([
		PermissionsAndroid.PERMISSIONS.CAMERA,
		PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
	  ]);
	  if (granted['android.permission.CAMERA'] === 'granted' &&
		  granted['android.permission.RECORD_AUDIO'] === 'granted') {
		console.log("Permissões de câmera e áudio concedidas");
	  } else {
		console.log("Permissões não concedidas");
	  }
	} catch (err) {
	  console.warn(err);
	}
  }
  

  return (
    <View style={styles.container}>
      <Button title="Ler QR Code" onPress={toggleScanner} />
      {scannerVisible && (
        <RNCamera
          style={styles.camera}
          onBarCodeRead={handleQRCodeRead}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.auto}
        >
          <View style={styles.overlay}>
            <Text>Escaneie o QR Code</Text>
          </View>
        </RNCamera>
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
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
