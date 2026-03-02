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
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Orientation from 'react-native-orientation-locker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import TermosConsentimento from '../../components/Ui/TermosConsentimento';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

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
  const [loadingTermo, setLoadingTermo] = useState(false);

  const [modalTermosVisible, setModalTermosVisible] = useState(false);
  const [termosLidos, setTermosLidos] = useState(false);
  const [modalCriancaVisible, setModalCriancaVisible] = useState(false);
  const [modalParentescoVisible, setModalParentescoVisible] = useState(false);
  const [modalSexoVisible, setModalSexoVisible] = useState(false);
  const [modalAssinaturaVisible, setModalAssinaturaVisible] = useState(false);
  const [assinaturaBase64, setAssinaturaBase64] = useState(null);
  const [termoTexto, setTermoTexto] = useState('');
  const [renderCanvas, setRenderCanvas] = useState(false);

  const [sexoTarget, setSexoTarget] = useState('');
  const sexoOptions = ['Masculino', 'Feminino', 'Outro'];

  const [responsavel, setResponsavel] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    data_nascimento: '',
    sexo: '',
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
  });

  const [parentescoOptions, setParentescoOptions] = useState([]);
  const [loadingParentesco, setLoadingParentesco] = useState(false);

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

  useEffect(() => {
    if (initialData) {
      setResponsavel(prev => ({
        ...prev,
        nome: initialData.name || '',
        cpf: formatCPF(initialData.cpf || ''),
        telefone: maskTelefone(initialData.phone || initialData.whatsapp || ''),
        data_nascimento: initialData.birth_date
          ? formatDateToBr(initialData.birth_date)
          : '',
      }));
    }

    Orientation.lockToPortrait();
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [initialData]);

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

  const validarIdadeResponsavel = () => {
    if (
      !responsavel.data_nascimento ||
      !isValidDate(responsavel.data_nascimento)
    ) {
      Alert.alert(
        'Atenção',
        'Informe uma data de nascimento válida (DD/MM/AAAA) para o responsável.',
      );
      return false;
    }

    const idadeResponsavel = parseInt(
      calcularIdade(responsavel.data_nascimento),
      10,
    );

    if (
      isNaN(idadeResponsavel) ||
      idadeResponsavel < 18 ||
      idadeResponsavel > 90
    ) {
      Alert.alert(
        'Ação Bloqueada',
        'O responsável legal deve ter entre 18 e 90 anos.',
      );
      return false;
    }
    return true;
  };

  const iniciarAssinatura = async () => {
    if (!validarIdadeResponsavel()) return;

    setLoadingTermo(true);
    try {
      if (!currentEventId) {
        Alert.alert(
          'Erro',
          'ID do evento não identificado. Volte e tente novamente.',
        );
        setLoadingTermo(false);
        return;
      }

      const response = await api.get(`/events/${currentEventId}/term`);
      let textoHtml = '';

      if (response.data?.text && typeof response.data.text === 'string') {
        textoHtml = response.data.text;
      } else if (typeof response.data === 'string') {
        textoHtml = response.data;
      } else if (
        response.data?.term &&
        typeof response.data.term === 'string'
      ) {
        textoHtml = response.data.term;
      } else if (
        response.data?.content &&
        typeof response.data.content === 'string'
      ) {
        textoHtml = response.data.content;
      } else {
        textoHtml = '<p>Erro: O formato do termo recebido é inválido.</p>';
      }

      setTermoTexto(textoHtml);
      setModalTermosVisible(true);
    } catch (error) {
      console.error('Erro ao buscar termo:', error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: 'Não foi possível carregar o termo. Tente novamente.',
        button: 'Ok',
      });
    } finally {
      setLoadingTermo(false);
    }
  };

  const handleScrollTermos = ({ nativeEvent }) => {
    if (termosLidos) return;
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      setTermosLidos(true);
    }
  };

  const handleTermosContentSizeChange = (contentWidth, contentHeight) => {
    const screenHeight = Dimensions.get('window').height;
    if (contentHeight > 0 && contentHeight < screenHeight * 0.6) {
      setTermosLidos(true);
    }
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

  const selecionarSexo = item => {
    if (sexoTarget === 'responsavel') {
      setResponsavel({ ...responsavel, sexo: item });
    } else {
      setNovaCrianca({ ...novaCrianca, sexo: item });
    }
    setModalSexoVisible(false);
  };

  const adicionarCrianca = () => {
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

    setCriancas([...criancas, { ...novaCrianca, id: Date.now() }]);
    setNovaCrianca({
      nome: '',
      cpf: '',
      dataNascimento: '',
      idadeCalculada: '',
      parentesco: '',
      sexo: '',
    });
    setModalCriancaVisible(false);
  };

  const removerCrianca = id => {
    setCriancas(criancas.filter(c => c.id !== id));
  };

  const selecionarParentesco = item => {
    setNovaCrianca({
      ...novaCrianca,
      parentesco: item,
    });
    setModalParentescoVisible(false);
  };

  const handleSubmit = async () => {
    if (
      !responsavel.nome ||
      !responsavel.cpf ||
      !responsavel.telefone ||
      !responsavel.sexo
    ) {
      Alert.alert('Erro', 'Preencha os dados do responsável, incluindo sexo.');
      return;
    }

    if (!validarIdadeResponsavel()) return;

    if (!assinaturaBase64) {
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

      // Se não houver crianças, o responsável é obrigatoriamente participante
      const participanteConfirmado =
        criancas.length === 0 ? true : responsavel.isParticipante;

      formData.append('responsavel[nome]', responsavel.nome);
      formData.append('responsavel[cpf]', responsavel.cpf.replace(/\D/g, ''));
      formData.append('responsavel[telefone]', responsavel.telefone);
      formData.append(
        'responsavel[data_nascimento]',
        responsavel.data_nascimento,
      );
      formData.append('responsavel[sexo]', responsavel.sexo);
      formData.append(
        'responsavel[is_participante]',
        participanteConfirmado ? '1' : '0',
      );

      formData.append('responsavel[assinatura_png]', {
        uri: assinaturaBase64,
        type: 'image/png',
        name: `assinatura.png`,
      });

      criancas.forEach((c, index) => {
        formData.append(`criancas_vinculadas[${index}][nome]`, c.nome);
        formData.append(
          `criancas_vinculadas[${index}][data_nascimento]`,
          c.dataNascimento,
        );
        formData.append(
          `criancas_vinculadas[${index}][idade]`,
          c.idadeCalculada,
        );
        formData.append(`criancas_vinculadas[${index}][sexo]`, c.sexo);

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

      formData.append('termo_aceite[lido]', '1');
      formData.append('termo_aceite[data_aceite]', new Date().toISOString());
      formData.append('termo_aceite[conteudo_html]', termoTexto);
      formData.append('data_hora', new Date().toISOString());

      console.log(
        '\n================ DADOS ENVIADOS PARA O BACKEND ================',
      );
      if (formData._parts) {
        formData._parts.forEach(([key, value]) => {
          if (key === 'responsavel[assinatura_png]') {
            console.log(`${key}: [Arquivo Base64 Omitido no Log]`);
          } else if (typeof value === 'object') {
            console.log(`${key}:`, JSON.stringify(value));
          } else {
            console.log(`${key}: ${value}`);
          }
        });
      }
      console.log(
        '=================================================================\n',
      );

      const response = await api.post(
        `/events/${currentEventId}/term-signed`,
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Sucesso:', response.data);
      Alert.alert('Pronto', 'Cadastro realizado com sucesso!');
      if (onSuccess) onSuccess();
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
      setLoadingSubmit(false);
    }
  };

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
              Dados do Responsável / Participante
            </Text>
          </View>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee', color: '#555' }]}
            value={responsavel.cpf}
            editable={false}
          />
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={responsavel.nome}
            onChangeText={t => setResponsavel({ ...responsavel, nome: t })}
          />
          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            value={responsavel.telefone}
            onChangeText={t =>
              setResponsavel({ ...responsavel, telefone: maskTelefone(t) })
            }
          />
          <View style={styles.row}>
            <View style={[styles.col, { marginRight: 10 }]}>
              <Text style={styles.label}>Data de Nasc. *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                value={responsavel.data_nascimento}
                onChangeText={t =>
                  setResponsavel({
                    ...responsavel,
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
                onPress={() => {
                  setSexoTarget('responsavel');
                  setModalSexoVisible(true);
                }}
              >
                <Text
                  style={[
                    styles.pickerText,
                    !responsavel.sexo && styles.placeholderText,
                  ]}
                >
                  {responsavel.sexo || 'Selecione'}
                </Text>
                <Text style={styles.pickerIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {criancas.length > 0 && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setResponsavel({
                  ...responsavel,
                  isParticipante: !responsavel.isParticipante,
                })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  responsavel.isParticipante && styles.checkboxChecked,
                ]}
              >
                {responsavel.isParticipante && (
                  <Text style={styles.checkboxCheckmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Também serei participante neste evento
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <View
            style={[styles.cardHeader, { justifyContent: 'space-between' }]}
          >
            <Text style={styles.cardTitle}>
              Menores sob Responsabilidade (Opcional)
            </Text>
            <TouchableOpacity onPress={() => setModalCriancaVisible(true)}>
              <Text style={styles.addButtonText}>+ Adicionar</Text>
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
                    Nasc: {child.dataNascimento} • {child.idadeCalculada} anos •{' '}
                    {child.sexo}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removerCrianca(child.id)}>
                  <Text style={styles.deleteButtonText}>[Remover]</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assinatura do Responsável *</Text>
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
            disabled={loadingTermo}
          >
            {loadingTermo ? (
              <ActivityIndicator color="#3E7D56" size="small" />
            ) : assinaturaBase64 ? (
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
          {assinaturaBase64 && !loadingTermo && (
            <TouchableOpacity onPress={limparAssinaturaAtual}>
              <Text style={styles.clearLink}>Limpar assinatura atual</Text>
            </TouchableOpacity>
          )}
        </View>

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
              <Text style={styles.termosSubtitle}>
                Leia até o final para prosseguir
              </Text>
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
            onScroll={handleScrollTermos}
            onContentSizeChange={handleTermosContentSizeChange}
            scrollEventThrottle={16}
          >
            <TermosConsentimento
              content={termoTexto || '<p>Carregando termo...</p>'}
            />
            <View style={{ height: 50 }} />
          </ScrollView>
          <View style={styles.termosFooter}>
            <TouchableOpacity
              style={[
                styles.btnAceitarTermos,
                !termosLidos && styles.btnAceitarDisabled,
              ]}
              onPress={aceitarTermos}
              disabled={!termosLidos}
            >
              <Text style={styles.btnAceitarText}>
                {termosLidos
                  ? 'LI E CONCORDO - ASSINAR'
                  : 'Role até o final para habilitar'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL ADICIONAR CRIANÇA */}
      <Modal visible={modalCriancaVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitleModal}>Adicionar Criança</Text>
            <Text style={styles.label}>Nome da Criança *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome"
              value={novaCrianca.nome}
              onChangeText={t => setNovaCrianca({ ...novaCrianca, nome: t })}
            />
            <Text style={styles.label}>CPF da Criança (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
              value={novaCrianca.cpf}
              onChangeText={t =>
                setNovaCrianca({ ...novaCrianca, cpf: formatCPF(t) })
              }
            />
            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 10 }]}>
                <Text style={styles.label}>Data Nasc. *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  value={novaCrianca.dataNascimento}
                  onChangeText={handleDataNascimentoChange}
                  maxLength={10}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Idade</Text>
                <View style={[styles.input, { backgroundColor: '#EEE' }]}>
                  <Text style={{ color: '#555' }}>
                    {novaCrianca.idadeCalculada || '-'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 10 }]}>
                <Text style={styles.label}>Parentesco *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setModalParentescoVisible(true)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      !novaCrianca.parentesco && styles.placeholderText,
                    ]}
                  >
                    {typeof novaCrianca.parentesco === 'object'
                      ? novaCrianca.parentesco?.name
                      : novaCrianca.parentesco || 'Selecione'}
                  </Text>
                  <Text style={styles.pickerIcon}>▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Sexo *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    setSexoTarget('crianca');
                    setModalSexoVisible(true);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      !novaCrianca.sexo && styles.placeholderText,
                    ]}
                  >
                    {novaCrianca.sexo || 'Selecione'}
                  </Text>
                  <Text style={styles.pickerIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalCriancaVisible(false)}
                style={styles.btnCancel}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={adicionarCrianca}
                style={styles.btnConfirm}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Salvar Criança
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL SEXO */}
      <Modal visible={modalSexoVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitleModal}>Selecione o Sexo</Text>
            <FlatList
              data={sexoOptions}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => selecionarSexo(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalSexoVisible(false)}
              style={styles.btnCloseFull}
            >
              <Text style={styles.btnCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL PARENTESCO */}
      <Modal visible={modalParentescoVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: 400 }]}>
            <Text style={styles.cardTitleModal}>Selecione o Vínculo</Text>
            {loadingParentesco ? (
              <ActivityIndicator
                color="#3E7D56"
                size="large"
                style={{ margin: 20 }}
              />
            ) : (
              <FlatList
                data={parentescoOptions}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => selecionarParentesco(item)}
                  >
                    <Text style={styles.optionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              onPress={() => setModalParentescoVisible(false)}
              style={styles.btnCloseFull}
            >
              <Text style={styles.btnCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ASSINATURA */}
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  cancelButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
  },
  cancelButtonText: { color: '#D32F2F', fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1 },
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
  pickerText: { fontSize: 15, color: '#333' },
  placeholderText: { color: '#999' },
  pickerIcon: { color: '#999', fontSize: 12 },
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
  checkboxChecked: { backgroundColor: '#3E7D56' },
  checkboxCheckmark: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#555', flex: 1 },
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
  childName: { fontWeight: 'bold', color: '#444', fontSize: 15 },
  childParentesco: { fontWeight: 'normal', color: '#3E7D56', fontSize: 14 },
  childInfoText: { fontSize: 13, color: '#888', marginTop: 2 },
  deleteButtonText: { color: '#FF4444', fontSize: 12 },
  addButtonText: { color: '#3E7D56', fontWeight: 'bold', fontSize: 14 },
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
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    elevation: 10,
    width: '100%',
  },
  cardTitleModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#3E7D56',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#EEE',
    borderRadius: 6,
  },
  btnConfirm: {
    backgroundColor: '#3E7D56',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionText: { fontSize: 16, color: '#333', textAlign: 'center' },
  btnCloseFull: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#EEE',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCloseText: { color: '#555', fontWeight: 'bold' },
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
  btnAceitarDisabled: { backgroundColor: '#ccc' },
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
});
