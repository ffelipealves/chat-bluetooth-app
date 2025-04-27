// ServerScreen.tsx

import React, {useState} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {RootStackParamList} from '../../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useServerConnection} from '../hooks/useServerConnections'; // Importa o hook

type ServerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Servidor'
>;

type Props = {
  navigation: ServerScreenNavigationProp;
};

const ServerScreen: React.FC<Props> = ({navigation}) => {
  const {
    accepting,
    connectedDevice,
    acceptConnections,
    cancelAcceptConnections,
  } = useServerConnection();

  const handleConnectionSuccess = () => {
    // Aqui verificamos se um dispositivo foi conectado
    if (connectedDevice) {
      // Navegamos para a tela de chat passando o dispositivo e indicando que é o servidor
      navigation.navigate('Chat', {device: connectedDevice, isServer: true});
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modo Servidor</Text>

      <Button
        title={
          accepting ? 'Aguardando conexão...' : 'Aceitar conexão Bluetooth'
        }
        onPress={async () => {
          await acceptConnections(); // Chama o método do hook para aceitar conexões
          handleConnectionSuccess(); // Chama a navegação após a conexão bem-sucedida
        }}
        disabled={accepting}
      />

      {accepting && (
        <View style={styles.buttonSpacing}>
          <Button
            title="Cancelar espera"
            onPress={cancelAcceptConnections}
            color="red"
          />
        </View>
      )}
    </View>
  );
};

export default ServerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  buttonSpacing: {
    marginTop: 20,
  },
});
