import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import {
  formatDateToBr,
  formatCPF,
  maskTelefone,
  formatarData,
  isValidDate,
  calcularIdade,
} from '../../utils/formatters';

import ModalTermos from '../Modals/ModalTermos';
import ModalAssinatura from '../Modals/ModalAssinatura';
import ModalCrianca from '../Modals/ModalCrianca';
import useSubmitCadastro from '../../hooks/useSubmitCadastro';

import endpoint from '../../services/endpont';
import { useRoute } from '@react-navigation/native';

export default function CadastroResponsavelForm({
  id_evento,
  initialData,
  onCancel,
  onSuccess,
}) {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const route = useRoute();
  const params = route.params || {};
  const currentEventId = params.eventId || id_evento;

  const [hasTerm, setHasTerm] = useState(false);
  const [rawTermText, setRawTermText] = useState('');
  const [rawTermMinorText, setRawTermMinorText] = useState('');
  const [loadingInitialTerm, setLoadingInitialTerm] = useState(true);

  const [modalTermosVisible, setModalTermosVisible] = useState(false);
  const [modalCriancaVisible, setModalCriancaVisible] = useState(false);
  const [modalAssinaturaVisible, setModalAssinaturaVisible] = useState(false);
  const [assinaturaBase64, setAssinaturaBase64] = useState(null);
  const [termoTexto, setTermoTexto] = useState('');
  const [renderCanvas, setRenderCanvas] = useState(false);

  const [dropdownAberto, setDropdownAberto] = useState('');
  const [editingChildId, setEditingChildId] = useState(null);

  const slideAnim = useRef(
    new Animated.Value(-Dimensions.get('window').height),
  ).current;

  const [sexoOptions, setSexoOptions] = useState(initialData?.genders || []);

  const [participante, setParticipante] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    data_nascimento: '',
    sexo: '',
    sexoNome: '',
    observacao: '',
    isParticipante: false,
  });

  const [criancas, setCriancas] = useState([]);
  const [novaCrianca, setNovaCrianca] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    idadeCalculada: '',
    parentesco: '',
    sexo: '',
    sexoNome: '',
  });

  const [parentescoOptions, setParentescoOptions] = useState([]);
  const [loadingParentesco, setLoadingParentesco] = useState(false);

  const [isAutoridade, setIsAutoridade] = useState(false);
  const [autoridadeOptions, setAutoridadeOptions] = useState([]);
  const [loadingAutoridades, setLoadingAutoridades] = useState(false);
  const [selectedAutoridade, setSelectedAutoridade] = useState(null);

  useEffect(() => {
    if (sexoOptions.length > 0) return;

    const fetchSexos = async () => {
      try {
        const data = await endpoint.getSexos();
        if (Array.isArray(data)) {
          setSexoOptions(data);
        }
      } catch (err) {
        console.error('Erro ao buscar sexos:', err?.response?.status);
      }
    };

    fetchSexos();
  }, []);

  useEffect(() => {
    const fetchTermStatus = async () => {
      if (!currentEventId) return;
      try {
        const data = await endpoint.getEventTerm(currentEventId);

        if (data && (data.term_text || data.term_minor_text)) {
          setHasTerm(true);
          setRawTermText(data.term_text || '');
          setRawTermMinorText(data.term_minor_text || '');
        } else {
          setHasTerm(false);
        }
      } catch (error) {
        setHasTerm(false);
      } finally {
        setLoadingInitialTerm(false);
      }
    };
    fetchTermStatus();
  }, [currentEventId]);

  useEffect(() => {
    const fetchParentescos = async () => {
      setLoadingParentesco(true);
      try {
        const data = await endpoint.getParentescos();
        if (Array.isArray(data)) {
          setParentescoOptions(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingParentesco(false);
      }
    };
    fetchParentescos();
  }, []);

  useEffect(() => {
    if (!isAutoridade) {
      setSelectedAutoridade(null);
      return;
    }
    const fetchAutoridades = async () => {
      setLoadingAutoridades(true);
      try {
        const data = await endpoint.getTiposParticipantes();
        if (Array.isArray(data)) {
          setAutoridadeOptions(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAutoridades(false);
      }
    };
    fetchAutoridades();
  }, [isAutoridade]);

  useEffect(() => {
    if (initialData) {
      const initialGenderId = initialData.gender_id
        ? String(initialData.gender_id)
        : '';
      const initialGender = sexoOptions.find(
        s => String(s.id) === initialGenderId,
      );

      setParticipante(prev => ({
        ...prev,
        nome: initialData.name || '',
        cpf: formatCPF(initialData.cpf || ''),
        telefone: maskTelefone(initialData.phone || initialData.whatsapp || ''),
        data_nascimento: initialData.birth_date
          ? formatDateToBr(initialData.birth_date)
          : '',
        sexo: initialGenderId,
        sexoNome: initialGender ? initialGender.name : '',
        observacao: initialData.observation || '',
      }));
    }

    Orientation.lockToPortrait();
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [initialData, sexoOptions]);

  useEffect(() => {
    if (modalCriancaVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [modalCriancaVisible]);

  const handleDataNascimentoChange = text => {
    const dataFormatada = formatarData(text);
    const idade = calcularIdade(dataFormatada);
    setNovaCrianca({
      ...novaCrianca,
      dataNascimento: dataFormatada,
      idadeCalculada: idade,
    });
  };

  const validarIdadeParticipante = () => {
    if (
      !participante.data_nascimento ||
      !isValidDate(participante.data_nascimento)
    ) {
      Alert.alert(
        'Atenção',
        'Informe uma data de nascimento válida (DD/MM/AAAA) para o participante.',
      );
      return false;
    }

    const idadeParticipante = parseInt(
      calcularIdade(participante.data_nascimento),
      10,
    );

    if (
      isNaN(idadeParticipante) ||
      idadeParticipante < 18 ||
      idadeParticipante > 90
    ) {
      Alert.alert(
        'Ação Bloqueada',
        'O participante/responsável legal deve ter entre 18 e 90 anos.',
      );
      return false;
    }
    return true;
  };

  const iniciarAssinatura = () => {
    if (!validarIdadeParticipante()) return;

    let textoHtml = '';
    const isParticipante = criancas.length === 0 || participante.isParticipante;
    const hasCriancas = criancas.length > 0;

    if (!hasCriancas) {
      textoHtml = rawTermText;
    } else if (hasCriancas && isParticipante) {
      textoHtml = rawTermText + '<br><br>' + rawTermMinorText;
    } else if (hasCriancas && !isParticipante) {
      textoHtml = rawTermMinorText;
    }

    if (!textoHtml) {
      textoHtml = '<p>Erro: Termo não configurado para este evento.</p>';
    }

    setTermoTexto(textoHtml);
    setModalTermosVisible(true);
  };

  const aceitarTermos = () => {
    setModalTermosVisible(false);
    Orientation.lockToLandscape();
    setTimeout(() => {
      setModalAssinaturaVisible(true);
      setTimeout(() => {
        setRenderCanvas(true);
      }, 300);
    }, 300);
  };

  const cancelarTermos = () => {
    setModalTermosVisible(false);
  };

  const fecharModalAssinatura = () => {
    setRenderCanvas(false);
    setModalAssinaturaVisible(false);
    Orientation.lockToPortrait();
  };

  const handleSignatureOK = signature => {
    setAssinaturaBase64(signature);
    fecharModalAssinatura();
  };

  const limparAssinaturaAtual = () => {
    setAssinaturaBase64(null);
  };

  const abrirModalNovaCrianca = () => {
    setEditingChildId(null);
    setDropdownAberto('');
    setNovaCrianca({
      nome: '',
      cpf: '',
      dataNascimento: '',
      idadeCalculada: '',
      parentesco: '',
      sexo: '',
      sexoNome: '',
    });
    slideAnim.setValue(-Dimensions.get('window').height);
    setModalCriancaVisible(true);
  };

  const editarCrianca = child => {
    setEditingChildId(child.id);
    setDropdownAberto('');
    setNovaCrianca({ ...child });
    slideAnim.setValue(-Dimensions.get('window').height);
    setModalCriancaVisible(true);
  };

  const salvarCrianca = () => {
    if (
      !novaCrianca.nome ||
      !novaCrianca.parentesco ||
      !novaCrianca.sexo ||
      novaCrianca.dataNascimento.length !== 10
    ) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Atenção',
        textBody: 'Preencha Nome, Data, Parentesco e Sexo.',
        button: 'Ok',
      });
    }

    if (!isValidDate(novaCrianca.dataNascimento)) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Data Inválida',
        textBody:
          'Informe uma data de nascimento válida (DD/MM/AAAA) para a criança.',
        button: 'Ok',
      });
    }

    const idade = parseInt(novaCrianca.idadeCalculada, 10);

    if (isNaN(idade) || idade <= 0) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Idade Inválida',
        textBody: 'A criança deve ter mais de 0 anos.',
        button: 'Ok',
      });
    }

    if (idade > 17) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Idade Inválida',
        textBody:
          'Não é permitido o cadastro de idade acima de 17 anos para a criança.',
        button: 'Ok',
      });
    }

    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (editingChildId) {
        setCriancas(
          criancas.map(c =>
            c.id === editingChildId
              ? { ...novaCrianca, id: editingChildId }
              : c,
          ),
        );
        setEditingChildId(null);
      } else {
        setCriancas([...criancas, { ...novaCrianca, id: Date.now() }]);
      }

      setNovaCrianca({
        nome: '',
        cpf: '',
        dataNascimento: '',
        idadeCalculada: '',
        parentesco: '',
        sexo: '',
        sexoNome: '',
      });
      setModalCriancaVisible(false);
    });
  };

  const cancelarModalCrianca = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalCriancaVisible(false);
      setEditingChildId(null);
      setDropdownAberto('');
      setNovaCrianca({
        nome: '',
        cpf: '',
        dataNascimento: '',
        idadeCalculada: '',
        parentesco: '',
        sexo: '',
        sexoNome: '',
      });
    });
  };

  const removerCrianca = id => {
    setCriancas(criancas.filter(c => c.id !== id));
  };

  const { handleSubmit, loadingSubmit } = useSubmitCadastro({
    currentEventId,
    participante,
    criancas,
    isAutoridade,
    selectedAutoridade,
    hasTerm,
    assinaturaBase64,
    termoTexto,
    validarIdadeParticipante,
    onSuccess,
  });

  if (loadingInitialTerm) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#3E7D56" />
      </View>
    );
  }

  const hasMinorTerm = !!rawTermMinorText && rawTermMinorText.trim() !== '';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Trocar CPF / Voltar</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Dados do Participante / Responsável
            </Text>
          </View>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee', color: '#555' }]}
            value={participante.cpf}
            editable={false}
          />
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={participante.nome}
            onChangeText={t => setParticipante({ ...participante, nome: t })}
          />
          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            value={participante.telefone}
            onChangeText={t =>
              setParticipante({ ...participante, telefone: maskTelefone(t) })
            }
          />
          <View style={styles.row}>
            <View style={[styles.col, { marginRight: 10 }]}>
              <Text style={styles.label}>Data de Nasc. *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                value={participante.data_nascimento}
                onChangeText={t =>
                  setParticipante({
                    ...participante,
                    data_nascimento: formatarData(t),
                  })
                }
                maxLength={10}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Sexo *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() =>
                  setDropdownAberto(
                    dropdownAberto === 'participante_sexo'
                      ? ''
                      : 'participante_sexo',
                  )
                }
              >
                <Text
                  style={[
                    styles.pickerText,
                    !participante.sexo && styles.placeholderText,
                  ]}
                >
                  {participante.sexoNome || 'Selecione'}
                </Text>
                <Text style={styles.pickerIcon}>
                  {dropdownAberto === 'participante_sexo' ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {dropdownAberto === 'participante_sexo' && (
            <View style={styles.dropdownList}>
              {sexoOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setParticipante({
                      ...participante,
                      sexo: item.id,
                      sexoNome: item.name,
                    });
                    setDropdownAberto('');
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Digite uma observação (opcional)"
            multiline
            value={participante.observacao}
            onChangeText={t =>
              setParticipante({ ...participante, observacao: t })
            }
          />

          {criancas.length > 0 && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setParticipante({
                  ...participante,
                  isParticipante: !participante.isParticipante,
                })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  participante.isParticipante && styles.checkboxChecked,
                ]}
              >
                {participante.isParticipante && (
                  <Text style={styles.checkboxCheckmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Também serei participante neste evento
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.checkboxContainer, { marginTop: 8 }]}
            onPress={() => setIsAutoridade(prev => !prev)}
          >
            <View
              style={[styles.checkbox, isAutoridade && styles.checkboxChecked]}
            >
              {isAutoridade && <Text style={styles.checkboxCheckmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>É uma autoridade</Text>
          </TouchableOpacity>

          {isAutoridade && (
            <>
              <Text style={[styles.label, { marginTop: 8 }]}>Autoridade *</Text>
              {loadingAutoridades ? (
                <ActivityIndicator
                  size="small"
                  color="#3E7D56"
                  style={{ marginBottom: 12 }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() =>
                      setDropdownAberto(
                        dropdownAberto === 'autoridade' ? '' : 'autoridade',
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        !selectedAutoridade && styles.placeholderText,
                      ]}
                    >
                      {selectedAutoridade
                        ? selectedAutoridade.name
                        : 'Selecione a autoridade'}
                    </Text>
                    <Text style={styles.pickerIcon}>
                      {dropdownAberto === 'autoridade' ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                  {dropdownAberto === 'autoridade' && (
                    <View style={styles.dropdownList}>
                      {autoridadeOptions.length === 0 ? (
                        <Text
                          style={[
                            styles.dropdownItemText,
                            { padding: 12, color: '#aaa' },
                          ]}
                        >
                          Nenhuma autoridade encontrada.
                        </Text>
                      ) : (
                        autoridadeOptions.map(item => (
                          <TouchableOpacity
                            key={item.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedAutoridade(item);
                              setDropdownAberto('');
                            }}
                          >
                            <Text style={styles.dropdownItemText}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        {hasMinorTerm && (
          <View style={styles.card}>
            <View
              style={[styles.cardHeader, { justifyContent: 'space-between' }]}
            >
              <Text style={styles.cardTitle}>Dependentes (Opcional)</Text>
              <TouchableOpacity onPress={abrirModalNovaCrianca}>
                <Text style={styles.addButtonText}>+Adicionar</Text>
              </TouchableOpacity>
            </View>
            {criancas.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma criança vinculada.</Text>
            ) : (
              criancas.map(child => (
                <View key={child.id} style={styles.childItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.childName}>
                      {child.nome}{' '}
                      <Text style={styles.childParentesco}>
                        ({child.parentesco?.name || child.parentesco})
                      </Text>
                    </Text>
                    {child.cpf ? (
                      <Text style={styles.childInfoText}>CPF: {child.cpf}</Text>
                    ) : null}
                    <Text style={styles.childInfoText}>
                      Nasc: {child.dataNascimento} • {child.idadeCalculada} anos
                      • {child.sexoNome}
                    </Text>
                  </View>
                  <View style={styles.childActions}>
                    <TouchableOpacity onPress={() => editarCrianca(child)}>
                      <Text style={styles.editButtonText}>[Editar]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removerCrianca(child.id)}>
                      <Text style={styles.deleteButtonText}>[Remover]</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {hasTerm && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assinatura *</Text>
            <Text style={styles.legalText}>
              {criancas.length === 0
                ? 'Ao assinar, concordo com os termos de participação e autorizo o uso dos meus direitos para os fins deste evento.'
                : 'Ao assinar, reitero minha concordância com os termos apresentados para mim e para os menores sob minha responsabilidade.'}
            </Text>
            <TouchableOpacity
              style={[
                styles.openSignatureButton,
                assinaturaBase64 && {
                  height: 'auto',
                  padding: 10,
                  borderStyle: 'solid',
                },
              ]}
              onPress={iniciarAssinatura}
            >
              {assinaturaBase64 ? (
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <Image
                    source={{ uri: assinaturaBase64 }}
                    style={styles.signaturePreview}
                  />
                  <Text style={styles.signatureCapturedText}>
                    Toque para assinar novamente
                  </Text>
                </View>
              ) : (
                <Text style={styles.openSignatureButtonText}>
                  Ler Termos e Assinar (Tela Cheia)
                </Text>
              )}
            </TouchableOpacity>
            {assinaturaBase64 && (
              <TouchableOpacity onPress={limparAssinaturaAtual}>
                <Text style={styles.clearLink}>Limpar assinatura atual</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loadingSubmit && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>FINALIZAR CADASTRO</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>

      <ModalTermos
        visible={modalTermosVisible}
        termoTexto={termoTexto}
        onCancel={cancelarTermos}
        onAccept={aceitarTermos}
      />

      <ModalAssinatura
        visible={modalAssinaturaVisible}
        renderCanvas={renderCanvas}
        onCancel={fecharModalAssinatura}
        onSignatureCaptured={handleSignatureOK}
      />

      <ModalCrianca
        visible={modalCriancaVisible}
        slideAnim={slideAnim}
        editingChildId={editingChildId}
        novaCrianca={novaCrianca}
        setNovaCrianca={setNovaCrianca}
        handleDataNascimentoChange={handleDataNascimentoChange}
        dropdownAberto={dropdownAberto}
        setDropdownAberto={setDropdownAberto}
        parentescoOptions={parentescoOptions}
        sexoOptions={sexoOptions}
        loadingParentesco={loadingParentesco}
        onSave={salvarCrianca}
        onCancel={cancelarModalCrianca}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  cancelButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    maxWidth: 180,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  pickerText: {
    fontSize: 15,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  pickerIcon: {
    color: '#999',
    fontSize: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#3E7D56',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3E7D56',
  },
  checkboxCheckmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  childName: {
    fontWeight: 'bold',
    color: '#444',
    fontSize: 15,
  },
  childParentesco: {
    fontWeight: 'normal',
    color: '#3E7D56',
    fontSize: 14,
  },
  childInfoText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  childActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#0288D1',
    fontSize: 12,
    marginRight: 15,
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 12,
  },
  addButtonText: {
    color: '#3E7D56',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#aaa',
    textAlign: 'center',
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#3E7D56',
    padding: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  openSignatureButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#3E7D56',
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  openSignatureButtonText: {
    color: '#3E7D56',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signaturePreview: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  signatureCapturedText: { color: '#3E7D56', fontWeight: 'bold', fontSize: 14 },
  clearLink: {
    color: '#FF4444',
    fontSize: 12,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  legalText: { fontSize: 12, color: '#666', marginBottom: 15, lineHeight: 18 },
  dropdownList: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
});
