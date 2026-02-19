import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Home from '../screen/Home';  
import Event from '../screen/Event';  
import Information from '../screen/Information';  
import { COLORS } from "../constants/theme";

const Tab = createBottomTabNavigator();

export default function App() {
  	return (
        <Tab.Navigator
			screenOptions={{
			tabBarActiveTintColor: COLORS.primary2, 
			tabBarInactiveTintColor: '#FFF', 
			tabBarStyle: {
				backgroundColor: COLORS.primary7, 
			},
			headerShown: false, 
			}}
     	>
			<Tab.Screen 
				name="Home" 
				component={Home} 
				options={{
					tabBarLabel: 'Início',  
					tabBarIcon: ({ color, size }) => (
					<Icon name="home-outline" color={color} size={size} />  
					),
				}}
			/>
			<Tab.Screen 
				name="Event" 
				component={Event} 
				options={{
					tabBarLabel: 'Meus Eventos',  
					tabBarIcon: ({ color, size }) => (
					<Icon name="grid-outline" color={color} size={size} />  
					),
				}} 
			/>
			<Tab.Screen 
				name="Information" 
				component={Information} 
				options={{
					tabBarLabel: 'Mais',  
					tabBarIcon: ({ color, size }) => (
					<Icon name="list-sharp" color={color} size={size} />  
					),
				}} 
			/>
      	</Tab.Navigator>
  	);
}