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
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Image, // <--- ADICIONADO AQUI
  Dimensions,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Orientation from 'react-native-orientation-locker';
import {ArrowLeft2} from '../../components/Icons/Icons';
import TermosConsentimento from '../../components/Ui/TermosConsentimento';

export default function CadastroResponsavelScreen() {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const signatureRef = useRef();

  const [modalTermosVisible, setModalTermosVisible] = useState(false);
  const [termosLidos, setTermosLidos] = useState(false);

  const parentescoOptions = [
    'Filho(a)',
    'Sobrinho(a)',
    'Neto(a)',
    'Enteado(a)',
    'Irmão/Irmã',
    'Afilhado(a)',
    'Primo(a)',
    'Aluno(a)',
    'Tutelado(a)',
    'Outros',
  ];

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

  const [modalCriancaVisible, setModalCriancaVisible] = useState(false);
  const [modalParentescoVisible, setModalParentescoVisible] = useState(false);
  const [modalAssinaturaVisible, setModalAssinaturaVisible] = useState(false);
  const [assinaturaBase64, setAssinaturaBase64] = useState(null);

  useEffect(() => {
    Orientation.lockToPortrait();
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  // --- LÓGICA DOS TERMOS ---
  const iniciarAssinatura = () => {
    setModalTermosVisible(true);
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

  // --- DEMAIS FUNÇÕES ---

  const maskTelefone = value => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
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

  const formatarData = text => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    if (cleaned.length >= 5)
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(
        4,
      )}`;
    else if (cleaned.length >= 3)
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const calcularIdade = dataString => {
    if (dataString.length !== 10) return '';
    const [dia, mes, ano] = dataString.split('/').map(Number);
    const dataNasc = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    if (isNaN(dataNasc.getTime())) return '';
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const m = hoje.getMonth() - dataNasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) idade--;
    return idade >= 0 ? idade.toString() : '0';
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

  const selecionarParentesco = item => {
    setNovaCrianca({...novaCrianca, parentesco: item});
    setModalParentescoVisible(false);
  };

  const formatCPF = text => {
    return text
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const adicionarCrianca = () => {
    if (
      !novaCrianca.nome ||
      !novaCrianca.parentesco ||
      novaCrianca.dataNascimento.length !== 10
    ) {
      Alert.alert(
        'Atenção',
        'Preencha Nome, Data de Nascimento e o Parentesco.',
      );
      return;
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

  const handleSubmit = async () => {
    if (!responsavel.nome || !responsavel.cpf || !responsavel.telefone) {
      Alert.alert('Erro', 'Preencha os dados do responsável.');
      return;
    }
    if (criancas.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma criança.');
      return;
    }
    if (!assinaturaBase64) {
      Alert.alert('Erro', 'A assinatura é obrigatória.');
      return;
    }

    try {
      const formData = new FormData();

      formData.append('arquivo_assinatura', {
        uri: assinaturaBase64,
        type: 'image/png',
        name: `assinatura_${responsavel.cpf.replace(/\D/g, '')}.png`,
      });

      const dadosTexto = {
        responsavel: {
          nome: responsavel.nome,
          cpf: responsavel.cpf.replace(/\D/g, ''),
          telefone: responsavel.telefone,
          data_nascimento: responsavel.data_nascimento,
        },
        criancas_vinculadas: criancas.map(c => ({
          nome: c.nome,
          data_nascimento: c.dataNascimento,
          idade: c.idadeCalculada,
          parentesco: c.parentesco,
        })),
        data_hora: new Date().toISOString(),
      };

      formData.append('dados_cadastro', JSON.stringify(dadosTexto));

      console.log('--- ENVIANDO FORM DATA ---');
      console.log('Arquivo:', `assinatura_${responsavel.nome}.png`);
      console.log('Dados:', JSON.stringify(dadosTexto, null, 2));
      Alert.alert('Pronto', 'Assinatura Coletada com sucesso!.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao preparar os dados.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- MODAL DOS TERMOS --- */}
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
            <TermosConsentimento />
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

      {/* --- TELA PRINCIPAL --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft2 />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Cadastro de Responsável</Text>
          <Text style={styles.headerSubtitle}>
            Preencha os dados e colete a assinatura
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={scrollEnabled}
          keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Dados do Responsável</Text>
            </View>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              value={responsavel.nome}
              onChangeText={t => setResponsavel({...responsavel, nome: t})}
            />
            <View style={styles.row}>
              <View style={[styles.col, {marginRight: 10}]}>
                <Text style={styles.label}>CPF *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  keyboardType="numeric"
                  value={responsavel.cpf}
                  onChangeText={t =>
                    setResponsavel({...responsavel, cpf: formatCPF(t)})
                  }
                  maxLength={14}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Telefone *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  value={responsavel.telefone}
                  onChangeText={t =>
                    setResponsavel({
                      ...responsavel,
                      telefone: maskTelefone(t),
                    })
                  }
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View
              style={[styles.cardHeader, {justifyContent: 'space-between'}]}>
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
                        ({child.parentesco})
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

          {/* --- ÁREA DE ASSINATURA ATUALIZADA --- */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assinatura do Responsável *</Text>
            <Text style={styles.legalText}>
              Ao assinar, reitero minha concordância com os termos apresentados.
            </Text>

            <TouchableOpacity
              // Se já tem assinatura, removemos a altura fixa e o pontilhado para acomodar a imagem
              style={[
                styles.openSignatureButton,
                assinaturaBase64 && {
                  height: 'auto',
                  padding: 10,
                  borderStyle: 'solid',
                },
              ]}
              onPress={iniciarAssinatura}>
              {assinaturaBase64 ? (
                // SE EXISTE ASSINATURA: MOSTRA O PREVIEW (Imagem)
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
                // SE NÃO EXISTE: MOSTRA O TEXTO PADRÃO
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

          <TouchableOpacity
            style={[styles.submitButton, {opacity: assinaturaBase64 ? 1 : 0.7}]}
            onPress={handleSubmit}
            disabled={!assinaturaBase64}>
            <Text style={styles.submitButtonText}>CONFIRMAR CADASTRO</Text>
          </TouchableOpacity>
          <View style={{height: 60}} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAIS DE CADASTRO CRIANÇA E PARENTESCO (MANTIDOS) --- */}
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
                {novaCrianca.parentesco || 'Selecione o vínculo'}
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
            <FlatList
              data={parentescoOptions}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => selecionarParentesco(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalParentescoVisible(false)}
              style={styles.btnCloseFull}>
              <Text style={styles.btnCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE ASSINATURA --- */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButtonText: {color: '#000000', fontWeight: 'bold'},
  headerTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  headerSubtitle: {color: '#000000', fontSize: 12, marginLeft: 15},
  scrollContent: {padding: 16},

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
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
  childName: {fontWeight: 'bold', color: '#444', fontSize: 15},
  childParentesco: {fontWeight: 'normal', color: '#3E7D56', fontSize: 14},
  childInfoText: {fontSize: 13, color: '#888', marginTop: 2},
  deleteButtonText: {color: '#FF4444', fontSize: 12},
  addButtonText: {color: '#3E7D56', fontWeight: 'bold', fontSize: 14},
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
  submitButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 13},
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
  openSignatureButtonText: {color: '#3E7D56', fontWeight: 'bold', fontSize: 16},

  // ESTILO NOVO PARA O PREVIEW
  signaturePreview: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 5,
    backgroundColor: '#fff', // Fundo branco para destacar a assinatura
  },
  signatureCapturedText: {color: '#3E7D56', fontWeight: 'bold', fontSize: 14},

  clearLink: {
    color: '#FF4444',
    fontSize: 12,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  legalText: {fontSize: 12, color: '#666', marginBottom: 15, lineHeight: 18},

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
  optionText: {fontSize: 16, color: '#333', textAlign: 'center'},
  btnCloseFull: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#EEE',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCloseText: {color: '#555', fontWeight: 'bold'},

  termosContainer: {flex: 1, backgroundColor: '#fff'},
  termosHeader: {padding: 20, backgroundColor: '#3E7D56', alignItems: 'center'},
  termosTitle: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  termosSubtitle: {color: '#E0EFE5', fontSize: 14, marginTop: 5},
  termosScroll: {flex: 1, padding: 20},
  termosContent: {paddingBottom: 40},
  termosText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
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
  btnAceitarDisabled: {backgroundColor: '#ccc'},
  btnAceitarText: {color: '#fff', fontWeight: 'bold', fontSize: 16},

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
});
