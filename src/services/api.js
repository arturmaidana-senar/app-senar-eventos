import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  //baseURL: 'http://192.168.201.15/api'
  //baseURL: 'http://192.168.0.203/api'
  //baseURL: 'http://192.168.202.3/api',
  //baseURL: 'https://heventos.senarmt.org.br/api',
  baseURL: 'https://heventos.senarmt.org.br/api',
});

api.interceptors.request.use(async config => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url, config.data || config.params || '');
  try {
    // Só injeta se ainda não tiver token no header
    if (!config.headers['Authorization']) {
      const chaves = await AsyncStorage.getAllKeys();
      const possiveisNomes = [
        '@token',
        'token',
        'userToken',
        'access_token',
        'sessao',
      ];

      for (const nome of possiveisNomes) {
        const chaveReal = chaves.find(k =>
          k.toLowerCase().includes(nome.toLowerCase().replace('@', '')),
        );
        if (chaveReal) {
          const valor = await AsyncStorage.getItem(chaveReal);
          if (valor) {
            let token = valor.includes('{') ? JSON.parse(valor).token : valor;
            if (token) {
              config.headers['Authorization'] = `Bearer ${token}`;
              break;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Interceptor erro ao buscar token:', e);
  }

  return config;
});

api.interceptors.response.use(
  response => {
    console.log('[API Response Success]', response.config?.url, response.status, response.data);
    return response;
  },
  error => {
    console.log('[API Response Error]', error.config?.url, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;
