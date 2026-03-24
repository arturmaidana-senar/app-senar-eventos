import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Orientation from 'react-native-orientation-locker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import TermosConsentimento from '../../components/Ui/TermosConsentimento';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { BlurView } from '@react-native-community/blur';

export default function CadastroResponsavelForm({
  id_evento,
  initialData,
  onCancel,
  onSuccess,
}) {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const signatureRef = useRef();
  const route = useRoute();
  const params = route.params || {};
  const currentEventId = params.eventId || id_evento;
  const [loadingSubmit, setLoadingSubmit] = useState(false);

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
    api
      .get('/genders')
      .then(res => {
        if (Array.isArray(res.data)) setSexoOptions(res.data);
      })
      .catch(err => console.error('Erro ao buscar genders:', err));
  }, []);

  useEffect(() => {
    if (initialData?.genders?.length > 0) {
      setSexoOptions(initialData.genders);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchTermStatus = async () => {
      if (!currentEventId) return;
      try {
        const response = await api.get(`/events/${currentEventId}/term`);
        const data = response.data;
        if (data && (data.term_text || data.term_minor_text)) {
          setHasTerm(true);
          setRawTermText(data.term_text || '');
          setRawTermMinorText(data.term_minor_text || '');
        } else {
          setHasTerm(false);
        }
      } catch (error) {
        console.log('Erro ao buscar termo, assumindo sem termo', error);
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
        const response = await api.get('/parentesco');
        if (Array.isArray(response.data)) {
          setParentescoOptions(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar parentescos:', error);
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
        const response = await api.get('/tipos-participantes');
        if (Array.isArray(response.data)) {
          setAutoridadeOptions(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar autoridades:', error);
      } finally {
        setLoadingAutoridades(false);
      }
    };
    fetchAutoridades();
  }, [isAutoridade]);

  const formatDateToBr = dateString => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      if (!year || !month || !day) return dateString;
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const formatForBackend = dateStr => {
    if (!dateStr || dateStr.length !== 10) return dateStr;
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  };

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

  const formatCPF = v =>
    v
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');

  const maskTelefone = v =>
    v
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);

  const formatarData = t => {
    let c = t.replace(/\D/g, '');
    if (c.length > 8) c = c.slice(0, 8);

    if (c.length >= 2) {
      let dia = parseInt(c.slice(0, 2), 10);
      if (dia > 31) c = '31' + c.slice(2);
      if (dia === 0) c = '01' + c.slice(2);
    }

    if (c.length >= 4) {
      let mes = parseInt(c.slice(2, 4), 10);
      if (mes > 12) c = c.slice(0, 2) + '12' + c.slice(4);
      if (mes === 0) c = c.slice(0, 2) + '01' + c.slice(4);
    }

    if (c.length >= 5) return `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4)}`;
    if (c.length >= 3) return `${c.slice(0, 2)}/${c.slice(2)}`;
    return c;
  };

  const isValidDate = dateString => {
    if (!dateString || dateString.length !== 10) return false;
    const [day, month, year] = dateString.split('/').map(Number);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900)
      return false;
    const dt = new Date(year, month - 1, day);
    return (
      dt.getDate() === day &&
      dt.getMonth() === month - 1 &&
      dt.getFullYear() === year
    );
  };

  const calcularIdade = d => {
    if (!d || d.length !== 10 || !isValidDate(d)) return '';
    const [D, M, A] = d.split('/').map(Number);
    const dt = new Date(A, M - 1, D);
    const h = new Date();
    if (isNaN(dt.getTime())) return '';
    let i = h.getFullYear() - dt.getFullYear();
    const m = h.getMonth() - dt.getMonth();
    if (m < 0 || (m === 0 && h.getDate() < dt.getDate())) i--;
    return i >= 0 ? i.toString() : '0';
  };

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

  const handleSignatureEmpty = () => {
    Alert.alert('Atenção', 'Por favor, faça a assinatura antes de confirmar.');
  };

  const limparAssinaturaAtual = () => {
    setAssinaturaBase64(null);
    if (signatureRef.current) signatureRef.current.clearSignature();
  };

  const handleConfirmarAssinatura = () => {
    if (signatureRef.current) signatureRef.current.readSignature();
  };

  const handleLimparAssinaturaCanvas = () => {
    if (signatureRef.current) signatureRef.current.clearSignature();
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

  const handleSubmit = async () => {
    if (
      !participante.nome ||
      !participante.cpf ||
      !participante.telefone ||
      !participante.sexo
    ) {
      Alert.alert('Erro', 'Preencha os dados do participante, incluindo sexo.');
      return;
    }

    if (!validarIdadeParticipante()) return;

    if (hasTerm && !assinaturaBase64) {
      Alert.alert('Erro', 'A assinatura é obrigatória.');
      return;
    }

    if (!currentEventId) {
      Alert.alert('Erro', 'ID do evento perdido. Reinicie o processo.');
      return;
    }

    setLoadingSubmit(true);

    try {
      let token =
        api.defaults.headers.common['Authorization'] ||
        api.defaults.headers['Authorization'];
      if (!token) {
        const chaves = await AsyncStorage.getAllKeys();
        const possiveisNomes = [
          '@token',
          'token',
          'userToken',
          'access_token',
          'sessao',
        ];
        for (const nome of possiveisNomes) {
          const chaveReal = chaves.find(k =>
            k.toLowerCase().includes(nome.toLowerCase().replace('@', '')),
          );
          if (chaveReal) {
            const valor = await AsyncStorage.getItem(chaveReal);
            if (valor) {
              token = valor.includes('{') ? JSON.parse(valor).token : valor;
              if (token) break;
            }
          }
        }
      }
      if (token && !token.startsWith('Bearer ')) token = `Bearer ${token}`;

      const formData = new FormData();

      const participanteConfirmado =
        criancas.length === 0 ? true : participante.isParticipante;

      formData.append('participante[nome]', participante.nome);
      formData.append('participante[cpf]', participante.cpf.replace(/\D/g, ''));
      formData.append('participante[telefone]', participante.telefone);
      formData.append(
        'participante[birth_date]',
        formatForBackend(participante.data_nascimento),
      );
      formData.append('participante[gender_id]', participante.sexo);
      formData.append(
        'participante[is_participante]',
        participanteConfirmado ? '1' : '0',
      );

      if (isAutoridade && selectedAutoridade) {
        formData.append('participante[autoridade_id]', selectedAutoridade.id);
      }

      if (hasTerm && assinaturaBase64) {
        formData.append('participante[assinatura_png]', {
          uri: assinaturaBase64,
          type: 'image/png',
          name: `assinatura.png`,
        });
        formData.append('termo_aceite[lido]', '1');
        formData.append('termo_aceite[data_aceite]', new Date().toISOString());
        formData.append('termo_aceite[conteudo_html]', termoTexto);
      }

      criancas.forEach((c, index) => {
        formData.append(`criancas_vinculadas[${index}][nome]`, c.nome);
        formData.append(
          `criancas_vinculadas[${index}][birth_date]`,
          formatForBackend(c.dataNascimento),
        );
        formData.append(
          `criancas_vinculadas[${index}][idade]`,
          c.idadeCalculada,
        );
        formData.append(`criancas_vinculadas[${index}][gender_id]`, c.sexo);

        if (typeof c.parentesco === 'object') {
          formData.append(
            `criancas_vinculadas[${index}][parentesco][id]`,
            c.parentesco.id,
          );
          formData.append(
            `criancas_vinculadas[${index}][parentesco][name]`,
            c.parentesco.name,
          );
        } else {
          formData.append(
            `criancas_vinculadas[${index}][parentesco][name]`,
            c.parentesco,
          );
        }

        if (c.cpf) {
          formData.append(
            `criancas_vinculadas[${index}][cpf]`,
            c.cpf.replace(/\D/g, ''),
          );
        }
      });

      formData.append('data_hora', new Date().toISOString());

      const response = await api.post(
        `/checkin/${currentEventId}/free-list`,
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setLoadingSubmit(false);
      Orientation.lockToPortrait();

      Alert.alert('Pronto', 'Cadastro realizado com sucesso!', [
        {
          text: 'Ok',
          onPress: () => onSuccess?.(),
        },
      ]);
    } catch (error) {
      console.error('Erro detalhado:', error);
      let msg = 'Ocorreu um erro ao enviar.';

      if (error.response) {
        if (error.response.data.errors) {
          const erros = error.response.data.errors;
          const primeiraMsg = Object.values(erros)[0];
          msg = Array.isArray(primeiraMsg) ? primeiraMsg[0] : primeiraMsg;
        } else {
          msg = error.response.data.message || `Erro ${error.response.status}`;
        }
      }

      Alert.alert('Atenção', msg);
    } finally {
    }
  };

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

          {/* Checkbox: É Autoridade */}
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

          {/* Select de Autoridade */}
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

      {/* MODAL DE TERMOS */}
      <Modal
        visible={modalTermosVisible}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.termosContainer}>
          <View style={styles.termosHeader}>
            <View style={{ width: 30 }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.termosTitle}>Termos e Autorização</Text>
              <Text style={styles.termosSubtitle}>Leia para prosseguir</Text>
            </View>
            <TouchableOpacity onPress={cancelarTermos} style={{ padding: 5 }}>
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
            <TouchableOpacity
              style={styles.btnAceitarTermos}
              onPress={aceitarTermos}
            >
              <Text style={styles.btnAceitarText}>LI E CONCORDO - ASSINAR</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={modalCriancaVisible} transparent animationType="fade">
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
                    onPress={cancelarModalCrianca}
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
                  onChangeText={t =>
                    setNovaCrianca({ ...novaCrianca, nome: t })
                  }
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
                  <View
                    style={[styles.colNovo, { flex: 2.5, marginRight: 12 }]}
                  >
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

                <TouchableOpacity
                  onPress={salvarCrianca}
                  style={styles.btnConfirmNovo}
                >
                  <Text style={styles.btnConfirmTextNovo}>
                    {editingChildId ? 'Salvar Alterações' : 'Salvar Criança'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>

      <Modal
        visible={modalAssinaturaVisible}
        transparent={false}
        animationType="fade"
        supportedOrientations={['landscape']}
      >
        <SafeAreaView style={styles.landscapeModalContainer}>
          <View style={styles.landscapeHeader}>
            <Text style={styles.landscapeTitle}>Assine no quadro abaixo</Text>
            <TouchableOpacity
              style={styles.landscapeCancelBtn}
              onPress={fecharModalAssinatura}
            >
              <Text style={styles.landscapeCancelText}>Cancelar X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signatureCanvasArea}>
            {renderCanvas && (
              <SignatureScreen
                ref={signatureRef}
                onOK={handleSignatureOK}
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
              <Text style={styles.btnFooterTextWhite}>
                CONFIRMAR ASSINATURA
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    maxWidth: 180, // ajusta conforme necessário
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: 20,
  },
  termosContainer: { flex: 1, backgroundColor: '#fff' },
  termosHeader: {
    padding: 20,
    backgroundColor: '#3E7D56',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termosTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  termosSubtitle: { color: '#E0EFE5', fontSize: 14, marginTop: 5 },
  termosScroll: { flex: 1, padding: 20 },
  termosContent: { paddingBottom: 40 },
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
  btnAceitarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  landscapeModalContainer: { flex: 1, backgroundColor: '#f0f0f0' },
  landscapeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#3E7D56',
    height: 50,
  },
  landscapeTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  landscapeCancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  landscapeCancelText: { color: '#FFF', fontSize: 12 },
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
  btnFooterTextRed: { color: '#D32F2F', fontWeight: 'bold' },
  btnFooterTextWhite: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  /* --- NOVOS ESTILOS PARA O MODAL (MATCH VISUAL) --- */
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

  /* --- ESTILOS DOS DROPDOWNS INLINE --- */
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
