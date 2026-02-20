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
            setUser(response.data);
            await AsyncStorage.setItem('@eventUser', response.data.name);
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

  // https://sgee-atende.senarmt.org.br/api/v1/auth/evento-atendimento/validar-token
  // https://api.appateg.senarmt.org.br/api/doubts/1
  // https://eventos.senarmt.org.br/api/auth/recuperar-senha
  async function signIn(email, password) {
    setLoadingAuth(true);

    // axios.get('https://eventos.senarmt.org.br/api/auth/recuperar-senha')
    // .then(response => {
    //     setLoadingAuth(false);
    //     // console.log('TUDO CERTO,', response);
    // })
    // .catch(error => {
    //     setLoadingAuth(false);
    //     console.log('Erro no Axios:', error);
    // });

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
      });

      if (response?.data.register == 'update') {
        return Alert.alert('Aviso', response?.data.message, [
          { text: 'Ok', onPress: () => newRegister() },
          { text: 'Cancelar', onPress: null, styled: 'cancel' },
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

      // Salva o token no AsyncStorage
      await AsyncStorage.setItem('@eventToken', accessToken);

      // Chama a função loadStorage para atualizar o estado com o novo token
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
    const accessToken = '';
    await AsyncStorage.setItem('@eventToken', accessToken);
    await loadStorage();
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
