import React, { useEffect, useState, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { setHeaderOptions } from '../../components/Ui/HeaderTitle';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import api from './../../services/endpont';
import LoadingInfo from '../../components/Ui/LoadingInfo';
import {
  Container,
  Title,
  Description,
  PinInputContainer,
  PinInput,
  ResendButton,
  ResendText,
  ContinueButton,
  ContinueButtonText,
  NoPinButton,
  NoPinButtonText,
} from './styles';

export default function ValidatePin() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cpf, name } = route.params || {};

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  // Refs para cada PinInput
  const inputRefs = useRef([]);

  async function handleResendCode() {
    try {
      setLoading(true);
      const response = await api.getRecoverPassword(cpf);
      if (response.error) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: response.message,
          button: 'Fechar',
        });
      }
      setPin('');
      return Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Sucesso',
        textBody: 'Token Reenviado no e-mail.',
        button: 'Fechar',
      });
    } catch (error) {
      return Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erro',
        textBody: error,
        button: 'Fechar',
      });
    } finally {
      setLoading(false);
    }
  }

  async function validatePin() {
    if (pin.length == 5) {
      try {
        setLoading(true);
        const response = await api.getVerifyToken(cpf, pin);
        if (response.error) {
          return Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: 'Erro',
            textBody: response.message,
            button: 'Fechar',
          });
        }
        const name = response.data.name;
        const userId = response.data.id;
        const tokenId = response.token_id;

        navigation.navigate('NewPassword', { name, userId, tokenId });
      } catch (error) {
        return Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erro',
          textBody: error,
          button: 'Fechar',
        });
      } finally {
        setLoading(false);
      }
    }
  }

  function handleNotResendCode() {
    return Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: 'Contato',
      textBody: 'Enviei um e-mail para suporte@senarmt.org.br',
      button: 'Fechar',
    });
  }

  useEffect(() => {
    setHeaderOptions(navigation, {
      headerTitle: 'Validar PIN',
      headerTitleStyle: { fontFamily: 'Arial', fontSize: 18, color: '#333333' },
      headerTintColor: '#333333',
    });
  }, [navigation]);

  // Determina a cor do botão com base no PIN
  const continueButtonColor = pin.length === 5 ? '#37C064' : '#D3D3D3';

  return (
    <Container>
      <LoadingInfo visible={loading} />
      <Title>Óla {name}</Title>
      <Description>
        Digite abaixo o código PIN que enviamos para o seu celular cadastrado.
      </Description>

      <PinInputContainer>
        {Array(5)
          .fill('')
          .map((_, index) => (
            <PinInput
              key={index}
              maxLength={1}
              keyboardType="numeric"
              value={pin[index] || ''}
              ref={ref => (inputRefs.current[index] = ref)} // Configura a referência
              onChangeText={text => {
                const newPin = pin.split('');
                newPin[index] = text;
                setPin(newPin.join(''));

                // Mover o foco para o próximo campo se houver
                if (text && index < 4) {
                  inputRefs.current[index + 1]?.focus();
                }
              }}
              onKeyPress={({ nativeEvent }) => {
                // Se o usuário pressionar Backspace e o campo estiver vazio, vá para o campo anterior
                if (
                  nativeEvent.key === 'Backspace' &&
                  !pin[index] &&
                  index > 0
                ) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
            />
          ))}
      </PinInputContainer>

      <Description>
        Te enviamos o código PIN por e-mail, mas confira também sua caixa de
        spam.
      </Description>

      <ResendButton onPress={handleResendCode}>
        <ResendText>Reenviar código</ResendText>
      </ResendButton>

      <ContinueButton
        onPress={validatePin}
        disabled={pin.length != 5}
        backgroundColor={continueButtonColor}
      >
        <ContinueButtonText>Continuar</ContinueButtonText>
      </ContinueButton>

      <NoPinButton onPress={handleNotResendCode}>
        <NoPinButtonText>Não recebi o PIN</NoPinButtonText>
      </NoPinButton>
    </Container>
  );
}
