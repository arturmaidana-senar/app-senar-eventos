import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ModalUpdates = ({ visible, onClose }) => {
  const updates = [
    {
      version: 'v1.2.0',
      date: '04 de Maio, 2026',
      changes: [
        'Nova interface da página inicial.',
        'Novo painel de dashboard com estatísticas.',
        'Melhorias na visualização dos cards de eventos.',
        'Nova tela de perfil com organização por categorias.',
        'Correções de bugs e melhorias de performance.'
      ]
    },
    {
      version: 'v1.1.5',
      date: '20 de Abril, 2026',
      changes: [
        'Implementação de busca de eventos.',
        'Melhoria no carregamento de imagens.',
        'Otimização do consumo de dados.'
      ]
    }
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Notas de Atualização</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {updates.map((update, index) => (
              <View key={index} style={styles.updateItem}>
                <View style={styles.versionHeader}>
                  <Text style={styles.versionText}>{update.version}</Text>
                  <Text style={styles.dateText}>{update.date}</Text>
                </View>
                {update.changes.map((change, cIdx) => (
                  <View key={cIdx} style={styles.changeRow}>
                    <View style={styles.dot} />
                    <Text style={styles.changeText}>{change}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  scroll: {
    marginBottom: 20,
  },
  updateItem: {
    marginBottom: 24,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  versionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B9348',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A9954',
    marginTop: 6,
    marginRight: 10,
  },
  changeText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#2B9348',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ModalUpdates;
