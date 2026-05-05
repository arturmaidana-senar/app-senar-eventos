import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const DashboardBanner = ({ stats = { total: 0, realizados: 0, aguardando: 0 } }) => {
  return (
    <LinearGradient
      colors={['#1B4332', '#2D6A4F', '#40916C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={[styles.circle, { top: -20, right: -20, width: 100, height: 100, opacity: 0.1 }]} />
      <View style={[styles.circle, { bottom: -30, left: -30, width: 150, height: 150, opacity: 0.05 }]} />

      <View style={styles.header}>
        <Feather name="sparkles" size={16} color="#B7E4C7" />
        <Text style={styles.headerTitle}>PAINEL PRINCIPAL</Text>
      </View>

      <Text style={styles.welcomeTitle}>Bem-vindo de volta! 🌿</Text>
      <Text style={styles.subtitle}>Descubra os próximos eventos do SENAR</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Feather name="trending-up" size={18} color="#B7E4C7" />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Feather name="users" size={18} color="#B7E4C7" />
          <Text style={styles.statValue}>{stats.realizados}</Text>
          <Text style={styles.statLabel}>Realizados</Text>
        </View>

        <View style={styles.statCard}>
          <Feather name="star" size={18} color="#B7E4C7" />
          <Text style={styles.statValue}>{stats.aguardando}</Text>
          <Text style={styles.statLabel}>Aguardando</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#B7E4C7',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    color: '#D8F3DC',
    fontSize: 12,
    marginBottom: 16,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statLabel: {
    color: '#B7E4C7',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});


export default DashboardBanner;
