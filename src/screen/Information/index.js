import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from '../../contexts/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import InformativeModal from '../../components/Modals/InformativeModal';
import Help from '../../components/Ui/Help';

const Information = () => {
  const { logoff, user } = useContext(AuthContext);
  const [userName, setUserName] = useState('');

  // Modal States
  const [showTerms, setShowTerms] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    async function loadUserName() {
      const storedName = await AsyncStorage.getItem('@eventUser');
      if (storedName) {
        setUserName(storedName);
      } else if (user?.name) {
        setUserName(user.name);
      }
    }
    loadUserName();
  }, [user]);

  const getInitials = name => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const menuGroups = [
    {
      title: 'CONTA',
      items: [
        {
          id: 'terms',
          title: 'Termos de uso',
          subtitle: 'Leia nossos termos e condições',
          icon: 'file-text',
          iconBg: '#E0F2FE',
          iconColor: '#0EA5E9',
          action: () => setShowTerms(true),
        },
        {
          id: 'updates',
          title: 'Notas de atualização',
          subtitle: 'O que há de novo no app',
          icon: 'refresh-cw',
          iconBg: '#F3E8FF',
          iconColor: '#9333EA',
          action: () => setShowUpdates(true),
        },
        {
          id: 'help',
          title: 'Ajuda',
          subtitle: 'Dúvidas sobre o Senar Atendimento',
          icon: 'help-circle',
          iconBg: '#F0FDF4',
          iconColor: '#22C55E',
          action: () => setShowHelp(true),
        },
      ],
    },
    {
      title: 'SESSÃO',
      items: [
        {
          id: 'logout',
          title: 'Sair',
          subtitle: 'Obrigado por usar nosso aplicativo!',
          icon: 'log-out',
          iconBg: '#FEF2F2',
          iconColor: '#EF4444',
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
        { version: 'v1.2.0', date: '04 de Maio, 2026', notes: ['Nova interface da home.', 'Dashboard de estatísticas.', 'Redesign do perfil.'] },
        { version: 'v1.1.5', date: '20 de Abril, 2026', notes: ['Busca de eventos.', 'Correções de performance.'] }
      ].map((update, idx) => (
        <View key={idx} style={styles.updateItem}>
          <View style={styles.updateHeader}>
            <Text style={styles.updateVersion}>{update.version}</Text>
            <Text style={styles.updateDate}>{update.date}</Text>
          </View>
          {update.notes.map((note, nIdx) => (
            <Text key={nIdx} style={styles.updateNote}>• {note}</Text>
          ))}
        </View>
      ))}
    </View>
  );

  const renderTerms = () => (
    <View style={styles.termsContent}>
      <Text style={styles.termsText}>
        Bem-vindo ao aplicativo SENAR Eventos. Ao utilizar nossos serviços, você concorda com as seguintes condições:
      </Text>
      <Text style={styles.termsTitle}>1. Coleta de Dados</Text>
      <Text style={styles.termsText}>
        Coletamos informações básicas para garantir sua inscrição em eventos e a emissão correta de certificados. Seus dados estão protegidos conforme a LGPD.
      </Text>
      <Text style={styles.termsTitle}>2. Uso do Aplicativo</Text>
      <Text style={styles.termsText}>
        O aplicativo deve ser utilizado apenas para fins relacionados aos eventos e capacitações promovidos pelo SENAR Mato Grosso.
      </Text>
      <Text style={styles.termsTitle}>3. Responsabilidades</Text>
      <Text style={styles.termsText}>
        O usuário é responsável pela veracidade dos dados informados no cadastro.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <LinearGradient
          colors={['#1B4332', '#2D6A4F', '#40916C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View
            style={[
              styles.circle,
              { top: -20, right: -20, width: 100, height: 100, opacity: 0.1 },
            ]}
          />
          <View
            style={[
              styles.circle,
              {
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                opacity: 0.05,
              },
            ]}
          />

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(userName)}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>PRODUTOR RURAL</Text>
              <Text style={styles.profileName} numberOfLines={1}>
                {userName.toUpperCase()}
              </Text>
              <Text style={styles.profileSub}>Membro SENAR Mato Grosso</Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <Feather name="award" size={14} color="#D8F3DC" />
            <Text style={styles.statusText}>Membro ativo desde 2024</Text>
          </View>
        </LinearGradient>

        {/* Menu Groups */}
        {menuGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={styles.menuItem}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <Feather name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[
                      styles.menuTitle,
                      item.isLogout && { color: '#EF4444' },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={{ height: 100 }} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileLabel: {
    color: '#D8F3DC',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
    opacity: 0.8,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileSub: {
    color: '#D8F3DC',
    fontSize: 12,
    opacity: 0.9,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  updateItem: {
    marginBottom: 20,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  updateVersion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B9348',
  },
  updateDate: {
    fontSize: 12,
    color: '#64748B',
  },
  updateNote: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  termsContent: {
    paddingBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  termsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
});

export default Information;
