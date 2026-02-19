import React, {createContext, useState, useEffect, useReducer} from 'react';
import {useNavigation} from '@react-navigation/native';
import {initialState, UserReducer} from '../reducers/UserReducer';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';

export const UserContext = createContext();

export default ({children}) => {
  const navigation = useNavigation();
  const [state, dispatch] = useReducer(UserReducer, initialState);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define a função loadStorage fora do useEffect para que possa ser chamada de qualquer lugar dentro do componente
  async function loadStorage() {
    try {
      const storageUser = await AsyncStorage.getItem('@eventToken');

      Dialog.show({
        type: ALERT_TYPE.INFO,
        title: 'Debug',
        textBody: storageUser
          ? 'Token encontrado no storage'
          : 'Nenhum token no storage',
        button: 'OK',
      });

      if (!storageUser) {
        navigation.reset({routes: [{name: 'SignIn'}]});
        return;
      }

      api.defaults.headers['Authorization'] = `Bearer ${storageUser}`;

      Dialog.show({
        type: ALERT_TYPE.INFO,
        title: 'Debug',
        textBody: 'Buscando /user com token',
        button: 'OK',
      });

      const response = await api.get('/user');

      console.log('RESPOSTA /user:', response.data);

      if (response?.data?.data?.user) {
        setUser(response.data.data.user);

        await AsyncStorage.setItem('@eventUser', response.data.data.user.name);

        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Login OK',
          textBody: `Bem-vindo ${response.data.data.user.name}`,
          button: 'OK',
        });

        navigation.reset({
          routes: [{name: 'TabNavigator'}],
        });
      } else {
        throw new Error('Usuário inválido');
      }
    } catch (error) {
      console.log('ERRO loadStorage:', error);

      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro ao validar login',
        textBody: error.message,
        button: 'Fechar',
      });

      await AsyncStorage.removeItem('@eventToken');
      setUser(null);
      navigation.reset({routes: [{name: 'SignIn'}]});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //loadStorage();
  }, []);

  async function signIn(email, password) {
    setLoadingAuth(true);

    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Debug',
      textBody: 'Iniciando login...',
      button: 'OK',
    });

    try {
      Dialog.show({
        type: ALERT_TYPE.INFO,
        title: 'Debug',
        textBody: `Chamando API /login\nEmail: ${email}`,
        button: 'OK',
      });

      const response = await api.post('/login', {
        email,
        password,
      });

      console.log('RESPOSTA LOGIN:', response?.data);

      const accessToken = response?.data?.data?.access_token;

      if (!accessToken) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: 'Login retornou sem token',
          button: 'Fechar',
        });
        return;
      }

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Debug',
        textBody: `Token recebido:\n${accessToken.substring(0, 20)}...`,
        button: 'OK',
      });

      // 🔥 USANDO A MESMA CHAVE
      await AsyncStorage.setItem('@eventToken', accessToken);

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Debug',
        textBody: 'Token salvo no AsyncStorage',
        button: 'OK',
      });

      await loadStorage();
    } catch (err) {
      console.log('ERRO LOGIN:', err);

      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro no login',
        textBody: err?.response
          ? `Status: ${err.response.status}\n${JSON.stringify(
              err.response.data,
            )}`
          : err.message,
        button: 'Fechar',
      });
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
      }}>
      {children}
    </UserContext.Provider>
  );
};
