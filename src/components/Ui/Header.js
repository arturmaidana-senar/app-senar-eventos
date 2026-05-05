import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    async function loadStorage() {
      try {
        const storageUser = await AsyncStorage.getItem('@eventUser');
        if (storageUser) {
          if (storageUser.includes('{')) {
            const parsedUser = JSON.parse(storageUser);
            const finalName =
              parsedUser.name ||
              parsedUser.nome ||
              parsedUser.user?.name ||
              parsedUser.user?.nome ||
              '';
            setUserName(finalName);
          } else {
            setUserName(storageUser);
          }
        }
      } catch (error) {
        console.error('Erro ao ler AsyncStorage no Header:', error);
      }
    }

    const updateDate = () => {
      const now = new Date();
      const days = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
      ];
      const months = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ];
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const monthName = months[now.getMonth()];
      setCurrentDate(`${day} de ${monthName} - ${dayName}`);
    };

    loadStorage();
    updateDate();
  }, []);

  const getInitials = name => {
    if (!name) return 'US';
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${
        nameParts[nameParts.length - 1][0]
      }`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatName = name => {
    if (!name) return 'Usuário';
    return name.toUpperCase();
  };

  const initials = getInitials(userName);
  const displayName = formatName(userName);

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
      </View>

      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require('../../assets/images/logo_home.png')}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F7F5', // Light background matching mockup
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: '#D1E7D3', // Subtle green for initials background
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#4A9954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textContainer: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 40,
  },
});

