import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignIn from '../screen/SignIn';
import Home from '../screen/Home';
import Preload from '../screen/Preload';
import ResetPassword from '../screen/ResetPassword';
import ValidatePin from '../screen/ValidatePin';
import NewPassword from '../screen/NewPassword';
import Service from '../screen/Service';
import EventShow from '../screen/EventShow';
import TabNavigator from './TabNavigator';
import Credential from '../screen/Credential';
import CredencialResponsavel from '../screen/Signature/ResponsibleSignature';

const StackComponent = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <>
      <StackComponent.Navigator
        initialRouteName="Preload"
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: '#FFF',
            elevation: 10,
            shadowOpacity: 0,
          },
        }}
      >
        <StackComponent.Screen name={'SignIn'} component={SignIn} />
        <StackComponent.Screen name={'Preload'} component={Preload} />
        <StackComponent.Screen name={'Home'} component={Home} />
        <StackComponent.Screen
          name={'CredencialmentoResponsavel'}
          component={CredencialResponsavel}
          options={{ headerShown: false }}
        />
        <StackComponent.Screen
          name={'ResetPassword'}
          component={ResetPassword}
          options={{ headerShown: true }}
        />
        <StackComponent.Screen
          name={'ValidatePin'}
          component={ValidatePin}
          options={{ headerShown: true }}
        />
        <StackComponent.Screen
          name={'NewPassword'}
          component={NewPassword}
          options={{ headerShown: true }}
        />
        <StackComponent.Screen
          name={'Service'}
          component={Service}
          options={{ headerShown: false, unmountOnBlur: true }}
        />
        <StackComponent.Screen
          name={'EventShow'}
          component={EventShow}
          options={{ headerShown: true }}
        />
        <StackComponent.Screen name={'TabNavigator'} component={TabNavigator} />
        <StackComponent.Screen
          name="Credential"
          component={Credential}
          options={{ title: 'Credenciamento', headerShown: false }}
        />
      </StackComponent.Navigator>
    </>
  );
};
export default StackNavigator;
