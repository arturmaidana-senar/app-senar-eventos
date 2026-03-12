import React, { createContext, useState, useEffect, useReducer } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { initialState, UserReducer } from '../reducers/UserReducer';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import axios from 'axios';

export const AuthContext = createContext();

export default ({ children }) => {
  const navigation = useNavigation();
  const [state, dispatch] = useReducer(UserReducer, initialState);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStorage() {
    try {
      const storageToken = await AsyncStorage.getItem('@eventToken');

      if (storageToken) {
        const response = await api.get('/user', {
          headers: {
            Authorization: `Bearer ${storageToken}`,
          },
        });

        if (response.data) {
          api.defaults.headers['Authorization'] = `Bearer ${storageToken}`;

          setUser(response.data);
          await AsyncStorage.setItem('@eventUser', response.data.name ?? '');
          navigation.reset({ routes: [{ name: 'TabNavigator' }] });
        } else {
          await AsyncStorage.removeItem('@eventToken');
          navigation.reset({ routes: [{ name: 'SignIn' }] });
        }
      } else {
        navigation.reset({ routes: [{ name: 'SignIn' }] });
      }
    } catch (error) {
      await AsyncStorage.removeItem('@eventToken');
      console.error('Erro ao carregar o armazenamento:', error);
      navigation.reset({ routes: [{ name: 'SignIn' }] });
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    setLoadingAuth(true);

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      if (response?.data.register == 'update') {
        return Alert.alert('Aviso', response?.data.message, [
          { text: 'Ok', onPress: () => newRegister() },
          { text: 'Cancelar', onPress: null, style: 'cancel' },
        ]);
      }

      if (response?.data.error) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: response?.data.message,
          button: 'Fechar',
        });
      }

      const accessToken = response?.data.token || '';

      if (!accessToken) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: 'Token não recebido. Contate o suporte.',
          button: 'Fechar',
        });
      }

      await AsyncStorage.setItem('@eventToken', accessToken);
      await loadStorage();
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
    await AsyncStorage.removeItem('@eventToken');
    await AsyncStorage.removeItem('@eventUser');
    navigation.reset({ routes: [{ name: 'SignIn' }] });
  }

  async function newRegister() {
    navigation.navigate('ResetPassword');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
