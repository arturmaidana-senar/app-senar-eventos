import React, {useState, useRef, useEffect} from 'react';
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Orientation from 'react-native-orientation-locker';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';
import TermosConsentimento from '../../components/Ui/TermosConsentimento';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute} from '@react-navigation/native';

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
  const [modalAssinaturaVisible, setModalAssinaturaVisible] = useState(false);
  const [assinaturaBase64, setAssinaturaBase64] = useState(null);
  const [termoTexto, setTermoTexto] = useState('');

  const [responsavel, setResponsavel] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    data_nascimento: '',
  });

  const [criancas, setCriancas] = useState([]);
  const [novaCrianca, setNovaCrianca] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    idadeCalculada: '',
    parentesco: '',
  });

  const [parentescoOptions, setParentescoOptions] = useState([]);
  const [loadingParentesco, setLoadingParentesco] = useState(false);

  useEffect(() => {
    console.log('--- DEBUG ID DO EVENTO ---');
    console.log('Via Route Params:', params.eventId);
    console.log('Via Props:', id_evento);
    console.log('ID FINAL UTILIZADO:', currentEventId);
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

  // Função auxiliar para converter YYYY-MM-DD para DD/MM/AAAA
  const formatDateToBr = dateString => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      if (!year || !month || !day) return dateString; // Retorna original se falhar
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Popula dados iniciais
  useEffect(() => {
    if (initialData) {
      setResponsavel({
        nome: initialData.name || '',
        cpf: formatCPF(initialData.cpf || ''),
        telefone: maskTelefone(initialData.whatsapp || initialData.phone || ''),
        // Preenche a data se vier da API, convertendo para BR
        data_nascimento: initialData.data_nascimento
          ? formatDateToBr(initialData.data_nascimento)
          : '',
      });
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
    if (c.length >= 5) return `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4)}`;
    if (c.length >= 3) return `${c.slice(0, 2)}/${c.slice(2)}`;
    return c;
  };

  const calcularIdade = d => {
    if (!d || d.length !== 10) return '';
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

  const iniciarAssinatura = async () => {
    // --- VALIDAÇÃO DE IDADE DO RESPONSÁVEL ---
    const idadeResponsavel = parseInt(
      calcularIdade(responsavel.data_nascimento),
      10,
    );

    if (
      !responsavel.data_nascimento ||
      responsavel.data_nascimento.length !== 10
    ) {
      Alert.alert(
        'Atenção',
        'Informe a data de nascimento completa do responsável.',
      );
      return;
    }

    if (isNaN(idadeResponsavel) || idadeResponsavel < 18) {
      Alert.alert(
        'Ação Bloqueada',
        'O responsável legal deve ser maior de 18 anos para assinar o termo.',
      );
      return;
    }
    // ------------------------------------------

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

      console.log(`Buscando termo para evento ID: ${currentEventId}`);
      const response = await api.get(`/events/${currentEventId}/term`);

      console.log('Dados recebidos:', response.data);

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
        console.warn(
          'Estrutura não reconhecida. Tentando converter JSON:',
          response.data,
        );
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

  const handleScrollTermos = ({nativeEvent}) => {
    if (termosLidos) return;
    const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
    const paddingToBottom = 20;
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      setTermosLidos(true);
    }
  };

  const aceitarTermos = () => {
    setModalTermosVisible(false);
    setTimeout(() => {
      setModalAssinaturaVisible(true);
      Orientation.lockToLandscape();
    }, 300);
  };

  const cancelarTermos = () => {
    setModalTermosVisible(false);
  };

  const fecharModalAssinatura = () => {
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

  const adicionarCrianca = () => {
    if (
      !novaCrianca.nome ||
      !novaCrianca.parentesco ||
      novaCrianca.dataNascimento.length !== 10
    ) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Atenção',
        textBody: 'Preencha Nome, Data e Parentesco.',
        button: 'Ok',
      });
    }

    const idade = parseInt(novaCrianca.idadeCalculada, 10);

    if (idade <= 0) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Idade Inválida',
        textBody: 'A criança não pode ter 0 anos.',
        button: 'Ok',
      });
    }

    if (idade > 17) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Idade Inválida',
        textBody: 'Não é permitido o cadastro de idade acima de 17 anos.',
        button: 'Ok',
      });
    }

    setCriancas([...criancas, {...novaCrianca, id: Date.now()}]);
    setNovaCrianca({
      nome: '',
      cpf: '',
      dataNascimento: '',
      idadeCalculada: '',
      parentesco: '',
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
    if (!responsavel.nome || !responsavel.cpf || !responsavel.telefone) {
      Alert.alert('Erro', 'Preencha os dados do responsável.');
      return;
    }

    // --- VALIDAÇÃO DE IDADE NO SUBMIT TAMBÉM ---
    const idadeResponsavel = parseInt(
      calcularIdade(responsavel.data_nascimento),
      10,
    );
    if (
      !responsavel.data_nascimento ||
      isNaN(idadeResponsavel) ||
      idadeResponsavel < 18
    ) {
      Alert.alert('Erro', 'O responsável deve ser maior de 18 anos.');
      return;
    }
    // ------------------------------------------

    if (criancas.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma criança.');
      return;
    }
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

      formData.append('responsavel[nome]', responsavel.nome);
      formData.append('responsavel[cpf]', responsavel.cpf.replace(/\D/g, ''));
      formData.append('responsavel[telefone]', responsavel.telefone);
      // Envia a data de nascimento do responsável, se necessário no backend
      // Se o backend esperar YYYY-MM-DD, precisaríamos converter de volta.
      // Vou mandar como está (DD/MM/AAAA) ou você ajusta conforme necessidade.

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
        scrollEnabled={scrollEnabled}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dados do Responsável</Text>
          </View>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={[styles.input, {backgroundColor: '#eee', color: '#555'}]}
            value={responsavel.cpf}
            editable={false}
          />
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={responsavel.nome}
            onChangeText={t => setResponsavel({...responsavel, nome: t})}
          />
          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            value={responsavel.telefone}
            onChangeText={t =>
              setResponsavel({...responsavel, telefone: maskTelefone(t)})
            }
          />
          <Text style={styles.label}>Data de Nascimento *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            value={responsavel.data_nascimento}
            onChangeText={t =>
              setResponsavel({...responsavel, data_nascimento: formatarData(t)})
            }
            maxLength={10}
          />
        </View>

        <View style={styles.card}>
          <View style={[styles.cardHeader, {justifyContent: 'space-between'}]}>
            <Text style={styles.cardTitle}>Crianças Vinculadas</Text>
            <TouchableOpacity onPress={() => setModalCriancaVisible(true)}>
              <Text style={styles.addButtonText}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>
          {criancas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma criança vinculada.</Text>
          ) : (
            criancas.map(child => (
              <View key={child.id} style={styles.childItem}>
                <View style={{flex: 1}}>
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
            Ao assinar, reitero minha concordância com os termos apresentados.
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
            disabled={loadingTermo}>
            {loadingTermo ? (
              <ActivityIndicator color="#3E7D56" size="small" />
            ) : assinaturaBase64 ? (
              <View style={{width: '100%', alignItems: 'center'}}>
                <Image
                  source={{uri: assinaturaBase64}}
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
          style={[styles.submitButton, loadingSubmit && {opacity: 0.5}]}
          onPress={handleSubmit}
          disabled={loadingSubmit}>
          {loadingSubmit ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>FINALIZAR CADASTRO</Text>
          )}
        </TouchableOpacity>
        <View style={{height: 50}} />
      </ScrollView>

      {/* --- MODAIS DE TERMO E CRIANÇA (CÓDIGO MANTIDO) --- */}
      <Modal
        visible={modalTermosVisible}
        animationType="slide"
        transparent={false}>
        <SafeAreaView style={styles.termosContainer}>
          <View
            style={[
              styles.termosHeader,
              {flexDirection: 'row', justifyContent: 'space-between'},
            ]}>
            <View style={{width: 30}} />
            <View style={{alignItems: 'center'}}>
              <Text style={styles.termosTitle}>Termos e Autorização</Text>
              <Text style={styles.termosSubtitle}>
                Leia até o final para prosseguir
              </Text>
            </View>
            <TouchableOpacity onPress={cancelarTermos} style={{padding: 5}}>
              <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 18}}>
                X
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.termosScroll}
            contentContainerStyle={styles.termosContent}
            onScroll={handleScrollTermos}
            scrollEventThrottle={16}>
            <TermosConsentimento
              content={termoTexto || '<p>Carregando termo...</p>'}
            />

            <View style={{height: 50}} />
          </ScrollView>
          <View style={styles.termosFooter}>
            <TouchableOpacity
              style={[
                styles.btnAceitarTermos,
                !termosLidos && styles.btnAceitarDisabled,
              ]}
              onPress={aceitarTermos}
              disabled={!termosLidos}>
              <Text style={styles.btnAceitarText}>
                {termosLidos
                  ? 'LI E CONCORDO - ASSINAR'
                  : 'Role até o final para habilitar'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={modalCriancaVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitleModal}>Adicionar Criança</Text>
            <Text style={styles.label}>Nome da Criança *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome"
              value={novaCrianca.nome}
              onChangeText={t => setNovaCrianca({...novaCrianca, nome: t})}
            />
            <Text style={styles.label}>CPF da Criança (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
              value={novaCrianca.cpf}
              onChangeText={t =>
                setNovaCrianca({...novaCrianca, cpf: formatCPF(t)})
              }
            />
            <View style={styles.row}>
              <View style={[styles.col, {marginRight: 10}]}>
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
                <View style={[styles.input, {backgroundColor: '#EEE'}]}>
                  <Text style={{color: '#555'}}>
                    {novaCrianca.idadeCalculada || '-'}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.label}>Parentesco (Vínculo) *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setModalParentescoVisible(true)}>
              <Text
                style={[
                  styles.pickerText,
                  !novaCrianca.parentesco && styles.placeholderText,
                ]}>
                {typeof novaCrianca.parentesco === 'object' &&
                novaCrianca.parentesco?.name
                  ? novaCrianca.parentesco.name
                  : novaCrianca.parentesco || 'Selecione o vínculo'}{' '}
              </Text>
              <Text style={styles.pickerIcon}>▼</Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalCriancaVisible(false)}
                style={styles.btnCancel}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={adicionarCrianca}
                style={styles.btnConfirm}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>
                  Salvar Criança
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalParentescoVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {maxHeight: 400}]}>
            <Text style={styles.cardTitleModal}>Selecione o Vínculo</Text>

            {loadingParentesco ? (
              <ActivityIndicator
                color="#3E7D56"
                size="large"
                style={{margin: 20}}
              />
            ) : (
              <FlatList
                data={parentescoOptions}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => selecionarParentesco(item)}>
                    <Text style={styles.optionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              onPress={() => setModalParentescoVisible(false)}
              style={styles.btnCloseFull}>
              <Text style={styles.btnCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalAssinaturaVisible}
        transparent={false}
        animationType="fade"
        supportedOrientations={['landscape']}>
        <SafeAreaView style={styles.landscapeModalContainer}>
          <View style={styles.landscapeHeader}>
            <Text style={styles.landscapeTitle}>Assine no quadro abaixo</Text>
            <TouchableOpacity
              style={styles.landscapeCancelBtn}
              onPress={fecharModalAssinatura}>
              <Text style={styles.landscapeCancelText}>Cancelar X</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.signatureCanvasArea}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignatureOK}
              onEmpty={handleSignatureEmpty}
              webStyle={`.m-signature-pad--footer {display: none; margin: 0px;} body,html {width: 100%; height: 100%;}`}
              autoClear={true}
            />
          </View>
          <View style={styles.landscapeFooter}>
            <TouchableOpacity
              style={styles.btnFooterClear}
              onPress={handleLimparAssinaturaCanvas}>
              <Text style={styles.btnFooterTextRed}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnFooterConfirm}
              onPress={handleConfirmarAssinatura}>
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
  container: {flex: 1},
  cancelButton: {padding: 10, alignItems: 'center', backgroundColor: '#FFEBEE'},
  cancelButtonText: {color: '#D32F2F', fontWeight: 'bold'},
  scrollContent: {padding: 16},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {marginBottom: 16, flexDirection: 'row', alignItems: 'center'},
  cardTitle: {fontSize: 16, fontWeight: 'bold', color: '#333'},
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
  addButtonText: {color: '#3E7D56', fontWeight: 'bold'},
  emptyText: {fontStyle: 'italic', color: '#aaa', textAlign: 'center'},
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
  childName: {fontWeight: 'bold', color: '#444'},
  childInfoText: {fontSize: 12, color: '#888'},
  deleteButtonText: {color: '#FF4444', fontSize: 12},
  openSignatureButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#3E7D56',
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openSignatureButtonText: {color: '#3E7D56', fontWeight: 'bold'},
  signaturePreview: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  signatureCapturedText: {color: '#3E7D56', fontWeight: 'bold', fontSize: 14},
  clearLink: {
    color: '#FF4444',
    fontSize: 12,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  legalText: {fontSize: 12, color: '#666', marginBottom: 15, lineHeight: 18},
  submitButton: {
    backgroundColor: '#3E7D56',
    padding: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  submitButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},

  // MODAIS
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    maxHeight: 400,
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
  optionText: {fontSize: 16, color: '#333', textAlign: 'center'},
  btnCloseFull: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#EEE',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCloseText: {color: '#555', fontWeight: 'bold'},

  // TERMOS
  termosContainer: {flex: 1, backgroundColor: '#fff'},
  termosHeader: {padding: 20, backgroundColor: '#3E7D56', alignItems: 'center'},
  termosTitle: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  termosSubtitle: {color: '#E0EFE5', fontSize: 14, marginTop: 5},
  termosScroll: {flex: 1, padding: 20},
  termosContent: {paddingBottom: 40},
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
  btnAceitarDisabled: {backgroundColor: '#ccc'},
  btnAceitarText: {color: '#fff', fontWeight: 'bold', fontSize: 16},

  // LANDSCAPE
  landscapeModalContainer: {flex: 1, backgroundColor: '#f0f0f0'},
  landscapeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#3E7D56',
    height: 50,
  },
  landscapeTitle: {color: '#FFF', fontWeight: 'bold', fontSize: 16},
  landscapeCancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  landscapeCancelText: {color: '#FFF', fontSize: 12},
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
  btnFooterTextRed: {color: '#D32F2F', fontWeight: 'bold'},
  btnFooterTextWhite: {color: '#FFF', fontWeight: 'bold', fontSize: 16},

  row: {flexDirection: 'row', justifyContent: 'space-between'},
  col: {flex: 1},
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
  },
  pickerText: {fontSize: 15, color: '#333'},
  placeholderText: {color: '#999'},
  pickerIcon: {color: '#999', fontSize: 12},
  childParentesco: {fontWeight: 'normal', color: '#3E7D56', fontSize: 14},
});
