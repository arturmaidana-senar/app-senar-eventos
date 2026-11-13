import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AlertNotificationRoot } from '../components/Modals/CustomAlertModal';
import AuthContextProvider from '../contexts/auth';
import { COLORS } from '../constants/theme';
import CustomStatusBar from '../components/Ui/CustomStatusBar';
import StackNavigator from './StackNavigator';

export default function Profile() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthContextProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <CustomStatusBar
              backgroundColor={'#F6F7F2'}
              barStyle="light-content"
            />
            <AlertNotificationRoot>
              <StackNavigator />
            </AlertNotificationRoot>
          </GestureHandlerRootView>
        </AuthContextProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
