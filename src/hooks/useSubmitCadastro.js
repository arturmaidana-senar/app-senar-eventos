import { useState } from 'react';
import { Alert } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import endpoint from '../services/endpont';
import { formatForBackend } from '../utils/formatters';

export default function useSubmitCadastro({
  currentEventId,
  participante,
  criancas,
  isAutoridade,
  selectedAutoridade,
  hasTerm,
  assinaturaBase64,
  termoTexto,
  validarIdadeParticipante,
  onSuccess,
}) {
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const getAuthToken = async () => {
    let token =
      api.defaults.headers.common['Authorization'] ||
      api.defaults.headers['Authorization'];

    if (!token) {
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
            token = valor.includes('{') ? JSON.parse(valor).token : valor;
            if (token) break;
          }
        }
      }
    }

    if (token && !token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }

    return token;
  };

  const buildFormData = () => {
    const formData = new FormData();
    const participanteConfirmado =
      criancas.length === 0 ? true : participante.isParticipante;

    formData.append('participante[nome]', participante.nome);
    formData.append('participante[cpf]', participante.cpf.replace(/\D/g, ''));
    formData.append('participante[telefone]', participante.telefone);
    formData.append(
      'participante[birth_date]',
      formatForBackend(participante.data_nascimento),
    );
    formData.append('participante[gender_id]', participante.sexo);
    formData.append(
      'participante[is_participante]',
      participanteConfirmado ? '1' : '0',
    );

    if (isAutoridade && selectedAutoridade) {
      formData.append('participante[autoridade_id]', selectedAutoridade.id);
    }

    if (hasTerm && assinaturaBase64) {
      formData.append('participante[assinatura_png]', {
        uri: assinaturaBase64,
        type: 'image/png',
        name: `assinatura.png`,
      });
      formData.append('termo_aceite[lido]', '1');
      formData.append('termo_aceite[data_aceite]', new Date().toISOString());
      formData.append('termo_aceite[conteudo_html]', termoTexto);
    }

    criancas.forEach((c, index) => {
      formData.append(`criancas_vinculadas[${index}][nome]`, c.nome);
      formData.append(
        `criancas_vinculadas[${index}][birth_date]`,
        formatForBackend(c.dataNascimento),
      );
      formData.append(`criancas_vinculadas[${index}][idade]`, c.idadeCalculada);
      formData.append(`criancas_vinculadas[${index}][gender_id]`, c.sexo);

      if (typeof c.parentesco === 'object') {
        formData.append(
          `criancas_vinculadas[${index}][parentesco][id]`,
          c.parentesco.id,
        );
        formData.append(
          `criancas_vinculadas[${index}][parentesco][name]`,
          c.parentesco.name,
        );
      } else {
        formData.append(
          `criancas_vinculadas[${index}][parentesco][name]`,
          c.parentesco,
        );
      }

      if (c.cpf) {
        formData.append(
          `criancas_vinculadas[${index}][cpf]`,
          c.cpf.replace(/\D/g, ''),
        );
      }
    });

    formData.append('data_hora', new Date().toISOString());

    return formData;
  };

  const handleSubmit = async () => {
    if (
      !participante.nome ||
      !participante.cpf ||
      !participante.telefone ||
      !participante.sexo
    ) {
      return Alert.alert(
        'Erro',
        'Preencha os dados do participante, incluindo sexo.',
      );
    }

    if (!validarIdadeParticipante()) return;

    if (hasTerm && !assinaturaBase64) {
      return Alert.alert('Erro', 'A assinatura é obrigatória.');
    }

    if (!currentEventId) {
      return Alert.alert('Erro', 'ID do evento perdido. Reinicie o processo.');
    }

    setLoadingSubmit(true);

    try {
      const token = await getAuthToken();
      const formData = buildFormData();

      await endpoint.postFreeListCheckin(currentEventId, formData, token);

      Orientation.lockToPortrait();

      Alert.alert('Pronto', 'Cadastro realizado com sucesso!', [
        {
          text: 'Ok',
          onPress: () => onSuccess?.(),
        },
      ]);
    } catch (error) {
      console.error('Erro detalhado:', error);
      let msg = 'Ocorreu um erro ao enviar.';

      if (error.response?.data?.errors) {
        const erros = error.response.data.errors;
        const primeiraMsg = Object.values(erros)[0];
        msg = Array.isArray(primeiraMsg) ? primeiraMsg[0] : primeiraMsg;
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.response?.status) {
        msg = `Erro ${error.response.status}`;
      }

      Alert.alert('Atenção', msg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return { handleSubmit, loadingSubmit };
}
