import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screen/Home';
import Event from '../screen/Event';
import Information from '../screen/Information';
import CustomTabBar from '../components/Ui/CustomTabBar'; // Ajuste o caminho da importação

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="Event"
        component={Event}
        options={{ tabBarLabel: 'Eventos' }}
      />
      <Tab.Screen
        name="Information"
        component={Information}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}
