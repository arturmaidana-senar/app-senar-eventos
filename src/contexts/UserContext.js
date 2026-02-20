import React, { createContext, useState, useEffect, useReducer } from 'react';
import { useNavigation } from '@react-navigation/native';
import { initialState, UserReducer } from '../reducers/UserReducer';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

export const UserContext = createContext();

export default ({ children }) => {
  const navigation = useNavigation();
  const [state, dispatch] = useReducer(UserReducer, initialState);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define a função loadStorage fora do useEffect para que possa ser chamada de qualquer lugar dentro do componente
  async function loadStorage() {
    try {
      const storageUser = await AsyncStorage.getItem('@eventToken');
      if (storageUser) {
        const response = await api.get('/user', {
          headers: {
            Authorization: `Bearer ${storageUser}`,
          },
        });
        try {
          if (response.data) {
            api.defaults.headers['Authorization'] = `Bearer ${storageUser}`;
            setUser(response.data.data.user);
            await AsyncStorage.setItem(
              '@eventUser',
              response.data.data.user.name,
            );
            navigation.reset({ routes: [{ name: 'TabNavigator' }] });
          } else {
            navigation.reset({ routes: [{ name: 'SignIn' }] });
          }
        } finally {
          setUser(null);
          setLoading(false);
        }
      } else {
        navigation.reset({ routes: [{ name: 'SignIn' }] });
        setUser(null);
      }
    } catch (error) {
      await AsyncStorage.setItem('@eventToken', '');
      console.error('Erro ao carregar o armazenamento:', error);
      navigation.reset({ routes: [{ name: 'SignIn' }] });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //loadStorage();
  }, []);

  async function signIn(email, password) {
    setLoadingAuth(true);
    try {
      const response = await api.post('/login', {
        email: email,
        password: password,
      });

      const accessToken = response?.data?.data?.access_token || '';

      // Salva o token no AsyncStorage
      await AsyncStorage.setItem('@atendeToken', accessToken);

      // Chama a função loadStorage para atualizar o estado com o novo token
      await loadStorage(); // Use await para garantir que loadStorage seja concluída antes de prosseguir
    } catch (err) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: 'Credenciais inválidas',
        button: 'Fechar',
      });
      console.log('ERRO AO LOGAR ', err);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function logoff() {
    setUser(null);
    const accessToken = '';
    await AsyncStorage.setItem('@eventToken', accessToken);
    await loadStorage();
  }

  return (
    <UserContext.Provider
      value={{
        signed: !!user,
        user,
        state,
        dispatch,
        signIn,
        loadingAuth,
        loading,
        logoff,
        loadStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
