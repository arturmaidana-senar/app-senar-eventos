import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header() {
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

  return (
    <View style={styles.body}>
      <Image
        style={styles.logo}
        source={require('../../assets/images/logo_home.png')}
      />
      <Text style={styles.greeting}>Olá, {userName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 30,
  },
  greeting: {
    fontSize: 18,
    color: '#000',
  },
});
