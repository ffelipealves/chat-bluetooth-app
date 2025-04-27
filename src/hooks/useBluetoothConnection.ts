import { useState } from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Alert, Platform } from 'react-native';

export const useBluetoothConnection = () => {
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  const connectToDevice = async (device: any): Promise<any> => {
    try {
      const alreadyConnected = await device.isConnected();
      if (!alreadyConnected) {
        await device.connect({
          connectorType: 'rfcomm',
          delimiter: '\n',
          deviceCharset: Platform.OS === 'ios' ? 1536 : 'utf-8',
        });
      }
      setConnected(true);
      setConnectedDevice(device);
      Alert.alert('Conectado', `Conectado com: ${device.name || device.address}`);
      return device; // Retorna o dispositivo conectado
    } catch (error) {
      console.error('Erro ao conectar:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao dispositivo.');
      return null; // Retorna null se falhar
    }
  };

  const disconnectDevice = async () => {
    try {
      if (connectedDevice) {
        await connectedDevice.disconnect();
        setConnected(false);
        setConnectedDevice(null);
        Alert.alert('Desconectado', 'Desconectado com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      Alert.alert('Erro', 'Não foi possível desconectar.');
    }
  };

  return {
    connectedDevice,
    connected,
    connectToDevice,
    disconnectDevice,
  };
};
