import React, { useContext, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { HelpCircle, LogOut } from 'lucide-react-native';
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
      title: 'Ajuda',
      description: 'Dúvidas mais frequentes sobre o Senar Atendimento.',
      icon: HelpCircle,
    },
    {
      title: 'Sair',
      description:
        'Obrigado por usar nosso aplicativo! Esperamos vê-lo de volta em breve.',
      icon: LogOut,
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
    <Body>
      <Header />
      <LoadingInfo visible={loading} />
      <Container>
        {cardData.map((card, index) => (
          <Card key={index} onPress={() => handleCardPress(index)}>
            <card.icon size={24} color="#37C064" />
            <CardTextContainer>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardTextContainer>
          </Card>
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
