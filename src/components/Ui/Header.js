import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function loadStorage() {
      try {
        console.log('--- DEBUG HEADER ASYNCSTORAGE ---');
        const storageUser = await AsyncStorage.getItem('@eventUser');
        console.log('1. Valor bruto retornado (@eventUser):', storageUser);

        if (storageUser) {
          if (storageUser.includes('{')) {
            const parsedUser = JSON.parse(storageUser);
            console.log('2. Objeto JSON parseado:', parsedUser);

            const finalName =
              parsedUser.name ||
              parsedUser.nome ||
              parsedUser.user?.name ||
              parsedUser.user?.nome ||
              '';

            console.log('3. Nome encontrado nas chaves:', finalName);
            setUserName(finalName);
          } else {
            console.log(
              '2. Valor salvo não é JSON, usando como string:',
              storageUser,
            );
            setUserName(storageUser);
          }
        } else {
          console.log('1. A chave @eventUser está vazia ou retornou null.');
        }
      } catch (error) {
        console.error('Erro ao ler AsyncStorage no Header:', error);
      }
    }

    loadStorage();
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
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length <= 2) return name;

    const primeiro = parts[0];
    const ultimo = parts[parts.length - 1];
    const meio = parts
      .slice(1, -1)
      .map(n => `${n[0]}.`)
      .join(' ');

    return `${primeiro} ${meio} ${ultimo}`;
  };

  const initials = getInitials(userName);

  const displayName = formatName(userName);

  return (
    <View style={[styles.container, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View>
          <Text style={styles.welcomeText}>Bem-vindo(a)</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 15,
    color: '#8A8A8A',
    marginBottom: 2,
  },
  userName: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 35,
  },
});
