import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Preferences } from '@capacitor/preferences';
import { storage } from '@/lib/storage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export const AXIOS_INSTANCE = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Ignora o aviso do ngrok
  },
  proxy: false, // Desabilita proxy local
  family: 4 // Força IPv4
});

// Interceptor para adicionar o token de autenticação
AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  try {
    const token = await storage.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.error('❌ Erro ao obter token:', error)
  }
  return config
});

// Interceptor para tratamento de erros
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    console.log('Resposta:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    return Promise.reject(error);
  }
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  
  // Garante que os headers personalizados são mantidos
  const mergedConfig = {
    ...config,
    headers: {
      ...config.headers,
      'ngrok-skip-browser-warning': 'true'
    },
    cancelToken: source.token,
  };

  const promise = AXIOS_INSTANCE(mergedConfig).then(({ data }) => data);

  // @ts-expect-error - Adicionando propriedade cancel ao Promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default AXIOS_INSTANCE; 