import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  HelpCircle,
  LifeBuoy,
  Sparkles,
  FileText,
  RefreshCw,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../contexts/auth';

// Components
import InformativeModal from '../../components/Modals/InformativeModal';
import Help from '../../components/Ui/Help';

const Information = () => {
  const { logoff, user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');

  // Modal States
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function loadUserName() {
      if (user?.name) {
        setUserName(user.name);
        return;
      }
      const storedName = await AsyncStorage.getItem('@eventUser');
      if (storedName) {
        setUserName(storedName);
      }
    }
    loadUserName();
  }, [user]);

  const getInitials = name => {
    if (!name) return 'OR';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = userName || user?.name || 'Organizador';
  const displayEmail = user?.email || 'SENAR Mato Grosso';

  const accountItems = [
    {
      id: 'terms',
      title: 'Termos de uso',
      subtitle: 'Leia nossos termos e condições',
      Icon: FileText,
      iconBg: '#EDF4EE',
      iconColor: '#2F5E38',
      action: () => setShowTerms(true),
    },
    {
      id: 'updates',
      title: 'Notas de atualização',
      subtitle: 'O que há de novo no aplicativo',
      Icon: RefreshCw,
      iconBg: '#FEF5E4',
      iconColor: '#B5632E',
      action: () => setShowUpdates(true),
    },
    {
      id: 'help',
      title: 'Ajuda e suporte',
      subtitle: 'Dúvidas sobre o SENAR Eventos',
      Icon: HelpCircle,
      iconBg: '#EBF3ED',
      iconColor: '#2F5E38',
      action: () => setShowHelp(true),
    },
  ];

  const renderUpdates = () => (
    <View>
      {[
        {
          version: 'v1.2.0',
          date: '13 de Novembro, 2026',
          notes: [
            'Nova interface orgânica na Home, Eventos, Detalhes e Perfil.',
            'Leitor de QR Code aprimorado com animação de captura.',
            'Novos modais de aviso e navbar flutuante.',
          ],
        },
        {
          version: 'v1.1.5',
          date: '20 de Abril, 2026',
          notes: ['Busca de eventos.', 'Correções de performance.'],
        },
      ].map((update, idx) => (
        <View key={idx} style={styles.updateItem}>
          <View style={styles.updateHeader}>
            <Text style={styles.updateVersion}>{update.version}</Text>
            <Text style={styles.updateDate}>{update.date}</Text>
          </View>
          {update.notes.map((note, nIdx) => (
            <Text key={nIdx} style={styles.updateNote}>
              • {note}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  const renderTerms = () => (
    <View style={styles.termsContent}>
      <Text style={styles.termsText}>
        Bem-vindo ao aplicativo SENAR Eventos. Ao utilizar nossos serviços, você
        concorda com as seguintes condições:
      </Text>
      <Text style={styles.termsTitle}>1. Coleta de Dados</Text>
      <Text style={styles.termsText}>
        Coletamos informações básicas para garantir a inscrição em eventos e a
        emissão correta de certificados. Seus dados estão protegidos conforme a
        LGPD.
      </Text>
      <Text style={styles.termsTitle}>2. Uso do Aplicativo</Text>
      <Text style={styles.termsText}>
        O aplicativo deve ser utilizado apenas para fins relacionados aos eventos
        e capacitações promovidos pelo SENAR Mato Grosso.
      </Text>
      <Text style={styles.termsTitle}>3. Responsabilidades</Text>
      <Text style={styles.termsText}>
        O usuário é responsável pela veracidade dos dados informados no
        cadastro.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={true}
        barStyle="dark-content"
        backgroundColor="#F6F7F2"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 20) + 12,
            paddingBottom: Math.max(insets.bottom, 20) + 96,
          },
        ]}
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrowText}>MINHA CONTA</Text>
            <Text style={styles.pageTitle}>Meu perfil</Text>
            <Text style={styles.pageSubtitle}>
              Gerencie sua conta e preferências do app.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowHelp(true)}
            activeOpacity={0.75}
          >
            <HelpCircle size={19} color="#18221B" />
          </TouchableOpacity>
        </View>

        {/* Hero Profile Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#1E4B31', '#2E6241', '#3E7751']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroCircleDecor} />

          <View style={styles.heroContent}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>ORGANIZADOR ATIVO</Text>
            </View>

            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={2}>
                  {displayName}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {displayEmail}
                </Text>
              </View>
            </View>

            <View style={styles.heroInnerBox}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Instituição</Text>
                <Text style={styles.heroStatValue}>SENAR MT</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Função</Text>
                <Text style={styles.heroStatValue}>Credenciamento</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Two Quick Action Cards */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionHalf}
            onPress={() => setShowHelp(true)}
            activeOpacity={0.85}
          >
            <View style={styles.primaryQuickCard}>
              <LinearGradient
                colors={['#437A56', '#2F5E3E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.primaryQuickContent}>
                <View style={styles.primaryQuickIconBox}>
                  <LifeBuoy size={19} color="#FFFFFF" />
                </View>
                <View style={styles.quickTextWrap}>
                  <Text style={styles.primaryQuickTitle}>Central de Ajuda</Text>
                  <Text style={styles.primaryQuickSub}>Suporte rápido</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionHalf}
            onPress={() => setShowUpdates(true)}
            activeOpacity={0.82}
          >
            <View style={styles.secondaryQuickCard}>
              <View style={styles.secondaryQuickIconBox}>
                <Sparkles size={18} color="#2F5E38" />
              </View>
              <View style={styles.quickTextWrap}>
                <Text style={styles.secondaryQuickTitle}>Novidades</Text>
                <Text style={styles.secondaryQuickSub}>Versão v1.2.0</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Section Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>PREFERÊNCIAS</Text>
          <Text style={styles.sectionHeading}>Conta e informações</Text>

          {accountItems.map((item, idx) => {
            const MenuIcon = item.Icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuRow,
                  idx < accountItems.length - 1 && styles.menuRowBorder,
                ]}
                onPress={item.action}
                activeOpacity={0.75}
              >
                <View
                  style={[styles.menuIconBox, { backgroundColor: item.iconBg }]}
                >
                  <MenuIcon size={18} color={item.iconColor} />
                </View>

                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <ChevronRight size={18} color="#9AA39B" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Session Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>SESSÃO</Text>
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={() => setShowLogoutConfirm(true)}
            activeOpacity={0.75}
          >
            <View style={styles.logoutIconBox}>
              <LogOut size={18} color="#C94A38" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.logoutTitle}>Sair da conta</Text>
              <Text style={styles.menuSubtitle}>
                Encerrar sessão neste dispositivo
              </Text>
            </View>
            <ChevronRight size={18} color="#D48B80" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <InformativeModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        title="Termos de Uso"
      >
        {renderTerms()}
      </InformativeModal>

      <InformativeModal
        visible={showUpdates}
        onClose={() => setShowUpdates(false)}
        title="Notas de Atualização"
      >
        {renderUpdates()}
      </InformativeModal>

      <Help visible={showHelp} onClose={() => setShowHelp(false)} />

      {/* Custom Logout Confirmation Modal */}
      <Modal
        transparent
        visible={showLogoutConfirm}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLogoutConfirm(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.confirmCard}>
                <View style={styles.confirmIconBox}>
                  <LogOut size={24} color="#C94A38" />
                </View>
                <Text style={styles.confirmEyebrow}>ENCERRAR SESSÃO</Text>
                <Text style={styles.confirmTitle}>Sair da sua conta?</Text>
                <Text style={styles.confirmBody}>
                  Você precisará informar seu e-mail e senha novamente para
                  acessar os eventos.
                </Text>

                <View style={styles.confirmActionsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowLogoutConfirm(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmLogoutBtn}
                    onPress={() => {
                      setShowLogoutConfirm(false);
                      logoff();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.confirmLogoutBtnText}>Sair</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 3,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#18221B',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6E786F',
    marginTop: 2,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 20,
  },
  heroCircleDecor: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    gap: 6,
    marginBottom: 16,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3E8E58',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#18221B',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },
  heroInnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.72)',
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginHorizontal: 14,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickActionHalf: {
    flex: 1,
  },
  primaryQuickCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryQuickContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
    minHeight: 72,
  },
  primaryQuickIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrap: {
    flex: 1,
  },
  primaryQuickTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryQuickSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
  },
  secondaryQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
    minHeight: 72,
  },
  secondaryQuickIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EDF4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryQuickTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18221B',
  },
  secondaryQuickSub: {
    fontSize: 11,
    color: '#7A847B',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    padding: 18,
    marginBottom: 14,
  },
  sectionEyebrow: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#2F5E38',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18221B',
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2EB',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#18221B',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#7A847B',
    marginTop: 2,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    gap: 12,
  },
  logoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FDF0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#C94A38',
  },
  updateItem: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2EB',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateVersion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F5E38',
  },
  updateDate: {
    fontSize: 12,
    color: '#7A847B',
  },
  updateNote: {
    fontSize: 13.5,
    color: '#465248',
    lineHeight: 20,
    marginBottom: 4,
  },
  termsContent: {
    paddingBottom: 16,
  },
  termsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18221B',
    marginTop: 14,
    marginBottom: 6,
  },
  termsText: {
    fontSize: 13.5,
    color: '#5F6A61',
    lineHeight: 21,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 34, 24, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5EAE0',
  },
  confirmIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FDF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#C94A38',
    marginBottom: 5,
  },
  confirmTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#18221B',
    marginBottom: 8,
  },
  confirmBody: {
    fontSize: 14,
    color: '#5F6A61',
    lineHeight: 21,
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F3F5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#465248',
  },
  confirmLogoutBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#C94A38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default Information;
