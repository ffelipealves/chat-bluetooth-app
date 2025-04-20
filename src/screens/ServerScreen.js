import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export default function ServerScreen({ navigation }){
  const [accepting, setAccepting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);

  const acceptConnections = async () => {
    setAccepting(true);
    try {
      const device = await RNBluetoothClassic.accept({});
      setConnectedDevice(device);
      Alert.alert('Dispositivo conectado', `Conectado com: ${device.name || device.address}`);
      navigation.navigate('Chat')
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
      Alert.alert('Erro', 'Falha ao aceitar conexão');
    } finally {
      setAccepting(false);
    }
  };

  const cancelAcceptConnections = async () => {
    if (!accepting) return;

    try {
      await RNBluetoothClassic.cancelAccept();
      setAccepting(false);
      Alert.alert('Cancelado', 'Aguardando conexão foi cancelado.');
    } catch (error) {
      console.error('Erro ao cancelar accept:', error);
      Alert.alert('Erro', 'Não foi possível cancelar o accept.');
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Modo Servidor</Text>

    <Button
      title={accepting ? 'Aguardando conexão...' : 'Aceitar conexão Bluetooth'}
      onPress={acceptConnections}
      disabled={accepting}
    />

    {accepting && (
      <View style={styles.buttonSpacing}>
        <Button title="Cancelar espera" onPress={cancelAcceptConnections} color="red" />
      </View>
    )}

    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
    },
    title: {
      fontSize: 24, marginBottom: 40,
    },
    buttonContainer: {
      marginVertical: 10, width: '80%',
    },
  });