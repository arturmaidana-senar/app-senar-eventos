import React, {createContext, useState, useEffect, useReducer} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Alert} from 'react-native';
import {initialState, UserReducer} from '../reducers/UserReducer';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';

export const AuthContext = createContext();

export default ({children}) => {
  const navigation = useNavigation();
  const [state, dispatch] = useReducer(UserReducer, initialState);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStorage() {
    try {
      const storageUser = await AsyncStorage.getItem('@eventToken');
      if (storageUser) {
        const response = await api.get('/user', {
          headers: {Authorization: `Bearer ${storageUser}`},
        });
        if (response.data) {
          api.defaults.headers['Authorization'] = `Bearer ${storageUser}`;
          setUser(response.data);
          navigation.reset({routes: [{name: 'TabNavigator'}]});
        } else {
          navigation.reset({routes: [{name: 'SignIn'}]});
        }
      } else {
        navigation.reset({routes: [{name: 'SignIn'}]});
      }
    } catch (error) {
      navigation.reset({routes: [{name: 'SignIn'}]});
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    setLoadingAuth(true);

    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'DEBUG BASEURL',
      textBody:
        `baseURL:\n${api.defaults.baseURL}\n\n` +
        `URL FINAL:\n${(api.defaults.baseURL || '') + '/auth/login'}`,
      button: 'OK',
    });

    // Pegamos a URL base para saber exatamente para onde o APK está enviando
    const urlCompleta = (api.defaults.baseURL || '') + '/auth/login';

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      // Verificação de erro dentro do sucesso (caso a API retorne 200 mas com flag de erro)
      if (response?.data?.error || response?.data?.success === false) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro de Negócio',
          textBody: `Mensagem: ${response.data.message}\n\nURL: ${urlCompleta}`,
          button: 'Fechar',
        });
      }

      const accessToken = response?.data.token || '';
      await AsyncStorage.setItem('@eventToken', accessToken);
      await loadStorage();
    } catch (err) {
      let mensagemDebug = '';

      if (err.response) {
        // O servidor respondeu com erro (Ex: 401, 404, 500)
        mensagemDebug =
          `STATUS: ${err.response.status}\n\n` +
          `RESPOSTA: ${JSON.stringify(err.response.data)}\n\n` +
          `URL: ${urlCompleta}`;
      } else if (err.request) {
        // A requisição foi feita mas o servidor não respondeu (Rede/DNS/Timeout)
        mensagemDebug =
          `ERRO DE REDE: Sem resposta do servidor.\n\n` +
          `URL TENTADA: ${urlCompleta}\n\n` +
          `DETALHE: ${err.message}`;
      } else {
        // Erro ao configurar a requisição
        mensagemDebug = `ERRO INTERNO: ${err.message}`;
      }

      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'DEBUG LOGIN (APK)',
        textBody:
          `❌ MOTIVO DO ERRO:\n${motivo}\n\n` +
          `🌐 BASE URL:\n${api.defaults.baseURL}\n\n` +
          `➡️ ROTA COMPLETA:\n${urlCompleta}`,
        button: 'Fechar',
      });

      console.log('ERRO AO LOGAR:', err);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function logoff() {
    setUser(null);
    await AsyncStorage.setItem('@eventToken', '');
    navigation.reset({routes: [{name: 'SignIn'}]});
  }

  return (
    <AuthContext.Provider
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
    </AuthContext.Provider>
  );
};
