import React, { useRef } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';

export default function ModalAssinatura({
  visible,
  renderCanvas,
  onCancel,
  onSignatureCaptured,
}) {
  const signatureRef = useRef();

  const handleConfirmarAssinatura = () => {
    if (signatureRef.current) signatureRef.current.readSignature();
  };

  const handleLimparAssinaturaCanvas = () => {
    if (signatureRef.current) signatureRef.current.clearSignature();
  };

  const handleSignatureEmpty = () => {
    Alert.alert('Atenção', 'Por favor, faça a assinatura antes de confirmar.');
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      supportedOrientations={['landscape']}
    >
      <SafeAreaView style={styles.landscapeModalContainer}>
        <View style={styles.landscapeHeader}>
          <Text style={styles.landscapeTitle}>Assine no quadro abaixo</Text>
          <TouchableOpacity
            style={styles.landscapeCancelBtn}
            onPress={onCancel}
          >
            <Text style={styles.landscapeCancelText}>Cancelar X</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.signatureCanvasArea}>
          {renderCanvas && (
            <SignatureScreen
              ref={signatureRef}
              onOK={onSignatureCaptured}
              onEmpty={handleSignatureEmpty}
              webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
              autoClear={true}
            />
          )}
        </View>
        <View style={styles.landscapeFooter}>
          <TouchableOpacity
            style={styles.btnFooterClear}
            onPress={handleLimparAssinaturaCanvas}
          >
            <Text style={styles.btnFooterTextRed}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnFooterConfirm}
            onPress={handleConfirmarAssinatura}
          >
            <Text style={styles.btnFooterTextWhite}>CONFIRMAR ASSINATURA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  landscapeModalContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  landscapeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#3E7D56',
    height: 50,
  },
  landscapeTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  landscapeCancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  landscapeCancelText: {
    color: '#FFF',
    fontSize: 12,
  },
  signatureCanvasArea: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  landscapeFooter: {
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  btnFooterClear: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    width: '20%',
    alignItems: 'center',
  },
  btnFooterConfirm: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#3E7D56',
    width: '75%',
    alignItems: 'center',
  },
  btnFooterTextRed: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  btnFooterTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
