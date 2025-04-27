import { useState } from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Alert } from 'react-native';

export const useServerConnection = () => {
  const [accepting, setAccepting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);

  const acceptConnections = async () => {
    setAccepting(true);
    try {
      const device = await RNBluetoothClassic.accept({});
      setConnectedDevice(device);
      Alert.alert('Dispositivo conectado', `Conectado com: ${device.name || device.address}`);
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

  return {
    accepting,
    connectedDevice,
    acceptConnections,
    cancelAcceptConnections,
  };
};
