import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/auth';

// Components
import InformativeModal from '../../components/Modals/InformativeModal';
import Help from '../../components/Ui/Help';
import api from './../../services/endpont';
import LoadingInfo from '../../components/Ui/LoadingInfo';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export const Body = styled.View`
  flex: 1;
  background-color: #f8f8f8;
`;

const Container = styled(ScrollView)`
  flex: 1;
  background-color: #fafafa;
  padding: 16px;
`;

const Card = styled.TouchableOpacity`
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: center;
`;

const CardTextContainer = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #2b9348;
`;

const CardDescription = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const Information = () => {
  const { logoff, user, refreshUser } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    async function loadUserName() {
      if (user?.name) {
        setUserName(user.name);
        return;
      }
      const storedName = await AsyncStorage.getItem('@eventUser');
      if (storedName) {
        if (storedName.includes('{')) {
          try {
            const parsed = JSON.parse(storedName);
            setUserName(parsed.name || parsed.nome || '');
          } catch {
            setUserName(storedName);
          }
        } else {
          setUserName(storedName);
        }
      }
    }
    loadUserName();
  }, [user]);

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatMaskedCpf = cpf => {
    if (!cpf) return null;
    const digits = String(cpf).replace(/\D/g, '');
    if (digits.length !== 11) return null;
    return `CPF •••.${digits.slice(3, 6)}.${digits.slice(6, 9)}-••`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updated = await refreshUser();
      if (updated?.name) {
        setUserName(updated.name);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const displayName = userName || user?.name || 'Participante';
  const maskedCpf = formatMaskedCpf(user?.cpf);

  const menuGroups = [
    {
      title: 'CONTA E SUPORTE',
      items: [
        {
          id: 'terms',
          title: 'Termos de uso',
          subtitle: 'Leia nossos termos e condições',
          icon: 'file-text',
          iconBg: '#EDF1E6',
          iconColor: '#2F5E38',
          action: () => setShowTerms(true),
        },
        {
          id: 'updates',
          title: 'Notas de atualização',
          subtitle: 'O que há de novo no app',
          icon: 'refresh-cw',
          iconBg: '#EDF1E6',
          iconColor: '#2F5E38',
          action: () => setShowUpdates(true),
        },
        {
          id: 'help',
          title: 'Ajuda',
          subtitle: 'Dúvidas sobre o Senar Atendimento',
          icon: 'help-circle',
          iconBg: '#EDF1E6',
          iconColor: '#2F5E38',
          action: () => setShowHelp(true),
        },
      ],
    },
    {
      title: 'SESSÃO',
      items: [
        {
          id: 'logout',
          title: 'Sair da conta',
          subtitle: 'Encerrar sessão neste dispositivo',
          icon: 'log-out',
          iconBg: '#FDF0EE',
          iconColor: '#C94A38',
          isLogout: true,
          action: () => {
            Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', onPress: logoff, style: 'destructive' },
            ]);
          },
        },
      ],
    },
  ];

  const renderUpdates = () => (
    <View>
      {[
        {
          version: 'v1.2.0',
          date: '04 de Maio, 2026',
          notes: [
            'Nova interface da home.',
            'Tela de ingressos com check-in.',
            'Redesign do perfil e detalhes do evento.',
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
        Coletamos informações básicas para garantir sua inscrição em eventos e a
        emissão correta de certificados. Seus dados estão protegidos conforme a
        LGPD.
      </Text>
      <Text style={styles.termsTitle}>2. Uso do Aplicativo</Text>
      <Text style={styles.termsText}>
        O aplicativo deve ser utilizado apenas para fins relacionados aos
        eventos e capacitações promovidos pelo SENAR Mato Grosso.
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

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.breadcrumbRow}>
          <Text style={styles.breadcrumbMuted}>Meu Senar</Text>
          <Text style={styles.breadcrumbSlash}> / </Text>
          <Text style={styles.breadcrumbActive}>Perfil</Text>
        </View>

        <View style={styles.topAvatarCircle}>
          <Text style={styles.topAvatarText}>{getInitials(displayName)}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 92 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2F5E38']}
            tintColor="#2F5E38"
          />
        }
      >
        {/* Page Header */}
        <View style={styles.headerSection}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>MINHA CONTA</Text>
          </View>
          <Text style={styles.pageTitle}>Seu perfil e preferências.</Text>
        </View>

        {/* Hero Profile Card */}
        <LinearGradient
          colors={['#12261B', '#1B3B29', '#275438']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.decorCircleOne} />
          <View style={styles.decorCircleTwo} />

          <View style={styles.profileEyebrowRow}>
            <View style={styles.profileEyebrowDot} />
            <Text style={styles.profileEyebrow}>CONTA CONECTADA</Text>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarRing}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={2}>
                {displayName}
              </Text>
              {user?.email ? (
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              ) : (
                <Text style={styles.profileEmail}>Senar Mato Grosso</Text>
              )}
            </View>
          </View>

          <View style={styles.profileFooterRow}>
            <View style={styles.statusBadge}>
              <Feather name="shield" size={13} color="#D8E5A8" />
              <Text style={styles.statusText}>
                {maskedCpf || 'Acesso autenticado'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Groups */}
        {menuGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    iIdx < group.items.length - 1 && styles.menuItemDivider,
                  ]}
                  onPress={item.action}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.iconBg },
                    ]}
                  >
                    <Feather
                      name={item.icon}
                      size={18}
                      color={item.iconColor}
                    />
                  </View>

                  <View style={styles.menuTextContainer}>
                    <Text
                      style={[
                        styles.menuTitle,
                        item.isLogout && styles.logoutTitle,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={18}
                    color={item.isLogout ? '#E29D93' : '#9AA39B'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerQuoteRow}>
            <Feather name="feather" size={14} color="#7A847B" />
            <Text style={styles.footerQuote}>
              Cultivando conhecimento. Transformando vidas.
            </Text>
          </View>
          <Text style={styles.footerMeta}>
            Senar Mato Grosso · Juntos pelo campo.
          </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F2',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EDE3',
    backgroundColor: '#F6F7F2',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbMuted: {
    fontSize: 13,
    color: '#7D877E',
    fontWeight: '500',
  },
  breadcrumbSlash: {
    fontSize: 13,
    color: '#A5AEA5',
  },
  breadcrumbActive: {
    fontSize: 13,
    color: '#1E2A21',
    fontWeight: '700',
  },
  topAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF1E6',
    borderWidth: 1,
    borderColor: '#D6DFCA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F5E38',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    marginBottom: 18,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#67996B',
    marginRight: 8,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#677468',
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
    color: '#18221B',
    letterSpacing: -0.5,
  },
  profileCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#12261B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  decorCircleOne: {
    position: 'absolute',
    top: -28,
    right: -28,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorCircleTwo: {
    position: 'absolute',
    bottom: -36,
    left: -24,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(216, 229, 168, 0.06)',
  },
  profileEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileEyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8E5A8',
    marginRight: 7,
  },
  profileEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(216, 229, 168, 0.45)',
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
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '500',
  },
  profileFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E6EFCE',
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#677468',
    marginBottom: 10,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAE0',
    overflow: 'hidden',
    shadowColor: '#18221B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFF2EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18221B',
    marginBottom: 2,
  },
  logoutTitle: {
    color: '#C94A38',
  },
  menuSubtitle: {
    fontSize: 12.5,
    color: '#6E786F',
  },
  footer: {
    marginTop: 12,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#E5EAE0',
  },
  footerQuoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  footerQuote: {
    fontSize: 13,
    color: '#6E786F',
    fontWeight: '500',
  },
  footerMeta: {
    fontSize: 12,
    color: '#8D968E',
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
    marginBottom: 3,
  },
  termsContent: {
    paddingBottom: 8,
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
    color: '#465248',
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default Information;
