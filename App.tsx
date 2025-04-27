import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ServerScreen from './src/screens/ServerScreen';
import ClientScreen from './src/screens/ClientScreen';
import ChatScreen from './src/screens/ChatScreen';

// Definindo os tipos das rotas
export type RootStackParamList = {
  Home: undefined;
  Servidor: undefined;
  Cliente: undefined;
  Chat: {device: any; isServer: boolean}; // A tela Chat espera os parâmetros 'device' e 'isServer'
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Servidor" component={ServerScreen} />
        <Stack.Screen name="Cliente" component={ClientScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
