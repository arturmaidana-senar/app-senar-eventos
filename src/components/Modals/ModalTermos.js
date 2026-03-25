import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import TermosConsentimento from '../../components/Ui/TermosConsentimento';

export default function ModalTermos({
  visible,
  termoTexto,
  onCancel,
  onAccept,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.termosContainer}>
        <View style={styles.termosHeader}>
          <View style={{ width: 30 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.termosTitle}>Termos e Autorização</Text>
            <Text style={styles.termosSubtitle}>Leia para prosseguir</Text>
          </View>
          <TouchableOpacity onPress={onCancel} style={{ padding: 5 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
              X
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.termosScroll}
          contentContainerStyle={styles.termosContent}
        >
          <TermosConsentimento
            content={termoTexto || '<p>Carregando termo...</p>'}
          />
          <View style={{ height: 50 }} />
        </ScrollView>
        <View style={styles.termosFooter}>
          <TouchableOpacity style={styles.btnAceitarTermos} onPress={onAccept}>
            <Text style={styles.btnAceitarText}>LI E CONCORDO - ASSINAR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  termosContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  termosHeader: {
    padding: 20,
    backgroundColor: '#3E7D56',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termosTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  termosSubtitle: {
    color: '#E0EFE5',
    fontSize: 14,
    marginTop: 5,
  },
  termosScroll: {
    flex: 1,
    padding: 20,
  },
  termosContent: {
    paddingBottom: 40,
  },
  termosFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  btnAceitarTermos: {
    padding: 18,
    borderRadius: 10,
    backgroundColor: '#3E7D56',
    alignItems: 'center',
  },
  btnAceitarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
