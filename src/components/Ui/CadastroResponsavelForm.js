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
import { ChevronUp, ChevronDown, Check, Plus, FileText } from 'lucide-react-native';

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
        <ActivityIndicator size="large" color="#1A8F4A" />
      </View>
    );
  }

  const hasMinorTerm = !!rawTermMinorText && rawTermMinorText.trim() !== '';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { zIndex: 10, elevation: 10 }]}>
          <Text style={styles.cardTitle}>
            Dados do Participante / Responsável
          </Text>

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: '#F9FAFB', color: '#9CA3AF' },
            ]}
            value={participante.cpf}
            editable={false}
          />

          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            placeholderTextColor="#9CA3AF"
            value={participante.nome}
            onChangeText={t => setParticipante({ ...participante, nome: t })}
          />

          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={participante.telefone}
            onChangeText={t =>
              setParticipante({ ...participante, telefone: maskTelefone(t) })
            }
          />

          <View style={[styles.row, { zIndex: 10 }]}>
            <View style={[styles.col, { marginRight: 12 }]}>
              <Text style={styles.label}>Data de Nasc. *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
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
            <View style={[styles.col, { zIndex: 10 }]}>
              <Text style={styles.label}>Sexo *</Text>
              <View style={{ zIndex: 10 }}>
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
                    numberOfLines={1}
                  >
                    {participante.sexoNome || 'Selecione'}
                  </Text>
                    {dropdownAberto === 'participante_sexo' ? (
                      <ChevronUp size={16} color="#9CA3AF" />
                    ) : (
                      <ChevronDown size={16} color="#9CA3AF" />
                    )}
                </TouchableOpacity>
                {dropdownAberto === 'participante_sexo' && (
                  <View style={[styles.dropdownList, styles.dropdownFloating]}>
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
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsAutoridade(prev => !prev)}
          >
            <View
              style={[styles.checkbox, isAutoridade && styles.checkboxChecked]}
            >
              {isAutoridade && <Check size={14} color="#FFF" />}
            </View>
            <Text style={styles.checkboxLabel}>É uma autoridade</Text>
          </TouchableOpacity>

          {isAutoridade && (
            <>
              <Text style={styles.label}>Autoridade *</Text>
              {loadingAutoridades ? (
                <ActivityIndicator
                  size="small"
                  color="#1A8F4A"
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
                    {dropdownAberto === 'autoridade' ? (
                      <ChevronUp size={16} color="#9CA3AF" />
                    ) : (
                      <ChevronDown size={16} color="#9CA3AF" />
                    )}
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

              <Text style={styles.label}>Observação</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Digite uma observação (opcional)"
                placeholderTextColor="#9CA3AF"
                multiline
                value={participante.observacao}
                onChangeText={t =>
                  setParticipante({ ...participante, observacao: t })
                }
              />
            </>
          )}

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
                  <Check size={14} color="#FFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Também serei participante neste evento
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {hasMinorTerm && (
          <View style={[styles.card, { zIndex: 1, elevation: 2 }]}>
            <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
              Dependentes (Opcional)
            </Text>

            {criancas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma criança vinculada.</Text>
                <TouchableOpacity
                  style={styles.dashedButton}
                  onPress={abrirModalNovaCrianca}
                >
                  <Plus
                    size={18}
                    color="#1A8F4A"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.dashedButtonText}>
                    Adicionar Dependente
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {criancas.map(child => (
                  <View key={child.id} style={styles.childItem}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.childName}>
                        {child.nome}{' '}
                        <Text style={styles.childParentesco}>
                          ({child.parentesco?.name || child.parentesco})
                        </Text>
                      </Text>
                      {child.cpf ? (
                        <Text style={styles.childInfoText}>
                          CPF: {child.cpf}
                        </Text>
                      ) : null}
                      <Text style={styles.childInfoText}>
                        Nasc: {child.dataNascimento} • {child.idadeCalculada}{' '}
                        anos • {child.sexoNome}
                      </Text>
                    </View>
                    <View style={styles.childActions}>
                      <TouchableOpacity onPress={() => editarCrianca(child)}>
                        <Text style={styles.editButtonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removerCrianca(child.id)}
                      >
                        <Text style={styles.deleteButtonText}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.dashedButton, { marginTop: 12 }]}
                  onPress={abrirModalNovaCrianca}
                >
                  <Plus
                    size={18}
                    color="#1A8F4A"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.dashedButtonText}>
                    Adicionar Dependente
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {hasTerm && (
          <View style={[styles.card, { zIndex: 1, elevation: 2 }]}>
            <Text style={styles.cardTitle}>Assinatura *</Text>
            <Text style={styles.legalText}>
              {criancas.length === 0
                ? 'Ao assinar, concordo com os termos de participação e autorizo o uso dos meus direitos para os fins deste evento.'
                : 'Ao assinar, reitero minha concordância com os termos apresentados para mim e para os menores sob minha responsabilidade.'}
            </Text>
            <TouchableOpacity
              style={[
                styles.dashedButton,
                assinaturaBase64 && {
                  height: 'auto',
                  padding: 10,
                  borderStyle: 'solid',
                  backgroundColor: '#FFF',
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
                <>
                  <FileText
                    size={18}
                    color="#1A8F4A"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.dashedButtonText}>
                    Ler Termos e Assinar (Tela Cheia)
                  </Text>
                </>
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
          style={[
            styles.submitButton,
            loadingSubmit && { opacity: 0.7 },
            { zIndex: 1, elevation: 2 },
          ]}
          onPress={handleSubmit}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Finalizar Cadastro</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
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
    backgroundColor: '#F4F5F7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  pickerText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#1A8F4A',
    borderColor: '#1A8F4A',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  dashedButton: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dashedButtonText: {
    color: '#1A8F4A',
    fontWeight: '700',
    fontSize: 14,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  childName: {
    fontWeight: '700',
    color: '#1F2937',
    fontSize: 15,
  },
  childParentesco: {
    fontWeight: 'normal',
    color: '#1A8F4A',
    fontSize: 14,
  },
  childInfoText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  childActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#1A8F4A',
    paddingVertical: 18,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A8F4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  signaturePreview: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  signatureCapturedText: {
    color: '#1A8F4A',
    fontWeight: '600',
    fontSize: 13,
  },
  clearLink: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  legalText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownFloating: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    borderRadius: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1F2937',
  },
});
