import React, { useContext, useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Body, Logo, Greeting } from './styled';

export default function Header() {
  const [userName, setUserName] = useState('');

  async function loadStorage() {
    const storageUser = await AsyncStorage.getItem('@eventUser');
    setUserName(storageUser);
  }

  useEffect(() => {
    loadStorage();
  }, []);

  return (
    <Body>
      <Logo source={require('../../assets/images/logo_home.png')} />
      <Greeting>Olá, {userName}</Greeting>
    </Body>
  );
}
