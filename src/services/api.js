import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://192.168.201.15/api'
  //baseURL: 'http://192.168.0.113/api'
  baseURL: 'https://heventos.senarmt.org.br/api',
  //baseURL: 'https://eventos.senarmt.org.br/api',
});

export default api;
