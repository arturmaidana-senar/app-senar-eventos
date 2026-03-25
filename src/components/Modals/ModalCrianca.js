import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { formatCPF } from '../../utils/formatters';

export default function ModalCrianca({
  visible,
  slideAnim,
  editingChildId,
  novaCrianca,
  setNovaCrianca,
  handleDataNascimentoChange,
  dropdownAberto,
  setDropdownAberto,
  parentescoOptions,
  sexoOptions,
  loadingParentesco,
  onSave,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="dark"
        blurAmount={4}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.3)' },
        ]}
      />

      <Animated.View
        style={[{ flex: 1 }, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContentNovo}>
              <View style={styles.modalHeaderNovo}>
                <Text style={styles.modalTitleNovo}>
                  {editingChildId ? 'Editar Criança' : 'Adicionar Criança'}
                </Text>
                <TouchableOpacity
                  onPress={onCancel}
                  style={styles.closeButtonNovo}
                >
                  <Text style={styles.closeButtonTextNovo}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.labelNovo}>Nome da Criança</Text>
              <TextInput
                style={styles.inputNovo}
                placeholder="Digite o nome da criança"
                placeholderTextColor="#999"
                value={novaCrianca.nome}
                onChangeText={t => setNovaCrianca({ ...novaCrianca, nome: t })}
              />

              <Text style={styles.labelNovo}>CPF da Criança (Opcional)</Text>
              <TextInput
                style={styles.inputNovo}
                placeholder="000.000.000-60"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={14}
                value={novaCrianca.cpf}
                onChangeText={t =>
                  setNovaCrianca({ ...novaCrianca, cpf: formatCPF(t) })
                }
              />

              <View style={styles.rowNovo}>
                <View style={[styles.colNovo, { flex: 2.5, marginRight: 12 }]}>
                  <Text style={styles.labelNovo}>Data de Nascimento</Text>
                  <TextInput
                    style={styles.inputNovo}
                    placeholder="00/00/0000"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={novaCrianca.dataNascimento}
                    onChangeText={handleDataNascimentoChange}
                    maxLength={10}
                  />
                </View>
                <View style={[styles.colNovo, { flex: 1 }]}>
                  <Text style={styles.labelNovo}>Idade</Text>
                  <View
                    style={[
                      styles.inputNovo,
                      { backgroundColor: '#F8F9FA', alignItems: 'center' },
                    ]}
                  >
                    <Text style={{ color: '#555' }}>
                      {novaCrianca.idadeCalculada || '-'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.labelNovo}>Parentesco</Text>
              <TouchableOpacity
                style={styles.inputNovoPicker}
                onPress={() =>
                  setDropdownAberto(
                    dropdownAberto === 'crianca_parentesco'
                      ? ''
                      : 'crianca_parentesco',
                  )
                }
              >
                <Text
                  style={[
                    styles.pickerTextNovo,
                    !novaCrianca.parentesco && styles.placeholderText,
                  ]}
                >
                  {typeof novaCrianca.parentesco === 'object'
                    ? novaCrianca.parentesco?.name
                    : novaCrianca.parentesco || 'Selecione'}
                </Text>

                <Text style={styles.pickerIconNovo}>
                  {dropdownAberto === 'crianca_parentesco' ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {dropdownAberto === 'crianca_parentesco' && (
                <View style={styles.dropdownListNovo}>
                  {loadingParentesco ? (
                    <ActivityIndicator
                      style={{ padding: 10 }}
                      color="#3E7D56"
                    />
                  ) : (
                    <ScrollView style={{ maxHeight: 200 }}>
                      {parentescoOptions.map(item => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.dropdownItemNovo}
                          onPress={() => {
                            setNovaCrianca({
                              ...novaCrianca,
                              parentesco: item,
                            });
                            setDropdownAberto('');
                          }}
                        >
                          <Text style={styles.dropdownItemTextNovo}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}

              <Text style={styles.labelNovo}>Sexo</Text>
              <TouchableOpacity
                style={styles.inputNovoPicker}
                onPress={() =>
                  setDropdownAberto(
                    dropdownAberto === 'crianca_sexo' ? '' : 'crianca_sexo',
                  )
                }
              >
                <Text
                  style={[
                    styles.pickerTextNovo,
                    !novaCrianca.sexo && styles.placeholderText,
                  ]}
                >
                  {novaCrianca.sexoNome || 'Selecione'}
                </Text>
                <Text style={styles.pickerIconNovo}>
                  {dropdownAberto === 'crianca_sexo' ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {dropdownAberto === 'crianca_sexo' && (
                <View style={styles.dropdownListNovo}>
                  {sexoOptions.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItemNovo}
                      onPress={() => {
                        setNovaCrianca({
                          ...novaCrianca,
                          sexo: item.id,
                          sexoNome: item.name,
                        });
                        setDropdownAberto('');
                      }}
                    >
                      <Text style={styles.dropdownItemTextNovo}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity onPress={onSave} style={styles.btnConfirmNovo}>
                <Text style={styles.btnConfirmTextNovo}>
                  {editingChildId ? 'Salvar Alterações' : 'Salvar Criança'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: 20,
  },
  modalContentNovo: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    elevation: 10,
    width: '100%',
  },
  modalHeaderNovo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleNovo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButtonNovo: {
    backgroundColor: '#F5F5F5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonTextNovo: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelNovo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputNovo: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    color: '#333',
  },
  inputNovoPicker: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowNovo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colNovo: {
    flexDirection: 'column',
  },
  pickerTextNovo: {
    fontSize: 15,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  pickerIconNovo: {
    color: '#999',
    fontSize: 12,
  },
  btnConfirmNovo: {
    backgroundColor: '#357342',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnConfirmTextNovo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownListNovo: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    marginTop: -10,
    marginBottom: 16,
    overflow: 'hidden',
    maxHeight: 180,
  },
  dropdownItemNovo: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemTextNovo: {
    fontSize: 15,
    color: '#333',
  },
});
